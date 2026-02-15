import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, CheckCircle2, Star } from '../components/Icons';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

/* ─── Spring configs (not linear!) ─── */
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
    icon: '⚡',
    title: 'IA que entende você',
    desc: 'Conte seus objetivos e a IA monta um plano semanal completo em 15 segundos. Não é template — é feito pra você.',
    tag: 'INTELIGÊNCIA',
  },
  {
    icon: '📈',
    title: 'Progressão real',
    desc: 'Cada treino alimenta a IA. Ela ajusta carga, volume e exercícios conforme seu feedback. Zero estagnação.',
    tag: 'ADAPTAÇÃO',
  },
  {
    icon: '🏆',
    title: 'Conquistas que motivam',
    desc: 'Acompanhe volume total, streaks, records pessoais. Veja sua evolução com dados reais — não achismo.',
    tag: 'DADOS',
  },
];

const testimonials = [
  { name: 'Lucas M.', role: 'Iniciante • 3 meses', text: 'Nunca conseguia manter uma rotina. Com o LevelUp, já são 3 meses sem falhar. O plano se adapta a mim, não o contrário.', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: 'Ana R.', role: 'Atleta • Hipertrofia', text: 'A IA entendeu meu objetivo de hipertrofia perfeitamente. Plano melhor que do personal. E de graça.', avatar: 'https://i.pravatar.cc/100?img=25' },
  { name: 'Pedro S.', role: '-12kg em 4 meses', text: 'Segui o plano religiosamente. O app sabe exatamente quando puxar mais pesado e quando dar descanso.', avatar: 'https://i.pravatar.cc/100?img=33' },
];

export const Landing: React.FC = () => {
  const { session } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
          HERO — MASSIVE TYPOGRAPHY + PARALLAX
          ═══════════════════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 pt-20 overflow-hidden">
        {/* Background: radial spot, NOT mesh */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-emerald-500/8 blur-[180px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-7xl mx-auto w-full">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              2.000+ planos criados
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
            <p className="text-white/50 text-lg md:text-xl leading-relaxed mb-8">
              Diga seus objetivos. A IA cria, adapta e evolui o plano com você. Em segundos. De graça.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/onboarding"
                className="group flex items-center justify-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-md font-bold text-base hover:bg-emerald-400 transition-all active:scale-95 hover:scale-[1.02]"
              >
                Gerar Meu Plano
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center px-8 py-4 border border-white/10 text-white/70 rounded-md font-semibold text-base hover:border-white/25 hover:text-white transition-all"
              >
                Já tenho conta
              </Link>
            </div>

            {/* Trust */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-white/30 text-xs font-medium uppercase tracking-wider">
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
          MARQUEE — Moving text strip
          ═══════════════════════════════════════════════════════ */}
      <div className="py-6 border-y border-white/5 overflow-hidden">
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap gap-8 text-white/10 text-sm font-bold uppercase tracking-[0.3em]"
        >
          {Array.from({ length: 2 }).map((_, j) => (
            <React.Fragment key={j}>
              {['TREINO INTELIGENTE', '•', 'ADAPTAÇÃO REAL', '•', 'RESULTADOS COMPROVADOS', '•', 'CONQUISTAS', '•', 'PROGRESSÃO', '•', 'ZERO ESTAGNAÇÃO', '•'].map((t, i) => (
                <span key={`${j}-${i}`} className={t === '•' ? 'text-emerald-500/30' : ''}>{t}</span>
              ))}
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — Staggered asymmetric cards
          ═══════════════════════════════════════════════════════ */}
      <section className="py-24 md:py-36 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Como Funciona</span>
            <h2 className="font-['Outfit'] text-4xl md:text-6xl font-black tracking-tight leading-[1.05]">
              Três passos.<br />
              <span className="text-white/30">Zero complicação.</span>
            </h2>
          </Reveal>

          <div className="mt-16 md:mt-24 space-y-6">
            {features.map((feat, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ x: 8, transition: springBounce }}
                  className="group relative border border-white/5 bg-white/[0.02] rounded-md p-8 md:p-10 flex flex-col md:flex-row gap-6 items-start hover:border-emerald-500/20 hover:bg-white/[0.04] transition-colors duration-500 cursor-default"
                >
                  {/* Number */}
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
          STATS — Large counter display
          ═══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 md:gap-0">
          {[
            { value: '2.000+', label: 'Planos gerados', sub: 'e contando' },
            { value: '98%', label: 'Satisfação', sub: 'dos usuários' },
            { value: '<15s', label: 'Tempo de geração', sub: 'do seu plano' },
          ].map((stat, i) => (
            <Reveal key={i} delay={i * 0.1} className="text-center relative">
              <div className="font-['Outfit'] text-5xl md:text-7xl font-black tracking-tight text-white">
                {stat.value}
              </div>
              <div className="mt-2 text-white/40 text-sm font-medium">{stat.label}</div>
              <div className="text-white/20 text-xs mt-0.5">{stat.sub}</div>
              {i < 2 && <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-16 bg-white/5" />}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TESTIMONIALS — Offset grid, NOT equal columns
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
                  {/* Stars */}
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
          FINAL CTA — Diagonal gradient, NOT centered card
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Diagonal Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#0a1a12] to-[#0a0a0a]" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[200px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-28 md:py-40 flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
          <Reveal>
            <span className="text-emerald-400/60 text-xs font-bold uppercase tracking-[0.3em] mb-6 block">Pronto?</span>
            <h2 className="font-['Outfit'] text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95]">
              Começa<br />
              agora.
            </h2>
          </Reveal>

          <Reveal delay={0.2} className="md:pb-4">
            <p className="text-white/40 text-lg max-w-sm mb-8 leading-relaxed">
              Seu plano personalizado está a um clique. Sem pagamento. Sem compromisso. Sem desculpa.
            </p>
            <Link
              to="/onboarding"
              className="group inline-flex items-center gap-3 bg-emerald-500 text-black px-10 py-5 rounded-md font-bold text-lg hover:bg-emerald-400 transition-all active:scale-95 hover:scale-[1.02]"
            >
              Começar — É Grátis
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
