import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
import { DbService } from '../services/db';
import { Logo } from '../components/Logo';
import { buttonHover, buttonTap, pageVariants } from '../utils/motion';

import { supabase } from '../services/supabase';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    // State for SignUp fields
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.substring(0, 11);
        if (val.length > 2) {
            val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
        }
        if (val.length > 10) {
            val = `${val.substring(0, 10)}-${val.substring(10)}`;
        }
        setPhone(val);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        if (isSignUp) {
            if (!name || name.trim().length < 3) {
                setError('Por favor, informe seu nome completo.');
                return;
            }
            if (!phone || phone.length < 14) {
                setError('Por favor, informe um telefone válido.');
                return;
            }
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            name: name,
                            phone: phone
                        }
                    }
                });

                if (error) throw error;

                if (data.user) {
                    const { error: profileError } = await supabase.from('profiles').upsert({
                        id: data.user.id,
                        name: name,
                        phone: phone,
                        email: email,
                        updated_at: new Date().toISOString()
                    });

                    if (profileError) {
                        console.error("Error saving profile:", profileError);
                    }
                }

                alert('Conta criada com sucesso!');
                navigate('/onboarding');

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                const fullProfile = await DbService.getProfile();

                if (fullProfile && fullProfile.name && fullProfile.phone && fullProfile.height && fullProfile.weight && fullProfile.age && fullProfile.gender) {
                    StorageService.saveProfile(fullProfile as any);
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            className="min-h-screen flex bg-background"
        >
            {/* ═══════ LEFT — Brand Statement ═══════ */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
                {/* Image */}
                <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"
                    alt="Gym"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-950/80 via-brand-900/70 to-brand-950/90 z-10" />

                {/* Content */}
                <div className="relative z-20 flex flex-col justify-between p-10 w-full">
                    {/* Top — Logo */}
                    <div>
                        <Logo className="w-14 h-14" showText={false} />
                    </div>

                    {/* Center — Message */}
                    <div className="max-w-md">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mb-5"
                        >
                            Cada treino
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
                                te transforma.
                            </span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35, duration: 0.6 }}
                            className="text-brand-200 text-lg leading-relaxed"
                        >
                            Treinos adaptados por IA que evoluem com você. Acompanhe cada série, cada conquista.
                        </motion.p>
                    </div>

                    {/* Bottom — Social proof */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="flex items-center gap-4"
                    >
                        <div className="flex -space-x-2">
                            {[12, 25, 33, 41].map(i => (
                                <img
                                    key={i}
                                    src={`https://i.pravatar.cc/80?img=${i}`}
                                    alt=""
                                    className="w-9 h-9 rounded-full border-2 border-brand-900 object-cover"
                                />
                            ))}
                        </div>
                        <div>
                            <span className="font-bold text-white text-sm">+2.000 atletas</span>
                            <div className="flex gap-0.5 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} className="w-3 h-3 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* ═══════ RIGHT — Form ═══════ */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-10 lg:p-16">
                <div className="w-full max-w-[400px] space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center mb-4">
                        <Logo className="w-14 h-14" showText={false} />
                    </div>

                    {/* Header */}
                    <div className="text-center lg:text-left">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                            {isSignUp ? 'Crie sua conta' : 'Bem-vindo de volta'}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {isSignUp
                                ? 'Comece a treinar com inteligência em minutos.'
                                : 'Entre para acessar seu plano de treino.'}
                        </p>
                    </div>

                    {/* Form */}
                    <form className="space-y-5" onSubmit={handleAuth}>

                        <AnimatePresence>
                            {isSignUp && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-5 overflow-hidden"
                                >
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                                            Nome completo
                                        </label>
                                        <input
                                            id="name"
                                            name="name"
                                            type="text"
                                            autoComplete="name"
                                            required={isSignUp}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full rounded-xl border border-border bg-card py-3 px-4 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all outline-none"
                                            placeholder="Seu nome"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                                            WhatsApp
                                        </label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            autoComplete="tel"
                                            required={isSignUp}
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            className="block w-full rounded-xl border border-border bg-card py-3 px-4 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all outline-none"
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                                E-mail
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border border-border bg-card py-3 px-4 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all outline-none"
                                placeholder="seu@email.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                    Senha
                                </label>
                                {!isSignUp && (
                                    <a href="#" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                                        Esqueci a senha
                                    </a>
                                )}
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-border bg-card py-3 px-4 text-foreground placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-xl flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isSignUp && (
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary bg-card"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                                    Manter conectado
                                </label>
                            </div>
                        )}

                        <motion.button
                            whileHover={!loading ? buttonHover : {}}
                            whileTap={!loading ? buttonTap : {}}
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-xl bg-primary px-3 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (isSignUp ? 'Criar Conta' : 'Entrar')}
                        </motion.button>
                    </form>

                    {/* Toggle mode */}
                    <p className="text-center text-sm text-muted-foreground">
                        {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                        {' '}
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            {isSignUp ? 'Fazer Login' : 'Criar conta grátis'}
                        </button>
                    </p>

                    {/* Footer */}
                    <div className="pt-6 border-t border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LevelUp Fitness AI</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};