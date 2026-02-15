import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Calendar, ArrowRight, CheckCircle2, Star } from '../components/Icons';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } }
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const stats = [
  { value: '2.000+', label: 'Planos Gerados' },
  { value: '98%', label: 'Satisfação' },
  { value: '15s', label: 'Para seu Plano' },
];

const features = [
  {
    icon: Calendar,
    title: 'Plano em Segundos',
    description: 'Diga seus objetivos e a IA cria uma rotina semanal personalizada instantaneamente.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Dumbbell,
    title: 'Adapta ao Seu Ritmo',
    description: 'Cada treino ajusta carga e volume conforme o seu feedback. Nunca estagna.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: TrendingUp,
    title: 'Números que Motivam',
    description: 'Volume total, streaks, conquistas — veja sua evolução com dados reais.',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
];

const testimonials = [
  {
    name: 'Lucas M.',
    role: 'Iniciante',
    text: 'Nunca conseguia manter uma rotina. Com o LevelUp, já são 3 meses sem falhar.',
    avatar: 'https://i.pravatar.cc/100?img=12',
    stars: 5,
  },
  {
    name: 'Ana R.',
    role: 'Atleta',
    text: 'A IA entendeu meu objetivo de hipertrofia perfeitamente. Plano melhor que do personal.',
    avatar: 'https://i.pravatar.cc/100?img=25',
    stars: 5,
  },
  {
    name: 'Pedro S.',
    role: 'Emagrecimento',
    text: '-12kg em 4 meses seguindo o plano. O app sabe exatamente o que eu preciso.',
    avatar: 'https://i.pravatar.cc/100?img=33',
    stars: 5,
  },
];

export const Landing: React.FC = () => {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">

      {/* Navbar — sticky, minimal */}
      <header className="fixed top-0 w-full z-50 bg-background/70 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <Logo className="h-10 w-auto" />
            <span>LevelUp<span className="text-primary">.AI</span></span>
          </Link>
          <div className="flex items-center gap-3">
            {session ? (
              <Link to="/dashboard" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
                  Entrar
                </Link>
                <Link to="/onboarding" className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                  Começar Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════ HERO — Visceral Impact ═══════ */}
      <section className="relative pt-28 pb-16 lg:pt-44 lg:pb-28 px-5">
        {/* Ambient glow — organic, not mesh */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-[10%] w-[200px] h-[200px] bg-emerald-400/10 blur-[100px] rounded-full pointer-events-none" />

        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="max-w-3xl mx-auto text-center relative z-10"
        >
          {/* Badge — social proof upfront */}
          <motion.div variants={fadeUp} className="mb-8">
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              +2.000 planos gerados esta semana
            </span>
          </motion.div>

          {/* Headline — massive, emotional */}
          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]"
          >
            Seu treino ideal
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-teal-400">
              em 15 segundos.
            </span>
          </motion.h1>

          {/* Sub — benefit focused, human */}
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Conte seus objetivos para a IA — ela cria um plano semanal completo, adapta a carga no seu ritmo e acompanha cada conquista.
          </motion.p>

          {/* CTA — one primary, one ghost */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/onboarding"
              className="group w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2"
            >
              Gerar Meu Plano
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-card text-foreground rounded-2xl font-bold text-lg hover:bg-card/80 transition-all border border-border flex items-center justify-center"
            >
              Já tenho conta
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div variants={fadeUp} className="mt-12 flex items-center justify-center gap-6 sm:gap-8 text-muted-foreground text-xs sm:text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> 100% Gratuito
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Sem cartão
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-primary" /> Plano em segundos
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════ SOCIAL PROOF STATS ═══════ */}
      <section className="py-12 border-y border-border/50 bg-card/30">
        <div className="max-w-4xl mx-auto px-5">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground">{stat.value}</div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES — não é grid genérico ═══════ */}
      <section className="py-20 lg:py-28 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como funciona</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Três passos. Zero complicação. Resultado real.
            </p>
          </motion.div>

          <div className="space-y-6">
            {features.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex flex-col md:flex-row items-start md:items-center gap-5 p-6 md:p-8 rounded-2xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-300"
              >
                {/* Step number */}
                <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${feat.gradient} border border-border/50">
                  <span className="text-2xl font-extrabold text-primary">{i + 1}</span>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1.5 flex items-center gap-2">
                    <feat.icon className={`w-5 h-5 ${feat.iconColor}`} />
                    {feat.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>

                <ArrowRight className="hidden md:block w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS — Social Proof ═══════ */}
      <section className="py-20 bg-card/30 border-y border-border/50 px-5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Quem usa, recomenda</h2>
            <p className="text-muted-foreground">Resultados reais de pessoas reais.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-background border border-border/50 rounded-2xl p-6 hover:border-primary/20 transition-colors"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-foreground mb-5 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA — Peak-End Rule ═══════ */}
      <section className="py-24 px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl"
        >
          {/* Gradient BG */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />

          <div className="relative z-10 p-10 md:p-16 text-center text-white">
            <div className="text-5xl mb-5">🚀</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Pronto pra evoluir?
            </h2>
            <p className="text-brand-200 text-lg mb-8 max-w-md mx-auto">
              Seu plano personalizado está a um clique. Sem pagamento, sem compromisso.
            </p>
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-brand-900 rounded-2xl font-bold text-lg hover:bg-brand-50 transition-all hover:scale-[1.02] shadow-xl"
            >
              Começar Agora — É Grátis
            </Link>
            <p className="mt-5 text-brand-300 text-sm">
              Leva menos de 1 minuto para criar sua conta.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50 text-center px-5">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Logo className="h-6 w-auto opacity-60" />
          <span className="text-sm font-semibold text-muted-foreground">LevelUp<span className="text-primary">.AI</span></span>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} LevelUp Fitness AI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
