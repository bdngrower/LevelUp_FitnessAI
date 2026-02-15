import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DbService } from '../services/db';
import { WeeklyPlan } from '../types';
import { pageVariants, itemFadeUp } from '../utils/motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Calendar, CheckCircle, Clock, HistoryIcon, ArrowRight, RefreshCw } from '../components/Icons';
import { Skeleton } from '../components/ui/Skeleton';
import { LoadingScreen } from '../components/LoadingScreen';

export const PlanHistory: React.FC = () => {
    const [history, setHistory] = useState<WeeklyPlan[]>([]);
    const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [activatingId, setActivatingId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [curr, past] = await Promise.all([
                    DbService.getPlan(),
                    DbService.getPastPlans()
                ]);
                setCurrentPlan(curr);
                setHistory(past);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleActivate = async (planId: string) => {
        if (!confirm("Tem certeza? Isso substituirá seu plano atual.")) return;
        setActivatingId(planId);
        try {
            await DbService.activatePlan(planId);
            // Reload page state or navigate
            navigate(0); // Simple reload to refresh state
        } catch (error) {
            alert("Erro ao ativar plano.");
            setActivatingId(null);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <motion.div
            className="p-6 md:p-8 pb-24 max-w-4xl mx-auto space-y-8"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            <header>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <HistoryIcon className="w-8 h-8 text-primary" /> Histórico de Planos
                </h1>
                <p className="text-muted-foreground mt-2">
                    Revise sua evolução e restaure planos antigos se necessário.
                </p>
            </header>

            {/* Current Plan */}
            <section>
                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider mb-4 px-1">Plano Ativo</h2>
                {currentPlan ? (
                    <Card className="border-primary/50 bg-primary/5 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3">
                            <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Atual
                            </span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">Weekly Plan</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Criado em {new Date(currentPlan.createdAt).toLocaleDateString()}
                            </p>
                            <div className="flex gap-4 mb-4">
                                <div className="text-sm font-medium bg-background/50 px-3 py-1.5 rounded-md border border-primary/20">
                                    {currentPlan.days.length} Dias / Semana
                                </div>
                            </div>
                            <Button onClick={() => navigate('/plan')} size="sm" className="gap-2">
                                Ver Detalhes <ArrowRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="p-6 border border-dashed border-border rounded-xl text-center text-muted-foreground">
                        Nenhum plano ativo.
                    </div>
                )}
            </section>

            {/* History List */}
            <section>
                <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider mb-4 px-1">Arquivados</h2>
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <p className="text-muted-foreground text-sm pl-1">Nenhum histórico encontrado.</p>
                    ) : (
                        history.map((plan, i) => (
                            <motion.div key={plan.id} variants={itemFadeUp} custom={i}>
                                <Card className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-border/80 transition-colors">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-semibold text-foreground">Plano de Treino</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Gerado em {new Date(plan.createdAt).toLocaleDateString()} às {new Date(plan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleActivate(plan.id)}
                                        isLoading={activatingId === plan.id}
                                        className="w-full sm:w-auto hover:border-primary hover:text-primary transition-colors"
                                    >
                                        <RefreshCw className="w-4 h-4 mr-2" /> Restaurar
                                    </Button>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>
        </motion.div>
    );
};
