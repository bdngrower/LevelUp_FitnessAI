import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StorageService } from '../services/storage';
import { pageVariants } from '../utils/motion';
import { Card, CardContent } from '../components/ui/Card';
import { LogOut, ChevronRight, UserIcon } from '../components/Icons';
import { Button } from '../components/ui/Button';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const profile = StorageService.getProfile();

  const handleReset = () => {
    if (confirm("Tem certeza? Isso apagará todos os seus dados e histórico.")) {
      StorageService.clearAll();
      StorageService.logout();
      navigate('/login');
    }
  };

  const handleLogout = () => {
      StorageService.logout();
      navigate('/login');
  }

  if (!profile) return null;

  return (
    <motion.div 
        className="p-6 md:p-8 pb-24 max-w-3xl mx-auto space-y-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
    >
      {/* Header Profile */}
      <div className="flex flex-col items-center justify-center text-center py-8 bg-card rounded-3xl border border-border/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent"></div>
          
          <div className="w-28 h-28 rounded-full bg-background p-1.5 shadow-xl mb-4 relative z-10">
               <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-emerald-400 flex items-center justify-center text-white font-black text-4xl shadow-inner">
                  {profile.name?.[0] || "U"}
               </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground relative z-10">{profile.name || "Usuário CutCoach"}</h2>
          <div className="flex items-center gap-2 mt-2 relative z-10">
             <span className="px-3 py-1 bg-secondary rounded-full text-xs font-bold text-muted-foreground uppercase tracking-wide">Membro Pro</span>
             <span className="text-muted-foreground text-xs">•</span>
             <span className="text-sm text-muted-foreground">Desde 2024</span>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <Card className="text-center hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Peso Inicial</div>
                  <div className="text-2xl font-black text-foreground">{StorageService.getWeightLogs()[0]?.weight || profile.weight} <span className="text-sm font-bold text-muted-foreground">kg</span></div>
              </CardContent>
          </Card>
          <Card className="text-center hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                  <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Objetivo</div>
                  <div className="text-xl font-black text-primary truncate">Emagrecimento</div>
              </CardContent>
          </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1 ml-1">Dados Corporais</h3>
            <Card className="overflow-hidden border-border/60">
                <div className="divide-y divide-border/40">
                    <ProfileItem label="Altura" value={`${profile.height} cm`} />
                    <ProfileItem label="Peso Atual" value={`${profile.weight} kg`} />
                    <ProfileItem label="Cintura" value={`${profile.waistSize || '--'} cm`} />
                    <ProfileItem label="Idade" value={`${profile.age} anos`} />
                </div>
            </Card>
        </div>

        <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1 ml-1">Preferências</h3>
            <Card className="overflow-hidden border-border/60">
                <div className="divide-y divide-border/40">
                    <ProfileItem label="Nível" value={profile.experience === 'beginner' ? 'Iniciante' : profile.experience === 'intermediate' ? 'Intermediário' : 'Avançado'} />
                    <ProfileItem label="Frequência" value={`${profile.daysPerWeek} dias/semana`} />
                    <ProfileItem label="Cardio" value={profile.cardioPreference === 'any' ? 'Misto' : profile.cardioPreference} />
                </div>
            </Card>
        </div>
      </div>

      <div className="pt-6 space-y-3">
          <Button variant="outline" className="w-full justify-between h-14 border-border/60 hover:bg-secondary hover:text-foreground" onClick={() => navigate('/onboarding')}>
             <span className="flex items-center gap-3 font-medium">
                 <div className="bg-primary/10 p-1.5 rounded-md text-primary"><UserIcon className="w-5 h-5" /></div>
                 Editar Perfil & Metas
             </span>
             <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>

          <Button variant="outline" className="w-full justify-between h-14 text-destructive hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 border-border/60" onClick={handleLogout}>
             <span className="flex items-center gap-3 font-medium">
                 <div className="bg-destructive/10 p-1.5 rounded-md"><LogOut className="w-5 h-5" /></div>
                 Sair da Conta
             </span>
          </Button>
          
          <div className="flex justify-center pt-8">
              <button onClick={handleReset} className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium border-b border-transparent hover:border-destructive/50 pb-0.5">
                  Zona de perigo: Apagar todos os dados e resetar app
              </button>
          </div>
      </div>
    </motion.div>
  );
};

const ProfileItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="flex justify-between items-center p-4 hover:bg-secondary/50 dark:hover:bg-white/5 transition-colors">
        <span className="text-sm font-medium text-foreground/80">{label}</span>
        <span className="text-sm font-bold text-foreground capitalize">{value}</span>
    </div>
);