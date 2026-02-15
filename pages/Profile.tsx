import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
import { DbService } from '../services/db';
import { supabase } from '../services/supabase';
import { pageVariants, itemFadeUp, containerStagger } from '../utils/motion';
import { UserProfile } from '../types';
import { Card, CardContent } from '../components/ui/Card';
import { LogOut, ChevronRight, UserIcon, Settings, TrendingUp, Calendar, Dumbbell } from '../components/Icons';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { LoadingScreen } from '../components/LoadingScreen';
import { cn } from '../utils/cn';

const MotionCard = motion(Card);

// Camera icon SVG inline
const CameraIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [initialWeight, setInitialWeight] = useState<number>(0);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const load = async () => {
            const p = await DbService.getProfile();
            setProfile(p);
            const logs = await DbService.getWeightLogs();
            setInitialWeight(logs.length > 0 ? logs[0].weight : (p?.weight || 0));
        };
        load();
    }, []);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile) return;

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const fileExt = file.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Upload file
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile with avatar URL (add cache buster)
            const avatarUrl = `${publicUrl}?t=${Date.now()}`;
            const updatedProfile = { ...profile, avatarUrl };
            await DbService.saveProfile(updatedProfile);
            setProfile(updatedProfile);
        } catch (err) {
            console.error('Avatar upload error:', err);
            alert('Erro ao enviar foto. Tente novamente.');
        } finally {
            setUploading(false);
        }
    };

    const handleReset = async () => {
        if (confirm("Tem certeza? Isso desconectará sua conta e limpará dados locais.")) {
            await supabase.auth.signOut();
            StorageService.clearAll();
            StorageService.logout();
            navigate('/');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        StorageService.logout();
        navigate('/');
    }

    if (!profile) return <LoadingScreen />;

    const experienceLabel = profile.experience === 'beginner' ? 'Iniciante' : profile.experience === 'intermediate' ? 'Intermediário' : 'Avançado';

    const statCards = [
        { label: 'Peso Inicial', value: `${initialWeight}`, unit: 'kg', color: 'text-blue-400', iconBg: 'bg-blue-500/10 ring-blue-500/20', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Peso Atual', value: `${profile.weight}`, unit: 'kg', color: 'text-emerald-400', iconBg: 'bg-emerald-500/10 ring-emerald-500/20', icon: <Dumbbell className="w-4 h-4" /> },
        { label: 'Altura', value: `${profile.height}`, unit: 'cm', color: 'text-violet-400', iconBg: 'bg-violet-500/10 ring-violet-500/20', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Idade', value: `${profile.age}`, unit: 'anos', color: 'text-amber-400', iconBg: 'bg-amber-500/10 ring-amber-500/20', icon: <Calendar className="w-4 h-4" /> },
    ];

    return (
        <motion.div
            className="p-4 md:p-8 pb-24 max-w-3xl mx-auto space-y-6"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
        >
            {/* Profile Header Card */}
            <motion.div
                variants={itemFadeUp}
                className="bg-card/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-lg shadow-black/5 overflow-hidden p-8 flex flex-col items-center text-center gap-5"
            >
                {/* Avatar with upload */}
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="relative group shrink-0"
                    disabled={uploading}
                >
                    <div className="w-24 h-24 rounded-full bg-background p-1 shadow-xl ring-2 ring-primary/10">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white font-black text-3xl">
                                {profile.name?.[0] || "U"}
                            </div>
                        )}
                    </div>
                    <div className={cn(
                        "absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
                        uploading && "opacity-100"
                    )}>
                        {uploading ? (
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <CameraIcon className="w-6 h-6 text-white" />
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                    />
                </button>

                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground">{profile.name || "Usuário"}</h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wide">Membro Pro</span>
                        <span className="px-3 py-1 bg-secondary rounded-full text-xs font-medium text-muted-foreground">{experienceLabel}</span>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid - Redesigned with icons */}
            <motion.div variants={containerStagger} className="grid grid-cols-2 gap-4">
                {statCards.map((stat) => (
                    <MotionCard key={stat.label} variants={itemFadeUp} className="bg-card/40 backdrop-blur-xl border border-white/5 hover:border-primary/20 transition-all duration-300 shadow-lg shadow-black/5">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className={cn("p-1.5 rounded-lg ring-1", stat.iconBg, stat.color)}>
                                    {stat.icon}
                                </div>
                                <span className="text-[11px] font-bold uppercase text-muted-foreground/80 tracking-widest">{stat.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className={cn("text-3xl font-black tracking-tight", stat.color)}>{stat.value}</span>
                                <span className="text-sm font-semibold text-muted-foreground/60">{stat.unit}</span>
                            </div>
                        </CardContent>
                    </MotionCard>
                ))}
            </motion.div>

            {/* Body & Preferences - Redesigned */}
            <motion.div variants={containerStagger} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MotionCard variants={itemFadeUp} className="overflow-hidden bg-card/40 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="px-6 pt-6 pb-3">
                        <h3 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">Dados Corporais</h3>
                    </div>
                    <div className="divide-y divide-border/30">
                        <ProfileItem label="Cintura" value={`${profile.waistSize || '--'} cm`} />
                        <ProfileItem label="Gênero" value={profile.gender === 'male' ? 'Masculino' : 'Feminino'} />
                        <ProfileItem label="Limitações" value={profile.limitations || 'Nenhuma'} />
                    </div>
                </MotionCard>

                <MotionCard variants={itemFadeUp} className="overflow-hidden bg-card/40 backdrop-blur-xl border border-white/5 shadow-lg shadow-black/5">
                    <div className="px-6 pt-6 pb-3">
                        <h3 className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">Preferências de Treino</h3>
                    </div>
                    <div className="divide-y divide-border/30">
                        <ProfileItem label="Frequência" value={`${profile.daysPerWeek} dias/semana`} />
                        <ProfileItem label="Duração" value={`${profile.timePerWorkout} min`} />
                        <ProfileItem label="Cardio" value={profile.cardioPreference === 'any' ? 'Misto' : profile.cardioPreference} />
                    </div>
                </MotionCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={containerStagger} className="space-y-3">
                <MotionCard
                    variants={itemFadeUp}
                    className="cursor-pointer bg-card/40 backdrop-blur-xl border border-white/5 hover:border-primary/30 transition-all group shadow-lg shadow-black/5"
                    onClick={() => navigate('/onboarding')}
                >
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2.5 rounded-xl text-primary group-hover:bg-primary/20 transition-colors ring-1 ring-primary/20">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm">Editar Perfil & Metas</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </CardContent>
                </MotionCard>

                <MotionCard
                    variants={itemFadeUp}
                    className="cursor-pointer bg-card/40 backdrop-blur-xl border border-white/5 hover:border-destructive/30 transition-all group shadow-lg shadow-black/5"
                    onClick={handleLogout}
                >
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-destructive/10 p-2.5 rounded-xl text-destructive group-hover:bg-destructive/20 transition-colors ring-1 ring-destructive/20">
                                <LogOut className="w-5 h-5" />
                            </div>
                            <span className="font-semibold text-sm text-destructive">Sair da Conta</span>
                        </div>
                    </CardContent>
                </MotionCard>
            </motion.div>

            {/* Danger zone */}
            <div className="flex justify-center pt-4 pb-8">
                <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium border-b border-transparent hover:border-destructive/50 pb-0.5">
                    Zona de perigo: Apagar todos os dados e resetar app
                </button>
            </div>
        </motion.div>
    );
};

const ProfileItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center px-6 py-4 hover:bg-white/[0.02] transition-colors">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground capitalize">{value}</span>
    </div>
);