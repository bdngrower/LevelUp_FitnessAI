import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DbService } from '../services/db';
import { StorageService } from '../services/storage';
import { cn } from '../utils/cn';

const READ_IDS_KEY = 'levelup_read_notification_ids';

const getReadIds = (): Set<string> => {
    try {
        const raw = localStorage.getItem(READ_IDS_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
};

const saveReadIds = (ids: Set<string>) => {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
};

interface Notification {
    id: string;
    type: 'workout' | 'streak' | 'achievement' | 'tip' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
    icon: string;
}

const TIPS = [
    "Lembre-se de se hidratar durante o treino! 💧",
    "Dormir 7-9h é essencial para a recuperação muscular. 😴",
    "Proteína pós-treino ajuda na síntese muscular. 🥩",
    "Treinos compostos queimam mais calorias que isolados. 🔥",
    "Consistência supera intensidade no longo prazo. 💪",
    "Aqueça sempre antes de treinar para evitar lesões. 🏃",
    "Varie os exercícios a cada 4-6 semanas. 🔄",
];

const generateNotifications = async (): Promise<Notification[]> => {
    const notifications: Notification[] = [];
    const now = new Date();
    const profile = StorageService.getProfile();

    try {
        const [logs, plan] = await Promise.all([
            DbService.getWorkoutLogs(),
            DbService.getPlan()
        ]);

        // 1. Check last workout
        if (logs.length > 0) {
            const lastLog = logs[logs.length - 1];
            const lastDate = new Date(lastLog.date);
            const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSince === 0) {
                notifications.push({
                    id: 'workout-today',
                    type: 'workout',
                    title: 'Treino Concluído! 💪',
                    message: `Você completou o treino de hoje em ${lastLog.durationMinutes} minutos. Excelente!`,
                    time: 'Hoje',
                    read: false,
                    icon: '🏋️',
                });
            } else if (daysSince === 1) {
                notifications.push({
                    id: 'workout-yesterday',
                    type: 'workout',
                    title: 'Hora de Treinar!',
                    message: 'Seu último treino foi ontem. Mantenha a consistência!',
                    time: 'Ontem',
                    read: false,
                    icon: '⏰',
                });
            } else if (daysSince >= 2) {
                notifications.push({
                    id: 'workout-missed',
                    type: 'streak',
                    title: `${daysSince} Dias Sem Treinar`,
                    message: 'Não perca o ritmo! Volte hoje e retome sua rotina.',
                    time: `${daysSince} dias atrás`,
                    read: false,
                    icon: '⚠️',
                });
            }
        } else {
            // No workouts ever
            notifications.push({
                id: 'first-workout',
                type: 'system',
                title: 'Comece Sua Jornada! 🚀',
                message: 'Você ainda não registrou nenhum treino. Vamos começar?',
                time: 'Agora',
                read: false,
                icon: '🎯',
            });
        }

        // 2. Weekly progress
        if (profile && logs.length > 0) {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const workoutsThisWeek = logs.filter(l => new Date(l.date) >= startOfWeek).length;
            const target = profile.daysPerWeek || 4;

            if (workoutsThisWeek >= target) {
                notifications.push({
                    id: 'week-complete',
                    type: 'achievement',
                    title: 'Meta Semanal Batida! 🏆',
                    message: `Você completou ${workoutsThisWeek}/${target} treinos essa semana. Parabéns!`,
                    time: 'Esta semana',
                    read: false,
                    icon: '🏅',
                });
            } else if (workoutsThisWeek > 0) {
                const remaining = target - workoutsThisWeek;
                notifications.push({
                    id: 'week-progress',
                    type: 'streak',
                    title: `Faltam ${remaining} Treino${remaining > 1 ? 's' : ''}`,
                    message: `Progresso: ${workoutsThisWeek}/${target} treinos essa semana. Continue firme!`,
                    time: 'Esta semana',
                    read: true,
                    icon: '📊',
                });
            }
        }

        // 3. Plan status
        if (!plan) {
            notifications.push({
                id: 'no-plan',
                type: 'system',
                title: 'Sem Plano Ativo',
                message: 'Gere um novo plano de treino personalizado com IA na página Início.',
                time: 'Pendente',
                read: true,
                icon: '📋',
            });
        } else {
            const planDate = new Date(plan.createdAt);
            const daysSincePlan = Math.floor((now.getTime() - planDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSincePlan >= 21) {
                notifications.push({
                    id: 'plan-old',
                    type: 'tip',
                    title: 'Hora de Renovar o Plano',
                    message: `Seu plano atual tem ${daysSincePlan} dias. Considere gerar um novo para continuar progredindo.`,
                    time: `${daysSincePlan}d atrás`,
                    read: true,
                    icon: '🔄',
                });
            }
        }

        // 4. Daily tip
        const tipIdx = now.getDate() % TIPS.length;
        notifications.push({
            id: 'daily-tip',
            type: 'tip',
            title: 'Dica do Dia',
            message: TIPS[tipIdx],
            time: 'Hoje',
            read: true,
            icon: '💡',
        });

        // ===== ACHIEVEMENT SYSTEM =====
        if (logs.length > 0) {
            // A. Total Volume (weight × reps × sets)
            const totalVolume = logs.reduce((sum, log) => {
                return sum + log.completedExercises.reduce((s, ex) => {
                    return s + (ex.weightUsed * ex.repsCompleted * ex.setsCompleted);
                }, 0);
            }, 0);

            const volumeMilestones = [
                { threshold: 50000, label: '50.000kg', emoji: '🌋' },
                { threshold: 25000, label: '25.000kg', emoji: '🏔️' },
                { threshold: 10000, label: '10.000kg', emoji: '🚀' },
                { threshold: 5000, label: '5.000kg', emoji: '💎' },
                { threshold: 1000, label: '1.000kg', emoji: '🔥' },
                { threshold: 500, label: '500kg', emoji: '💪' },
            ];

            for (const m of volumeMilestones) {
                if (totalVolume >= m.threshold) {
                    notifications.push({
                        id: `volume-${m.threshold}`,
                        type: 'achievement',
                        title: `${m.emoji} ${m.label} Levantados!`,
                        message: `Você já moveu ${Math.round(totalVolume).toLocaleString()}kg no total. Máquina!`,
                        time: 'Conquista',
                        read: true,
                        icon: '🏋️',
                    });
                    break; // Show only the highest milestone
                }
            }

            // B. Consecutive Day Streak
            const sortedDates = [...new Set(
                logs.map(l => new Date(l.date).toISOString().split('T')[0])
            )].sort().reverse();

            let streak = 1;
            const today = now.toISOString().split('T')[0];
            const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

            if (sortedDates[0] === today || sortedDates[0] === yesterday) {
                for (let i = 1; i < sortedDates.length; i++) {
                    const curr = new Date(sortedDates[i - 1]);
                    const prev = new Date(sortedDates[i]);
                    const diff = Math.round((curr.getTime() - prev.getTime()) / 86400000);
                    if (diff === 1) {
                        streak++;
                    } else {
                        break;
                    }
                }

                if (streak >= 3) {
                    notifications.push({
                        id: `streak-${streak}`,
                        type: 'streak',
                        title: `🔥 ${streak} Dias Seguidos!`,
                        message: streak >= 30 ? 'Você é imparável! Lendário!' :
                            streak >= 14 ? 'Duas semanas sem falha! Impressionante!' :
                                streak >= 7 ? 'Uma semana inteira! Consistência é tudo!' :
                                    'Mantendo o ritmo! Continue assim!',
                        time: 'Conquista',
                        read: false,
                        icon: '🔥',
                    });
                }
            }

            // C. Total Workouts Milestones
            const workoutMilestones = [
                { count: 100, msg: 'Centenário! Você é uma lenda da academia!' },
                { count: 50, msg: '50 treinos! Meio caminho para 100!' },
                { count: 25, msg: '25 treinos completos! O hábito está formado!' },
                { count: 10, msg: '10 treinos! Você está criando uma rotina sólida!' },
                { count: 5, msg: '5 treinos no bolso! Bom começo!' },
            ];

            for (const m of workoutMilestones) {
                if (logs.length >= m.count) {
                    notifications.push({
                        id: `workouts-${m.count}`,
                        type: 'achievement',
                        title: `🎯 ${m.count} Treinos Completos!`,
                        message: m.msg,
                        time: 'Conquista',
                        read: true,
                        icon: '🏅',
                    });
                    break; // Show only the highest
                }
            }

            // D. Total Training Hours
            const totalMinutes = logs.reduce((sum, l) => sum + (l.durationMinutes || 0), 0);
            const totalHours = Math.floor(totalMinutes / 60);

            if (totalHours >= 1) {
                const hourMilestones = [100, 50, 25, 10, 5, 1];
                for (const h of hourMilestones) {
                    if (totalHours >= h) {
                        notifications.push({
                            id: `hours-${h}`,
                            type: 'achievement',
                            title: `⏱️ ${totalHours}h de Treino!`,
                            message: totalHours >= 50 ? 'Dedicação de atleta profissional!' :
                                totalHours >= 10 ? 'Horas e horas de evolução!' :
                                    'Cada hora conta na sua transformação!',
                            time: 'Conquista',
                            read: true,
                            icon: '⏱️',
                        });
                        break;
                    }
                }
            }
        }
    } catch (err) {
        console.error('Error generating notifications:', err);
    }

    return notifications;
};

const typeColors: Record<string, string> = {
    workout: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
    streak: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    achievement: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
    tip: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
    system: 'bg-gray-500/10 text-gray-400 ring-gray-500/20',
};

export const NotificationPanel: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const loadAndApplyReadState = async () => {
        const notifs = await generateNotifications();
        const readIds = getReadIds();
        return notifs.map(n => ({ ...n, read: n.read || readIds.has(n.id) }));
    };

    useEffect(() => {
        const load = async () => {
            const notifs = await loadAndApplyReadState();
            setNotifications(notifs);
        };
        load();
    }, []);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleOpen = async () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setLoading(true);
            const notifs = await loadAndApplyReadState();
            setNotifications(notifs);
            setLoading(false);
        }
    };

    const markAllRead = () => {
        const readIds = getReadIds();
        notifications.forEach(n => readIds.add(n.id));
        saveReadIds(readIds);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="relative" ref={panelRef}>
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className={cn(
                    "relative p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95",
                    isOpen && "bg-secondary text-foreground"
                )}
            >
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-primary rounded-full ring-2 ring-background flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground leading-none">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </span>
                )}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            </button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-[360px] max-h-[480px] bg-card/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Notificações</h3>
                                {unreadCount > 0 && (
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {unreadCount} não lida{unreadCount > 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                                >
                                    Marcar todas como lidas
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-[380px] divide-y divide-border/20">
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                    <span className="text-3xl mb-3">🔔</span>
                                    <p className="text-sm font-medium text-muted-foreground">Nenhuma notificação</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Suas notificações aparecerão aqui</p>
                                </div>
                            ) : (
                                notifications.map((notif, i) => (
                                    <motion.div
                                        key={notif.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.04 }}
                                        className={cn(
                                            "flex items-start gap-3.5 px-5 py-4 hover:bg-white/[0.03] transition-colors cursor-default",
                                            !notif.read && "bg-primary/[0.03]"
                                        )}
                                    >
                                        <div className={cn("shrink-0 w-9 h-9 rounded-xl ring-1 flex items-center justify-center text-base", typeColors[notif.type])}>
                                            {notif.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[13px] font-semibold text-foreground truncate">{notif.title}</span>
                                                {!notif.read && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{notif.message}</p>
                                            <span className="text-[10px] text-muted-foreground/50 font-medium mt-1.5 block">{notif.time}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
