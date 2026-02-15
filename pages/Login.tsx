import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
import { DbService } from '../services/db';
import { Logo } from '../components/Logo';
import { supabase } from '../services/supabase';
import { ArrowRight, Star } from '../components/Icons';

const spring = { type: 'spring', stiffness: 120, damping: 18 };

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 11) val = val.substring(0, 11);
        if (val.length > 2) val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
        if (val.length > 10) val = `${val.substring(0, 10)}-${val.substring(10)}`;
        setPhone(val);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) { setError('Preencha todos os campos.'); return; }
        if (isSignUp) {
            if (!name || name.trim().length < 3) { setError('Informe seu nome completo.'); return; }
            if (!phone || phone.length < 14) { setError('Informe um telefone válido.'); return; }
        }
        setLoading(true);
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email, password,
                    options: { data: { name, phone } }
                });
                if (error) throw error;
                if (data.user) {
                    await supabase.from('profiles').upsert({
                        id: data.user.id, name, phone, email,
                        updated_at: new Date().toISOString()
                    });
                }
                alert('Conta criada com sucesso!');
                navigate('/onboarding');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                const fullProfile = await DbService.getProfile();
                if (fullProfile?.name && fullProfile?.phone && fullProfile?.height && fullProfile?.weight && fullProfile?.age && fullProfile?.gender) {
                    StorageService.saveProfile(fullProfile as any);
                    navigate('/dashboard');
                } else {
                    navigate('/onboarding');
                }
            }
        } catch (err: any) {
            setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "block w-full border border-white/10 bg-white/[0.04] py-3.5 px-4 rounded-md text-white placeholder:text-white/25 focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 text-sm transition-all outline-none hover:border-white/20";

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex relative overflow-hidden selection:bg-emerald-500/30">

            {/* ═══ GRAIN ═══ */}
            <div
                className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* ═══ Background shapes ═══ */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[200px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/5 blur-[150px] rounded-full pointer-events-none" />

            {/* ═══════════════════════════════════════════════════════
                LEFT — Brand Statement (60% width, NOT 50/50)
                ═══════════════════════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 xl:p-16">
                {/* Top — nav */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...spring, delay: 0.1 }}
                    className="flex items-center gap-2.5"
                >
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <Logo className="h-8 w-auto" />
                        <span className="font-semibold text-sm tracking-wide text-white/60 group-hover:text-white transition-colors">
                            LEVELUP<span className="text-emerald-400">.AI</span>
                        </span>
                    </Link>
                </motion.div>

                {/* Center — Massive headline */}
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.2 }}
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            PLATAFORMA #1 EM IA FITNESS
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.35 }}
                        className="font-['Outfit'] text-5xl xl:text-7xl font-black tracking-tight leading-[0.95] mb-6"
                    >
                        Cada rep<br />
                        te leva<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                            mais longe.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...spring, delay: 0.5 }}
                        className="text-white/35 text-lg max-w-md leading-relaxed"
                    >
                        O treino que se adapta a você. Não o contrário. IA que entende seu corpo, seus objetivos, seu ritmo.
                    </motion.p>
                </div>

                {/* Bottom — Social Proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="flex items-center gap-5"
                >
                    <div className="flex -space-x-2.5">
                        {[12, 25, 33, 41, 53].map(i => (
                            <img
                                key={i}
                                src={`https://i.pravatar.cc/80?img=${i}`}
                                alt=""
                                className="w-9 h-9 rounded-md border-2 border-[#0a0a0a] object-cover grayscale hover:grayscale-0 transition-all"
                            />
                        ))}
                    </div>
                    <div>
                        <div className="flex gap-0.5 mb-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                            ))}
                        </div>
                        <span className="text-white/40 text-xs font-medium">+2.000 atletas já treinam com IA</span>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════════════════════
                RIGHT — Form (42% width, elevated card)
                ═══════════════════════════════════════════════════════ */}
            <div className="w-full lg:w-[42%] flex items-center justify-center p-6 sm:p-10">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ...spring, delay: 0.3 }}
                    className="w-full max-w-[420px] bg-white/[0.03] border border-white/[0.06] rounded-lg p-8 sm:p-10 relative"
                >
                    {/* Subtle glow behind card */}
                    <div className="absolute -inset-px rounded-lg bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 space-y-7">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-2">
                            <Link to="/" className="flex items-center gap-2">
                                <Logo className="h-9 w-auto" />
                                <span className="font-semibold text-sm text-white/60">LEVELUP<span className="text-emerald-400">.AI</span></span>
                            </Link>
                        </div>

                        {/* Header */}
                        <div>
                            <h2 className="font-['Outfit'] text-2xl font-bold tracking-tight">
                                {isSignUp ? 'Crie sua conta' : 'Entrar'}
                            </h2>
                            <p className="mt-1.5 text-sm text-white/35">
                                {isSignUp
                                    ? 'Comece a treinar com inteligência.'
                                    : 'Acesse seu plano de treino.'}
                            </p>
                        </div>

                        {/* Form */}
                        <form className="space-y-4" onSubmit={handleAuth}>
                            <AnimatePresence>
                                {isSignUp && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={spring}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div>
                                            <label htmlFor="name" className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">Nome</label>
                                            <input
                                                id="name" type="text" autoComplete="name" required={isSignUp}
                                                value={name} onChange={(e) => setName(e.target.value)}
                                                className={inputClass} placeholder="Seu nome completo"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">WhatsApp</label>
                                            <input
                                                id="phone" type="tel" autoComplete="tel" required={isSignUp}
                                                value={phone} onChange={handlePhoneChange}
                                                className={inputClass} placeholder="(11) 99999-9999"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div>
                                <label htmlFor="email" className="block text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">E-mail</label>
                                <input
                                    id="email" type="email" autoComplete="email" required
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass} placeholder="seu@email.com"
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-xs font-semibold text-white/50 uppercase tracking-wider">Senha</label>
                                    {!isSignUp && (
                                        <a href="#" className="text-[11px] font-medium text-emerald-400/60 hover:text-emerald-400 transition-colors">Esqueci</a>
                                    )}
                                </div>
                                <input
                                    id="password" type="password"
                                    autoComplete={isSignUp ? 'new-password' : 'current-password'} required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass} placeholder="••••••••"
                                />
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={spring}
                                        className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-md flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-2 bg-emerald-500 text-black py-3.5 rounded-md font-bold text-sm hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                ) : (
                                    <>
                                        {isSignUp ? 'Criar Conta' : 'Entrar'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                        </div>

                        {/* Toggle */}
                        <p className="text-center text-sm text-white/30">
                            {isSignUp ? 'Já tem conta?' : 'Não tem conta?'}{' '}
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                {isSignUp ? 'Fazer Login' : 'Criar grátis'}
                            </button>
                        </p>

                        {/* Footer */}
                        <p className="text-center text-[10px] text-white/15 uppercase tracking-widest pt-2">
                            © {new Date().getFullYear()} LevelUp Fitness AI
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};