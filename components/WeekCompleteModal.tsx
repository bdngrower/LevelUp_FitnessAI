import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, RefreshCw, Trophy, ArrowRight, Settings } from './Icons';
import { Button } from './ui/Button'; // Assuming you have a Button component or use standard HTML button
import { cn } from '../utils/cn';

interface WeekCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onGenerateNewPlan: () => void;
    onRepeatWeek: () => void;
    onAdjustSettings: () => void;
    stats: {
        workoutsCompleted: number;
        totalWorkouts: number;
        consistency: number; // percentage
    };
}

export const WeekCompleteModal: React.FC<WeekCompleteModalProps> = ({
    isOpen,
    onClose,
    onGenerateNewPlan,
    onRepeatWeek,
    onAdjustSettings,
    stats
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 isolate">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
                >
                    {/* Confetti / Celebration Header */}
                    <div className="relative h-32 bg-gradient-to-br from-primary via-primary/80 to-purple-600 flex items-center justify-center overflow-hidden">

                        {/* Decorative Circles */}
                        <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl" />

                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="relative z-10 bg-white p-4 rounded-full shadow-lg"
                        >
                            <Trophy className="w-10 h-10 text-primary fill-primary/20" />
                        </motion.div>
                    </div>

                    <div className="p-6 md:p-8 text-center">
                        <h2 className="text-2xl font-black text-foreground mb-2">Semana Concluída!</h2>
                        <p className="text-muted-foreground mb-6">Você detonou essa semana. Veja só o seu resultado:</p>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            <div className="bg-secondary/50 p-3 rounded-2xl border border-border/50">
                                <div className="text-2xl font-black text-primary mb-1">{stats.workoutsCompleted}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">Treinos</div>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-2xl border border-border/50">
                                <div className="text-2xl font-black text-green-500 mb-1">{stats.consistency}%</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">Foco</div>
                            </div>
                            <div className="bg-secondary/50 p-3 rounded-2xl border border-border/50">
                                <div className="text-2xl font-black text-orange-500 mb-1">
                                    <Star className="w-5 h-5 inline-block -mt-1 fill-current" />
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase">XP</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={onGenerateNewPlan}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <TrendingUp className="w-5 h-5" />
                                Subir de Nível (Gerar Novo Plano)
                            </button>

                            <button
                                onClick={onRepeatWeek}
                                className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-3 px-4 rounded-xl border border-border/50 flex items-center justify-center gap-2 transition-all"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Manter o Ritmo (Repetir Semana)
                            </button>

                            <button
                                onClick={onAdjustSettings}
                                className="w-full text-xs font-bold text-muted-foreground hover:text-foreground py-2 flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wide mt-2"
                            >
                                <Settings className="w-3.5 h-3.5" /> Ajustar Configurações
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
