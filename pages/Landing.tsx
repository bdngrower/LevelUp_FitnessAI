import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star } from '../components/Icons';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

/* ─── Spring configs ─── */
const spring = { type: 'spring', stiffness: 120, damping: 20 };
const springBounce = { type: 'spring', stiffness: 200, damping: 12 };

/* ─── Reveal wrapper ─── */
const Reveal: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({ children, delay = 0, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ ...spring, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Data ─── */
const features = [
  {
    icon: '🏋️',
    title: 'Treino sob medida',
    desc: 'Diga seu objetivo — hipertrofia, emagrecimento, funcional — e a IA monta um plano semanal completo em 15 segundos. Cada série e repetição pensada pra você.',
    tag: 'IA INTELIGENTE',
  },
  {
    icon: '📊',
    title: 'Progressão de carga real',
    desc: 'A IA analisa cada treino, ajusta peso, volume e exercícios conforme seu feedback. Progressão overload calculada — zero estagnação, zero platô.',
    tag: 'ADAPTAÇÃO',
  },
  {
    icon: '🏆',
    title: 'PRs e conquistas',
    desc: 'Acompanhe volume total em kg, records pessoais, streaks de treino. Veja sua evolução real com dados — não achismo de personal.',
    tag: 'RESULTADOS',
  },
];

const trainingCategories = [
  {
    title: 'Hipertrofia',
    desc: 'Ganho de massa muscular',
    img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop',
    accent: 'from-emerald-500/80',
  },
  {
    title: 'Emagrecimento',
    desc: 'Queima de gordura eficiente',
    img: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=500&fit=crop',
    accent: 'from-teal-500/80',
  },
  {
    title: 'Funcional',
    desc: 'Condicionamento e mobilidade',
    img: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=500&fit=crop',
    accent: 'from-cyan-500/80',
  },
  {
    title: 'Força',
    desc: 'Powerlifting e PR records',
    img: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=500&fit=crop',
    accent: 'from-emerald-600/80',
  },
];

const testimonials = [
  { name: 'Lucas M.', role: 'Iniciante • 3 meses', text: 'Nunca conseguia manter uma rotina na academia. Com o LevelUp, já são 3 meses treinando sem falhar. A IA ajusta quando fico sobrecarregado.', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: 'Ana R.', role: 'Atleta • Hipertrofia', text: 'A IA entendeu meu objetivo de hipertrofia e periodizou melhor que meu personal. Supino subiu 15kg em 2 meses.', avatar: 'https://i.pravatar.cc/100?img=25' },
  { name: 'Pedro S.', role: '-12kg em 4 meses', text: 'A combinação de treino A/B/C com progressão calculada fez eu perder 12kg sem perder massa. App sabe quando puxar pesado.', avatar: 'https://i.pravatar.cc/100?img=33' },
];

const marqueeTerms = [
  'SUPINO', '•', 'AGACHAMENTO', '•', 'HIPERTROFIA', '•', 'LEVANTAMENTO TERRA', '•',
  'CARDIO HIIT', '•', 'MUSCULAÇÃO', '•', 'CROSSFIT', '•', 'FUNCIONAL', '•',
  'PROGRESSÃO DE CARGA', '•', 'PR RECORDS', '•', 'TREINO A/B/C', '•', 'PERIODIZAÇÃO', '•',
];

export const Landing: React.FC = () => {
  const { session } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <div className="bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-emerald-500/30 min-h-screen">

      {/* ═══ GRAIN TEXTURE OVERLAY ═══ */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══ NAVBAR ═══ */}
      <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-9 w-auto" />
            <span className="font-semibold text-sm tracking-wide">
              LEVELUP<span className="text-emerald-400">.AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link to="/dashboard" className="bg-emerald-500 text-black px-5 py-2 rounded-md text-sm font-bold hover:bg-emerald-400 transition-all active:scale-95">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block font-medium">
                  Entrar
                </Link>
                <Link to="/onboarding" className="bg-emerald-500 text-black px-5 py-2 rounded-md text-sm font-bold hover:bg-emerald-400 transition-all active:scale-95">
                  Começar Grátis
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — MASSIVE TYPOGRAPHY + GYM BACKGROUND
          ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 pt-20 overflow-hidden">
        {/* Background gym image with parallax */}
        <motion.div style={{ scale: imgScale }} className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format&fit=crop"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Heavy dark overlay to keep text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/90 via-[#0a0a0a]/80 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 to-transparent" />
        </motion.div>

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[400px] bg-emerald-500/8 blur-[180px] rounded-full pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              O personal trainer que nunca descansa
            </span>
          </motion.div>

          {/* MASSIVE HEADLINE — staggered word reveal */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-['Outfit'] text-[clamp(3.5rem,12vw,11rem)] font-black leading-[0.9] tracking-tighter"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.08 } },
              }}
            >
              {['SEU', 'TREINO'].map((word, i) => (
                <motion.span
                  key={i}
                  className="inline-block mr-[0.25em]"
                  variants={{
                    hidden: { y: '100%', opacity: 0, rotateX: -40 },
                    visible: { y: 0, opacity: 1, rotateX: 0, transition: { ...spring, delay: 0.2 + i * 0.12 } },
                  }}
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400"
                variants={{
                  hidden: { y: '100%', opacity: 0 },
                  visible: { y: 0, opacity: 1, transition: { ...spring, delay: 0.5 } },
                }}
              >
                IDEAL.
              </motion.span>
            </motion.h1>
          </div>

          {/* Sub + CTA — offset to the right */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.7 }}
            className="mt-10 md:mt-12 md:ml-auto md:max-w-md"
          >
            <p className="text-white/60 text-lg md:text-xl leading-relaxed mb-8">
              Diga seus objetivos. A IA cria seu plano de treino completo — séries, reps, carga progressiva. Em 15 segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/onboarding"
                className="group flex items-center justify-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-md font-bold text-base hover:bg-emerald-400 transition-all active:scale-95 hover:scale-[1.02]"
              >
                Montar Meu Treino
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center px-8 py-4 border border-white/10 text-white/70 rounded-md font-semibold text-base hover:border-white/25 hover:text-white transition-all"
              >
                Já treino aqui
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-white/40 text-xs font-medium uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> 100% gratuito
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> Sem cartão
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/60" /> 15 segundos
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-px h-10 bg-gradient-to-b from-white/20 to-transparent"
          />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          MARQUEE — GYM vocabulary strip
          ═══════════════════════════════════════════════════════ */}
      <div className="py-6 border-y border-white/5 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap gap-8 text-white/10 text-sm font-bold uppercase tracking-[0.3em]"
        >
          {Array.from({ length: 2 }).map((_, j) => (
            <React.Fragment key={j}>
              {marqueeTerms.map((t, i) => (
                <span key={`${j}-${i}`} className={t === '•' ? 'text-emerald-500/30' : ''}>{t}</span>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TRAINING CATEGORIES — Visual gym references
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Modalidades</span>
            <h2 className="font-['Outfit'] text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Feito pra quem<br />
              <span className="text-white/30">treina de verdade.</span>
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4">
            {trainingCategories.map((cat, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -8, transition: springBounce }}
                  className="group relative aspect-[3/4] rounded-md overflow-hidden cursor-pointer"
                >
                  {/* Image */}
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  />
                  {/* Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} via-[#0a0a0a]/60 to-[#0a0a0a]/30 opacity-80 group-hover:opacity-90 transition-opacity`} />
                  {/* Border */}
                  <div className="absolute inset-0 border border-white/5 rounded-md group-hover:border-emerald-500/30 transition-colors" />

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="font-['Outfit'] text-xl font-bold mb-1">{cat.title}</h3>
                    <p className="text-white/50 text-xs">{cat.desc}</p>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <ArrowRight className="w-5 h-5 text-emerald-400" />
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — How it works with gym context
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Como Funciona</span>
            <h2 className="font-['Outfit'] text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Três passos.<br />
              <span className="text-white/30">Treino completo.</span>
            </h2>
          </Reveal>

          <div className="mt-16 md:mt-24 space-y-6">
            {features.map((feat, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ x: 8, transition: springBounce }}
                  className="group relative border border-white/5 bg-white/[0.02] rounded-md p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start hover:border-emerald-500/20 hover:bg-white/[0.04] transition-colors duration-500 cursor-default"
                >
                  {/* Ghost Number */}
                  <span className="font-['Outfit'] text-[5rem] md:text-[7rem] font-black text-white/[0.04] leading-none absolute top-4 right-6 md:right-10 select-none group-hover:text-emerald-500/10 transition-colors duration-500">
                    0{i + 1}
                  </span>

                  <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-md border border-white/10 bg-white/[0.03] text-2xl group-hover:border-emerald-500/30 transition-colors">
                    {feat.icon}
                  </div>

                  <div className="relative z-10 flex-1">
                    <span className="text-emerald-400/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-2 block">{feat.tag}</span>
                    <h3 className="font-['Outfit'] text-xl md:text-2xl font-bold mb-2">{feat.title}</h3>
                    <p className="text-white/40 leading-relaxed max-w-lg">{feat.desc}</p>
                  </div>

                  <ArrowRight className="hidden md:block w-5 h-5 text-white/10 group-hover:text-emerald-400 group-hover:translate-x-2 transition-all flex-shrink-0 mt-4" />
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS — GYM-themed metrics
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 md:py-32 border-y border-white/5 px-6 overflow-hidden">
        {/* Background gym equipment image */}
        <img
          src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=60&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06]"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/80" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Números da comunidade</span>
            <h2 className="font-['Outfit'] text-3xl md:text-5xl font-black tracking-tight">
              O LevelUp em <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">ação.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
            {[
              { value: '50k+', label: 'Séries registradas', icon: '🔥' },
              { value: '120t', label: 'Kg levantados', icon: '🏋️' },
              { value: '1.2k', label: 'PRs batidos', icon: '🏆' },
              { value: '98%', label: 'Satisfação', icon: '⭐' },
            ].map((stat, i) => (
              <Reveal key={i} delay={i * 0.1} className="text-center relative">
                <span className="text-2xl mb-3 block">{stat.icon}</span>
                <div className="font-['Outfit'] text-4xl md:text-6xl font-black tracking-tight text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-white/40 text-sm font-medium">{stat.label}</div>
                {i < 3 && <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/5" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS — Offset grid
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Depoimentos</span>
            <h2 className="font-['Outfit'] text-4xl md:text-6xl font-black tracking-tight">
              Quem treina,<br />
              <span className="text-white/30">recomenda.</span>
            </h2>
          </Reveal>

          <div className="mt-16 grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <motion.div
                  whileHover={{ y: -6, transition: springBounce }}
                  className={`relative border border-white/5 bg-white/[0.02] rounded-md p-7 hover:border-emerald-500/15 transition-colors duration-500 ${i === 1 ? 'md:mt-8' : ''}`}
                >
                  <div className="flex gap-0.5 mb-5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                    ))}
                  </div>

                  <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.text}"</p>

                  <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                    <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-md object-cover grayscale hover:grayscale-0 transition-all" />
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-[11px] text-white/30">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FINAL CTA — GYM background + diagonal
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background gym image */}
        <img
          src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1920&q=70&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a]/95 via-[#0a0a0a]/85 to-emerald-950/70" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[200px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 md:py-40 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
          <Reveal>
            <span className="text-emerald-400/60 text-xs font-bold uppercase tracking-[0.3em] mb-6 block">Pronto pra treinar?</span>
            <h2 className="font-['Outfit'] text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
              Começa<br />
              agora.
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="md:pb-4">
            <p className="text-white/50 text-lg max-w-sm mb-8 leading-relaxed">
              Seu plano de treino completo — séries, reps, progressão de carga — está a um clique. Sem personal. Sem mensalidade extra.
            </p>
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-3 bg-emerald-500 text-black px-10 py-5 rounded-md font-bold text-lg hover:bg-emerald-400 transition-all active:scale-95 hover:scale-[1.02]"
            >
              Montar Meu Treino — É Grátis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <p className="mt-5 text-white/20 text-xs">Menos de 1 minuto para criar sua conta.</p>
          </Reveal>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="py-10 border-t border-white/5 text-center px-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Logo className="h-5 w-auto opacity-40" />
          <span className="text-xs font-semibold text-white/30">LEVELUP<span className="text-emerald-500/40">.AI</span></span>
        </div>
        <p className="text-[10px] text-white/15 uppercase tracking-widest">© {new Date().getFullYear()} Todos os direitos reservados</p>
      </footer>
    </div>
  );
};
