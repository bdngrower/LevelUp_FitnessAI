import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
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

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                // Auto sign-in happens usually, or verify email. 
                // For development mode usually usually email confirm is off or it just works.
                // If email confirmation is required, this might need handling.
                // Assuming for now it signs in or we ask to check email.
                alert('Conta criada! Verifique seu email se necessário.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;

                // Check if profile exists
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id')
                    .single();

                if (profile) {
                    navigate('/');
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
            {/* Left Column - Illustration/Brand */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-brand-900 opacity-90 z-10"></div>
                <img
                    src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop"
                    alt="Gym Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="relative z-20 text-white p-12 max-w-lg">
                    <div className="mb-6">
                        <Logo className="w-20 h-20" showText={false} />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Sua melhor versão começa aqui.</h1>
                    <p className="text-xl text-brand-100 font-light">
                        O único planejador de treinos que você precisa. Inteligência artificial focada na sua evolução e emagrecimento real.
                    </p>

                    <div className="mt-12 flex gap-4">
                        <div className="flex -space-x-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-900 bg-gray-300 flex items-center justify-center overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" />
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="font-bold text-sm">+2.000 Alunos</span>
                            <span className="text-xs text-brand-200">Transformando vidas hoje</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-background">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="flex justify-center lg:justify-start mb-6 lg:hidden">
                            <Logo className="w-16 h-16" showText={false} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Bem-vindo de volta</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Digite suas credenciais para acessar seu plano.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleAuth}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-foreground">
                                E-mail
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium leading-6 text-foreground">
                                    Senha
                                </label>
                                <div className="text-sm">
                                    <a href="#" className="font-semibold text-primary hover:text-brand-500">
                                        Esqueci a senha
                                    </a>
                                </div>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-xl border border-input bg-background py-3 px-4 text-foreground shadow-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="text-destructive text-sm font-medium bg-destructive/10 p-3 rounded-lg flex items-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                                Manter conectado
                            </label>
                        </div>

                        <div>
                            <motion.button
                                whileHover={!loading ? buttonHover : {}}
                                whileTap={!loading ? buttonTap : {}}
                                type="submit"
                                disabled={loading}
                                className="flex w-full justify-center rounded-xl bg-primary px-3 py-4 text-sm font-bold leading-6 text-primary-foreground shadow-lg shadow-primary/25 hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (isSignUp ? 'Criar Conta' : 'Entrar')}
                            </motion.button>
                        </div>
                    </form>

                    <p className="mt-10 text-center text-sm text-muted-foreground">
                        {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                        {' '}
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="font-semibold leading-6 text-primary hover:text-brand-500 transition-colors"
                        >
                            {isSignUp ? 'Fazer Login' : 'Criar conta grátis'}
                        </button>
                    </p>

                    <div className="mt-8 pt-8 border-t border-border text-center">
                        <p className="text-xs text-muted-foreground">© 2024 LevelUp Fitness AI. Todos os direitos reservados.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};