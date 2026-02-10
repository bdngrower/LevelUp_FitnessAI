import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, TrendingUp, Calendar, ArrowRight, CheckCircle2, Star } from '../components/Icons';
import { Logo } from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="bg-card/50 backdrop-blur-sm border border-border p-6 rounded-2xl hover:border-primary/50 transition-colors"
  >
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </motion.div>
);

export const Landing: React.FC = () => {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link to="/dashboard" className="hidden sm:flex bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/20">
                Ir para Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">
                  Login
                </Link>
                <Link to="/login" className="hidden sm:flex bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-transform active:scale-95 shadow-lg shadow-primary/20">
                  Começar Agora
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold mb-6 border border-border">
              🚀 A Revolução do Fitness com IA
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
              Treinos Inteligentes, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">
                Resultados Reais.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Planos de treino personalizados instantaneamente por IA, adaptados ao seu corpo, objetivos e rotina. Evolua a cada dia.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/onboarding" className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group">
                Gerar Meu Plano
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground rounded-full font-bold text-lg hover:bg-secondary/80 transition-all border border-border flex items-center justify-center">
                Já tenho conta
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-muted-foreground text-sm uppercase tracking-widest font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> IA Avançada
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> 100% Personalizado
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Rastreamento Real
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-secondary/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tudo que você precisa para evoluir</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Nossa tecnologia analisa seus dados para criar a experiência de treino perfeita, eliminando a adivinhação.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Calendar}
              title="Planejamento Semanal"
              description="Receba uma rotina completa de exercícios distribuída perfeitamente para sua disponibilidade."
              delay={0.1}
            />
            <FeatureCard
              icon={Dumbbell}
              title="Exercícios Adaptativos"
              description="Ajuste cargas, séries e repetições com base no seu feedback diário e progresso."
              delay={0.2}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Análise de Progresso"
              description="Visualizações claras de seus ganhos de força, perda de peso e consistência ao longo do tempo."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-card border border-border rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Pronto para o próximo nível?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de usuários que transformaram seus corpos com a inteligência do LevelUp.
            </p>
            <Link to="/onboarding" className="inline-flex items-center justify-center px-10 py-5 bg-foreground text-background rounded-full font-bold text-lg hover:bg-foreground/90 transition-transform hover:scale-105">
              Começar Gratuitamente
            </Link>
            <p className="mt-6 text-sm text-muted-foreground">
              Não é necessário cartão de crédito para começar.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} LevelUp Fitness AI. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};
