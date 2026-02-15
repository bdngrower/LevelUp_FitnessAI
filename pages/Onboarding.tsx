import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserProfile } from '../types';
import { DbService } from '../services/db';
import { Logo } from '../components/Logo';
import { pageVariants, itemFadeUp, buttonHover, buttonTap } from '../utils/motion';

import { useAuth } from '../contexts/AuthContext';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    goal: 'weight_loss',
    equipment: 'full_gym',
    daysPerWeek: 4,
    experience: 'intermediate',
    timePerWorkout: 60,
    cardioPreference: 'any'
  });

  // Pre-fill data from Auth/DB
  React.useEffect(() => {
    const loadData = async () => {
      // 1. Try fetching full profile from DB
      const existingProfile = await DbService.getProfile();
      if (existingProfile) {
        setProfile(prev => ({ ...prev, ...existingProfile }));
        return;
      }

      // 2. Fallback to Auth Metadata (if DB is empty but Auth has data)
      if (user?.user_metadata) {
        setProfile(prev => ({
          ...prev,
          name: user.user_metadata.name || prev.name,
          phone: user.user_metadata.phone || prev.phone
        }));
      }
    };
    loadData();
  }, [user]);

  const handleChange = (key: keyof UserProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleFinish = async () => {
    if (profile.height && profile.weight && profile.age && profile.name && profile.phone) {
      await DbService.saveProfile(profile as UserProfile);
      navigate('/');
    }
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col justify-center px-6 py-12 lg:px-8 bg-background"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <Logo className="w-16 h-16" showText={false} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Configure seu perfil
        </h2>
        <p className="text-muted-foreground mt-2">Para criar o plano perfeito para você.</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        {step === 1 && (
          <motion.div
            className="space-y-5"
            variants={itemFadeUp}
            initial="hidden"
            animate="show"
          >
            <h3 className="text-xl font-semibold text-foreground">Dados Pessoais</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Nome Completo</label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Telefone</label>
                <input
                  type="tel"
                  value={profile.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Altura (cm)</label>
                <input
                  type="number"
                  value={profile.height || ''}
                  onChange={e => handleChange('height', Number(e.target.value))}
                  className="mt-2 block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="175"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Peso (kg)</label>
                <input
                  type="number"
                  value={profile.weight || ''}
                  onChange={e => handleChange('weight', Number(e.target.value))}
                  className="mt-2 block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="80"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Idade</label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={e => handleChange('age', Number(e.target.value))}
                  className="mt-2 block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium leading-6 text-foreground">Sexo</label>
                <select
                  value={profile.gender || 'male'}
                  onChange={e => handleChange('gender', e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                >
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
              </div>
            </div>
            <motion.button
              whileHover={buttonHover}
              whileTap={buttonTap}
              onClick={handleNext}
              disabled={!profile.height || !profile.weight || !profile.age || !profile.name || !profile.phone}
              className="mt-4 w-full flex justify-center rounded-xl bg-primary px-3 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuar
            </motion.button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            className="space-y-6"
            variants={itemFadeUp}
            initial="hidden"
            animate="show"
          >
            <h3 className="text-xl font-semibold text-foreground">Rotina e Experiência</h3>

            <div>
              <label className="block text-sm font-medium leading-6 mb-3 text-foreground">Nível na Academia</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'beginner', label: 'Iniciante' },
                  { id: 'intermediate', label: 'Intermed.' },
                  { id: 'advanced', label: 'Avançado' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleChange('experience', opt.id)}
                    className={`py-3 px-2 text-sm font-medium rounded-xl border transition-all ${profile.experience === opt.id ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-card border-border text-muted-foreground hover:bg-accent'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 mb-3 text-foreground">Dias disponíveis por semana</label>
              <div className="bg-card p-4 rounded-xl border border-border">
                <input
                  type="range"
                  min="4"
                  max="6"
                  step="1"
                  value={profile.daysPerWeek}
                  onChange={e => handleChange('daysPerWeek', Number(e.target.value))}
                  className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground font-medium">
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                </div>
                <div className="text-center font-bold text-primary text-lg mt-2">{profile.daysPerWeek} Dias</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 mb-2 text-foreground">Preferência de Cardio</label>
              <select
                value={profile.cardioPreference}
                onChange={e => handleChange('cardioPreference', e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground shadow-sm focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
              >
                <option value="any">Tanto faz / Misto</option>
                <option value="run">Corrida</option>
                <option value="walk">Caminhada (Inclinada)</option>
                <option value="bike">Bicicleta</option>
                <option value="stairmaster">Escada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 mb-2 text-foreground">Lesões / Limitações (Opcional)</label>
              <input
                type="text"
                value={profile.limitations || ''}
                onChange={e => handleChange('limitations', e.target.value)}
                className="w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Ex: Dor no joelho, lombar sensível"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 justify-center rounded-xl bg-card px-3 py-4 text-sm font-bold text-foreground shadow-sm border border-input hover:bg-accent"
              >
                Voltar
              </button>
              <motion.button
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={handleFinish}
                className="flex-1 justify-center rounded-xl bg-primary px-3 py-4 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-brand-500"
              >
                Salvar Perfil
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};