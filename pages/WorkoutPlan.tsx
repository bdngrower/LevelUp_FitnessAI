import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DbService } from '../services/db';
import { WeeklyPlan } from '../types';
import { pageVariants, containerStagger, itemFadeUp, cardHover } from '../utils/motion';
import { Card } from '../components/ui/Card';
import { Clock, Dumbbell, Play, Flame, Calendar, ChevronRight } from '../components/Icons';
import { Button } from '../components/ui/Button';

import { Skeleton } from '../components/ui/Skeleton';

export const WorkoutPlan: React.FC = () => {
    const [plan, setPlan] = useState<WeeklyPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const p = await DbService.getPlan();
                setPlan(p);
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, []);

    if (loading) {
        return (
            <div className="p-6 md:p-8 pb-24 max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="mb-10 space-y-3">
                    <Skeleton className="h-10 w-64 rounded-lg" />
                    <Skeleton className="h-6 w-48 rounded-lg" />
                </div>
                <div className="space-y-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-border/50 bg-card p-6 h-48 flex flex-col justify-between">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-3/4 rounded-md" />
                                <div className="flex gap-3">
                                    <Skeleton className="h-6 w-20 rounded-md" />
                                    <Skeleton className="h-6 w-24 rounded-md" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-full rounded-md opacity-50" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!plan) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
            <div className="bg-secondary p-8 rounded-full mb-6">
                <Calendar className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Seu plano está vazio</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
                Vá para o Dashboard e gere uma rotina personalizada com IA para começar sua jornada.
            </p>
            <Button onClick={() => navigate('/')} size="lg" className="px-8 shadow-lg">
                Ir para o Início
            </Button>
        </div>
    );

    return (
        <motion.div
            className="p-6 md:p-8 pb-24 max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <div className="mb-10">
                <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">Agenda de Treinos</h2>
                <p className="text-muted-foreground font-medium text-lg">
                    Seu plano atual tem <span className="text-primary font-bold">{plan.days.length} dias</span> de atividade por semana.
                </p>
            </div>

            <motion.div
                className="space-y-5"
                variants={containerStagger}
                initial="hidden"
                animate="show"
            >
                {plan.days.map((day, i) => (
                    <motion.div
                        key={day.id}
                        variants={itemFadeUp}
                        whileHover={cardHover}
                        className="group"
                    >
                        <Card className="overflow-hidden border-border/60 hover:border-primary/40 transition-all cursor-pointer shadow-sm hover:shadow-md bg-card" onClick={() => navigate(`/workout/${i}`)}>
                            <div className="flex flex-col sm:flex-row">
                                {/* Day Indicator - Dark Mode Fixed */}
                                <div className="sm:w-28 bg-secondary/50 dark:bg-white/5 border-b sm:border-b-0 sm:border-r border-border/60 flex flex-row sm:flex-col items-center justify-center p-4 gap-3">
                                    <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider bg-background border border-border/50 px-2 py-0.5 rounded shadow-sm">Dia</span>
                                    <span className="text-4xl font-black text-foreground/20 group-hover:text-primary transition-colors">{i + 1}</span>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 p-6 flex flex-col justify-center">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                                        <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors leading-tight">
                                            {day.focus}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground bg-secondary/50 dark:bg-white/5 px-2.5 py-1 rounded-md border border-border/50">
                                                <Clock className="w-3.5 h-3.5" /> {day.estimatedDuration} min
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-border/60 bg-secondary/30 text-muted-foreground">
                                            <Dumbbell className="w-3.5 h-3.5" /> {day.exercises.length} Exercícios
                                        </span>
                                        {day.cardio && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400">
                                                <Flame className="w-3.5 h-3.5" /> {day.cardio.type}
                                            </span>
                                        )}
                                    </div>

                                    {/* Preview List - Translucent Background */}
                                    <div className="bg-secondary/30 dark:bg-white/5 rounded-lg p-3 border border-border/30">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mb-1.5">Resumo do Treino</p>
                                        <p className="text-sm text-foreground/80 line-clamp-1 overflow-hidden text-ellipsis">
                                            {day.exercises.map(e => e.name).join(" • ")}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Area (Desktop) */}
                                <div className="hidden sm:flex items-center justify-center w-24 border-l border-border/40 bg-secondary/10 dark:bg-white/5 group-hover:bg-primary/5 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground group-hover:scale-110 group-hover:border-primary group-hover:text-primary transition-all">
                                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Button */}
                            <div className="sm:hidden border-t border-border/60 p-4 bg-secondary/30 dark:bg-white/5">
                                <Button size="md" className="w-full font-bold shadow-sm" variant="secondary">
                                    Iniciar Treino <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};