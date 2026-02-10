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

const MotionCard = motion(Card);

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [plan, setPlan] = useState<WeeklyPlan | null>(null);
    const [logs, setLogs] = useState<WorkoutLog[]>([]);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);

    // Select a random tip once per mount
    const randomTip = useMemo(() => {
        return dicasPro[Math.floor(Math.random() * dicasPro.length)];
    }, []);

    useEffect(() => {
        const init = async () => {
            await new Promise(r => setTimeout(r, 600)); // Slight delay for smoother entry
            const user = await DbService.getProfile();
            if (!user) {
                navigate('/onboarding');
                return;
            }
            setProfile(user);
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
            const newPlan = await generateWorkoutPlan(profile);
            await DbService.savePlan(newPlan);
            setPlan(newPlan);
        } catch (e) {
            alert("Falha ao gerar o plano. Verifique a conexão ou tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
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

    if (!profile) return null;

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
            // Finished the week, loop back or show "Done" (Looping back for MVP)
            nextDayIndex = 0;
        }
    }
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
                        Olá, {profile.name?.split(' ')[0] || "Atleta"}
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Vamos esmagar as metas hoje?
                    </p>
                </div>

                {/* Weekly Progress Widget */}
                <div className="bg-card border border-border/50 rounded-2xl p-4 w-full md:w-auto min-w-[280px] shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Meta Semanal</span>
                        <span className="text-sm font-bold text-primary">{workoutsThisWeek}/{profile.daysPerWeek}</span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary rounded-full"
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hero Card - Next Workout */}
                    {!plan ? (
                        <Card className="border-dashed border-2 bg-secondary/20 border-border">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                                <div className="bg-primary/10 p-5 rounded-full mb-6">
                                    <Play className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Nenhum plano ativo</h3>
                                <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
                                    A IA do CutCoach pode criar uma rotina personalizada para você agora mesmo.
                                </p>
                                <Button onClick={handleGeneratePlan} isLoading={loading} size="lg" className="px-8 shadow-glow">
                                    Gerar Plano Inteligente
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <motion.div
                            whileHover={cardHover}
                            onClick={() => navigate(`/workout/${nextDayIndex}`)}
                            className="cursor-pointer group relative h-[320px] rounded-3xl overflow-hidden shadow-xl shadow-primary/10"
                        >
                            {/* Video Background */}
                            {nextWorkout?.exercises?.[0]?.name && (
                                <video
                                    key={nextWorkout.exercises[0].name}
                                    src={`/videos/${nextWorkout.exercises[0].name.replace(/ /g, '_')}.mp4`}
                                    className="absolute inset-0 w-full h-full object-cover z-0"
                                    loop
                                    muted
                                    playsInline
                                    autoPlay
                                    onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
                                />
                            )}

                            {/* Gradient overlay for readability */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-slate-800/80 to-slate-900/90 z-[1]"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-[1]"></div>

                            {/* Decorative Icon */}
                            <div className="absolute -right-10 -bottom-10 z-[1] opacity-10">
                                <Dumbbell className="w-64 h-64 text-white rotate-[-15deg]" />
                            </div>

                            <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                                <div className="flex justify-between items-start">
                                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                                        <Play className="w-3 h-3 fill-current" /> Próximo Treino
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
                                        {nextWorkout?.focus}
                                    </h2>
                                    <div className="flex items-center gap-4 text-white/80 font-medium text-sm md:text-base">
                                        <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                                            <Clock className="w-4 h-4" /> {nextWorkout?.estimatedDuration} min
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                                            <Dumbbell className="w-4 h-4" /> {nextWorkout?.exercises.length} Exercícios
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-white/50 text-[10px] font-bold">
                                                {i}
                                            </div>
                                        ))}
                                        <div className="w-10 h-10 rounded-full bg-primary border-2 border-slate-800 flex items-center justify-center text-white font-bold pl-0.5 z-10 shadow-lg">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <button className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                        Iniciar Agora <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <MotionCard variants={itemFadeUp} className="bg-card hover:border-primary/30 transition-colors group">
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-orange-100/50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg group-hover:bg-orange-200/50 dark:group-hover:bg-orange-900/30 transition-colors">
                                        <Flame className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Calorias (Meta)</span>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-foreground tracking-tight">{calorieTarget}</div>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">kcal / dia (TDEE Ajustado)</p>
                                </div>
                            </CardContent>
                        </MotionCard>

                        <MotionCard variants={itemFadeUp} className="bg-card hover:border-blue-500/30 transition-colors group">
                            <CardContent className="p-5 flex flex-col justify-between h-full">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-200/50 dark:group-hover:bg-blue-900/30 transition-colors">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Frequência</span>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-foreground tracking-tight">
                                        {workoutsThisWeek} <span className="text-lg text-muted-foreground font-medium">/ {profile.daysPerWeek}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">Treinos na semana</p>
                                </div>
                            </CardContent>
                        </MotionCard>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">

                    {/* Profile Snapshot */}
                    <Card className="overflow-hidden border-0 shadow-lg">
                        <div className="h-24 bg-gradient-to-r from-slate-700 to-slate-800 relative"></div>
                        <CardContent className="px-6 pb-6 relative">
                            <div className="absolute -top-10 left-6">
                                <div className="w-20 h-20 rounded-full bg-card p-1.5 shadow-sm">
                                    <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-green-300 flex items-center justify-center text-white font-bold text-2xl">
                                        {profile.name?.[0] || "U"}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-12 mb-6">
                                <h3 className="font-bold text-xl text-foreground">{profile.name || "Usuário"}</h3>
                                <p className="text-sm text-muted-foreground font-medium">Nível {profile.experience === 'beginner' ? 'Iniciante' : profile.experience === 'intermediate' ? 'Intermediário' : 'Avançado'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-secondary/50 dark:bg-white/5 p-3 rounded-xl border border-border/50 text-center">
                                    <span className="block text-xs text-muted-foreground uppercase font-bold mb-1">Peso</span>
                                    <span className="text-lg font-bold text-foreground">{profile.weight} kg</span>
                                </div>
                                <div className="bg-secondary/50 dark:bg-white/5 p-3 rounded-xl border border-border/50 text-center">
                                    <span className="block text-xs text-muted-foreground uppercase font-bold mb-1">Cintura</span>
                                    <span className="text-lg font-bold text-foreground">{profile.waistSize || '--'} cm</span>
                                </div>
                            </div>

                            <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-wider h-10 border-border" onClick={() => navigate('/profile')}>
                                Ver Perfil Completo
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Activity Feed */}
                    <Card className="border-border/60">
                        <CardHeader className="pb-4 border-b border-border/40">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base">Histórico Recente</CardTitle>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/progress')} className="h-8 text-xs hover:bg-secondary">
                                    Ver tudo
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {history.length === 0 ? (
                                <div className="py-10 text-center px-6">
                                    <div className="inline-flex bg-secondary p-3 rounded-full mb-3 text-muted-foreground">
                                        <HistoryIcon className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">Nenhuma atividade registrada ainda.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/40">
                                    {history.slice(0, 4).map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30 dark:hover:bg-white/5 transition-colors">
                                            <div className={cn("p-2.5 rounded-xl shrink-0 border border-transparent",
                                                item.type === 'workout' ? 'bg-green-100/50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200/50 dark:border-green-800/30' :
                                                    item.type === 'weight' ? 'bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/30' :
                                                        'bg-secondary text-muted-foreground border-border'
                                            )}>
                                                {item.type === 'workout' ? <CheckCircle className="w-4 h-4" /> : item.type === 'weight' ? <TrendingUp className="w-4 h-4" /> : <HistoryIcon className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm truncate text-foreground">{item.title}</div>
                                                <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                                            </div>
                                            <div className="text-[10px] font-medium text-muted-foreground/70 whitespace-nowrap bg-secondary/50 px-2 py-1 rounded">
                                                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 mb-2">
                                <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Dica Pro</span>
                            </div>
                            <p className="text-sm text-foreground/80 font-medium leading-relaxed italic">
                                "{randomTip}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};