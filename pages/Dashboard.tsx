import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DbService } from '../services/db';
import { UserProfile, WeeklyPlan, WorkoutLog, HistoryItem } from '../types';
import { calculateTDEE, getCalorieTarget } from '../services/calculations';
import { Flame, Play, CheckCircle, Calendar, HistoryIcon, TrendingUp, Dumbbell, ChevronRight, Clock } from '../components/Icons';
import { generateWorkoutPlan } from '../services/aiPlanner';
import { pageVariants, containerStagger, itemFadeUp, cardHover } from '../utils/motion';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { cn } from '../utils/cn';
import { dicasPro } from '../data/tips';
import { WeekCompleteModal } from '../components/WeekCompleteModal';

const MotionCard = motion(Card);

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [plan, setPlan] = useState<WeeklyPlan | null>(null);
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [showWeekCompleteModal, setShowWeekCompleteModal] = useState(false);

    // Select a random tip once per mount
    const randomTip = useMemo(() => {
        return dicasPro[Math.floor(Math.random() * dicasPro.length)];
    }, []);

    useEffect(() => {
        const init = async () => {
            // Removed artificial delay for faster loading
            const user = await DbService.getProfile();
            if (!user) {
                navigate('/onboarding');
                return;
            }
            setProfile(user);
            // ... (rest of init)
            const [fetchedPlan, fetchedLogs, fetchedHistory] = await Promise.all([
                DbService.getPlan(),
                DbService.getWorkoutLogs(),
                DbService.getHistory()
            ]);
            setPlan(fetchedPlan);
            setLogs(fetchedLogs);
            setHistory(fetchedHistory);
            setInitializing(false);
        };
        init();
    }, [navigate]);

    const handleGeneratePlan = async () => {
        if (!profile) return;
        setLoading(true);
        try {
            let context = "";
            let previousExercises: string[] = [];

            // 1. Contexto de Progressão
            if (showWeekCompleteModal) {
                context = `O aluno completou a semana anterior com ${workoutsThisWeek}/${profile.daysPerWeek} treinos realizados (${Math.round(progressPercentage)}% de consistência). O foco agora é progredir cargas e manter a constância.`;
            }

            // 2. Coletar exercícios anteriores para garantir variedade
            if (plan) {
                // Se tem plano ativo (que está sendo concluído/substituído), usa ele como referência
                previousExercises = plan.days.flatMap(d => d.exercises.map(e => e.name));
            } else {
                // Se não tem plano ativo, tenta pegar do histórico
                const pastPlans = await DbService.getPastPlans();
                if (pastPlans.length > 0) {
                    const lastPlanId = pastPlans[0].id;
                    const fullLastPlan = await DbService.getPlanById(lastPlanId);
                    if (fullLastPlan) {
                        previousExercises = fullLastPlan.days.flatMap(d => d.exercises.map(e => e.name));
                    }
                }
            }

            const newPlan = await generateWorkoutPlan(profile, context, previousExercises);
            await DbService.savePlan(newPlan);
            setPlan(newPlan);
            setShowWeekCompleteModal(false);
        } catch (e) {
            console.error(e);
            alert("Falha ao gerar o plano. Verifique a conexão ou tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!logs.length || !plan) return;
        const lastLog = logs[logs.length - 1];
        const lastDayId = parseInt(lastLog.dayId);

        if (lastDayId === plan.days.length - 1) {
            const isToday = new Date(lastLog.date).toDateString() === new Date().toDateString();
            const hasSeen = sessionStorage.getItem(`week_completed_${plan.id}_${lastLog.date}`);
            if (isToday && !hasSeen) {
                setShowWeekCompleteModal(true);
                sessionStorage.setItem(`week_completed_${plan.id}_${lastLog.date}`, 'true');
            }
        }
    }, [logs, plan]);

    if (initializing || !profile) {
        return (
            <div className="p-6 space-y-6 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48 rounded-lg" />
                        <Skeleton className="h-4 w-32 rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-full" />
                </div>
                <Skeleton className="h-72 w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
            </div>
        )
    }

    const tdee = calculateTDEE(profile);
    const calorieTarget = getCalorieTarget(tdee);

    // Weekly adherence calculation
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = logs.filter(l => new Date(l.date) >= startOfWeek).length;
    const progressPercentage = Math.min((workoutsThisWeek / profile.daysPerWeek) * 100, 100);

    // Find next workout logic
    const lastLog = logs[logs.length - 1];
    let nextDayIndex = 0;
    if (lastLog && plan) {
        const lastDayId = parseInt(lastLog.dayId);
        if (!isNaN(lastDayId) && lastDayId < plan.days.length - 1) {
            nextDayIndex = lastDayId + 1;
        } else if (!isNaN(lastDayId) && lastDayId === plan.days.length - 1) {
            // Finished the week
            nextDayIndex = 0;
        }
    }



    const handleRepeatWeek = () => {
        setShowWeekCompleteModal(false);
        // Visual feedback or toast could go here
    };

    const handleAdjustSettings = () => {
        setShowWeekCompleteModal(false);
        navigate('/settings');
    };
    const nextWorkout = plan?.days[nextDayIndex];

    return (
        <motion.div
            className="p-4 md:p-8 space-y-8 max-w-6xl mx-auto pb-24"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                        {(() => {
                            const hour = new Date().getHours();
                            const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
                            const firstName = profile.name ? profile.name.split(' ')[0] : 'Atleta';
                            return `${greeting}, ${firstName} 👋`;
                        })()}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Vamos esmagar as metas hoje?
                    </p>
                </div>

                {/* Weekly Progress Widget */}
                <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-4 w-full md:w-auto min-w-[280px] shadow-lg shadow-black/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Meta Semanal</span>
                        <span className="text-sm font-bold text-primary">{workoutsThisWeek}/{profile.daysPerWeek}</span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 text-right">
                        {progressPercentage >= 100 ? "Meta batida! 🔥" : "Mantenha o foco!"}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">

                {/* Main Content Area - Full Width on Mobile, Col-Span-8 on Desktop */}
                <div className="md:col-span-12 lg:col-span-8 space-y-6 md:space-y-8">

                    {/* Quick Stats Row - Mobile Only (Visible on Desktop via Sidebar usually, but good here too) */}
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                        <MotionCard variants={itemFadeUp} className="bg-card/40 backdrop-blur-xl border border-white/5 hover:border-primary/20 transition-all duration-300 group shadow-lg shadow-black/5">
                            <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-3 md:mb-4">
                                    <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl group-hover:bg-orange-500/20 transition-colors shrink-0 ring-1 ring-orange-500/20">
                                        <Flame className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] font-extrabold uppercase text-muted-foreground/80 tracking-widest truncate">Calorias</span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tighter truncate">{calorieTarget}</div>
                                    <p className="text-xs text-muted-foreground font-medium mt-1 truncate">kcal / dia</p>
                                </div>
                            </CardContent>
                        </MotionCard>

                        <MotionCard variants={itemFadeUp} className="bg-card/40 backdrop-blur-xl border border-white/5 hover:border-blue-500/20 transition-all duration-300 group shadow-lg shadow-black/5">
                            <CardContent className="p-5 md:p-6 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-3 md:mb-4">
                                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl group-hover:bg-blue-500/20 transition-colors shrink-0 ring-1 ring-blue-500/20">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] md:text-[11px] font-extrabold uppercase text-muted-foreground/80 tracking-widest truncate">Frequência</span>
                                </div>
                                <div className="min-w-0">
                                    <div className="text-2xl md:text-3xl lg:text-4xl font-black text-foreground tracking-tighter truncate">
                                        {workoutsThisWeek} <span className="text-lg md:text-xl text-muted-foreground/50 font-medium">/ {profile.daysPerWeek}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mt-1 truncate">Treinos na semana</p>
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>

                    {/* Hero Card - Next Workout */}
                    {!plan ? (
                        <Card className="border-dashed border-2 bg-secondary/20 border-border/50 backdrop-blur-sm">
                            <CardContent className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
                                <div className="bg-primary/10 p-4 md:p-5 rounded-full mb-4 md:mb-6 ring-1 ring-primary/20">
                                    <Play className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold mb-2">Nenhum plano ativo</h3>
                                <p className="text-muted-foreground max-w-sm mb-6 md:mb-8 text-sm leading-relaxed px-4">
                                    A IA do LevelUp pode criar uma rotina personalizada para você agora mesmo.
                                </p>
                                <Button onClick={handleGeneratePlan} isLoading={loading} size="lg" className="px-8 shadow-lg shadow-primary/20 w-full md:w-auto">
                                    Gerar Plano Inteligente
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <motion.div
                            whileHover={cardHover}
                            onClick={() => navigate(`/workout/${nextDayIndex}`)}
                            className="cursor-pointer group relative h-[400px] md:h-[360px] rounded-3xl overflow-hidden shadow-2xl shadow-black/20 ring-1 ring-white/10"
                        >
                            {/* Video Background */}
                            {nextWorkout?.exercises?.[0]?.name && (
                                <video
                                    key={nextWorkout.exercises[0].name}
                                    src={`/videos/${nextWorkout.exercises[0].name.replace(/ /g, '_')}.mp4`}
                                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 group-hover:opacity-50 transition-opacity duration-700"
                                    loop
                                    muted
                                    playsInline
                                    autoPlay
                                    onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
                                />
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-[1]"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-transparent z-[1]"></div>

                            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end md:justify-between z-10">
                                <div className="hidden md:flex justify-between items-start">
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                                        <Play className="w-3 h-3 fill-current" /> Próximo Treino
                                    </div>
                                </div>

                                <div>
                                    <div className="md:hidden mb-4">
                                        <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md border border-primary/20 px-3 py-1 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                                            <Play className="w-3 h-3 fill-current" /> Próximo
                                        </div>
                                    </div>

                                    <h2 className="text-3xl md:text-5xl font-black text-white mb-3 leading-[0.9] tracking-tighter shadow-black/50 drop-shadow-sm">
                                        {nextWorkout?.focus}
                                    </h2>

                                    <div className="flex flex-wrap items-center gap-3 text-white/80 font-medium text-sm md:text-base mb-6">
                                        <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                                            <Clock className="w-4 h-4 text-primary" /> {nextWorkout?.estimatedDuration} min
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-secondary/50 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5">
                                            <Dumbbell className="w-4 h-4 text-primary" /> {nextWorkout?.exercises.length} Exercícios
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2 md:-space-x-3 overflow-hidden">
                                            {nextWorkout?.exercises.slice(0, 4).map((ex, i) => (
                                                <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase first:text-primary">
                                                    {ex.name[0]}
                                                </div>
                                            ))}
                                            {nextWorkout?.exercises.length > 4 && (
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                                    +{nextWorkout.exercises.length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 md:px-6 md:py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                            Iniciar <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar Column - On Mobile acts as secondary content */}
                <div className="md:col-span-12 lg:col-span-4 space-y-6">

                    {/* Pro Tip Widget */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20 relative overflow-hidden backdrop-blur-sm">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 mb-2">
                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-sm">Dica Pro</span>
                            </div>
                            <p className="text-sm text-foreground/80 font-medium leading-relaxed italic">
                                "{randomTip}"
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-5">
                            <Dumbbell className="w-24 h-24 -rotate-12 translate-x-4 translate-y-4" />
                        </div>
                    </div>

                    {/* Activity Feed */}
                    <Card className="bg-card/40 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/5">
                        <CardHeader className="pb-4 border-b border-white/5 px-5 pt-5">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <HistoryIcon className="w-4 h-4 text-primary" /> Histórico Recente
                                </CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/progress')} className="h-8 text-xs hover:bg-white/5">
                                    Ver tudo
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {history.length === 0 ? (
                                <div className="py-12 text-center px-6">
                                    <div className="inline-flex bg-secondary p-3 rounded-full mb-3 text-muted-foreground animate-pulse">
                                        <HistoryIcon className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">Bora treinar hoje?</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {history.slice(0, 5).map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors">
                                            <div className={cn("p-2.5 rounded-xl shrink-0 border border-transparent shadow-sm",
                                                item.type === 'workout' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                                                    item.type === 'weight' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' :
                                                        'bg-secondary text-muted-foreground border-border'
                                            )}>
                                                {item.type === 'workout' ? <CheckCircle className="w-4 h-4" /> : item.type === 'weight' ? <TrendingUp className="w-4 h-4" /> : <HistoryIcon className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm truncate text-foreground">{item.title}</div>
                                                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                                            </div>
                                            <div className="text-[10px] font-medium text-muted-foreground/70 whitespace-nowrap">
                                                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <WeekCompleteModal
                isOpen={showWeekCompleteModal}
                onClose={() => setShowWeekCompleteModal(false)}
                onGenerateNewPlan={handleGeneratePlan}
                onRepeatWeek={handleRepeatWeek}
                onAdjustSettings={handleAdjustSettings}
                stats={{
                    workoutsCompleted: workoutsThisWeek,
                    totalWorkouts: profile.daysPerWeek,
                    consistency: Math.round(progressPercentage)
                }}
            />
        </motion.div>
    );
};