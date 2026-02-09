import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
import { WeightLog, UserProfile } from '../types';
import { pageVariants, itemFadeUp } from '../utils/motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingUp, Plus } from '../components/Icons';

export const Progress: React.FC = () => {
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [newWaist, setNewWaist] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLogs(StorageService.getWeightLogs());
    setProfile(StorageService.getProfile());
  }, []);

  const handleCheckIn = () => {
    if (!newWeight) return;
    const log: WeightLog = {
        date: new Date().toISOString(),
        weight: parseFloat(newWeight),
        waist: newWaist ? parseFloat(newWaist) : undefined
    };
    StorageService.addWeightLog(log);
    setLogs(StorageService.getWeightLogs());
    setProfile(StorageService.getProfile());
    setShowModal(false);
    setNewWeight('');
    setNewWaist('');
  };

  // Format data for chart
  const chartData = logs.map(l => ({
    date: new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    weight: l.weight
  })).slice(-12); // Show slightly more history

  // Calculate stats
  const startWeight = logs.length > 0 ? logs[0].weight : 0;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const totalLoss = startWeight - currentWeight;

  return (
    <motion.div 
        className="p-6 md:p-8 pb-24 max-w-5xl mx-auto space-y-8"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
    >
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
         <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">Seu Progresso</h2>
            <p className="text-muted-foreground mt-1 font-medium">Acompanhe sua evolução corporal ao longo do tempo.</p>
         </div>
         <Button onClick={() => setShowModal(true)} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" /> Registrar Peso
         </Button>
       </div>

       {/* Stats Grid - Cleaner Look */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <Card className="border-border/60 shadow-sm">
               <CardContent className="p-6">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Peso Atual</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground tracking-tight">{profile?.weight}</span>
                        <span className="text-sm font-bold text-muted-foreground">kg</span>
                    </div>
               </CardContent>
           </Card>
           
           <Card className="border-border/60 shadow-sm">
               <CardContent className="p-6">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Evolução Total</div>
                    <div className={`flex items-baseline gap-1 ${totalLoss > 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                        <span className="text-4xl font-black tracking-tight">
                             {totalLoss > 0 ? '-' : ''}{Math.abs(totalLoss).toFixed(1)}
                        </span>
                        <span className="text-sm font-bold opacity-70">kg</span>
                    </div>
                    {totalLoss > 0 && <span className="text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-2 inline-block">Excelente!</span>}
               </CardContent>
           </Card>

           <Card className="border-border/60 shadow-sm">
               <CardContent className="p-6">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Medida (Cintura)</div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground tracking-tight">{profile?.waistSize || '--'}</span>
                        <span className="text-sm font-bold text-muted-foreground">cm</span>
                    </div>
               </CardContent>
           </Card>
       </div>

       {/* Chart Section */}
       <motion.div variants={itemFadeUp}>
          <Card className="flex flex-col shadow-md border-border/60 overflow-hidden">
              <CardHeader className="pb-2 border-b border-border/40 bg-secondary/30">
                  <CardTitle className="text-base">Histórico de Peso</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 min-h-[400px] p-4 md:p-6">
                  {chartData.length > 1 ? (
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                            <XAxis 
                                dataKey="date" 
                                tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                                stroke="none" 
                                dy={10} 
                            />
                            <YAxis 
                                domain={['auto', 'auto']} 
                                tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                                stroke="none" 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--card))',
                                    borderRadius: '16px', 
                                    border: '1px solid hsl(var(--border))', 
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    padding: '12px',
                                    color: 'hsl(var(--foreground))'
                                }} 
                                itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '4 4' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorWeight)" 
                                activeDot={{ r: 6, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                            />
                        </AreaChart>
                     </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20">
                        <div className="bg-secondary p-6 rounded-full mb-4">
                            <TrendingUp className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h4 className="text-lg font-bold text-foreground">Ainda não há dados suficientes</h4>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[250px] leading-relaxed">
                            Faça pelo menos dois check-ins de peso para que possamos gerar o gráfico de evolução.
                        </p>
                        <Button variant="ghost" className="mt-4" onClick={() => setShowModal(true)}>Adicionar primeiro registro</Button>
                    </div>
                  )}
              </CardContent>
          </Card>
       </motion.div>

       {/* Modal */}
       <AnimatePresence>
       {showModal && (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setShowModal(false)}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-foreground tracking-tight">Check-in</h3>
                    <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground p-2 bg-secondary rounded-full">
                        <span className="sr-only">Fechar</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase text-muted-foreground mb-2 ml-1">Peso Atual (kg)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                autoFocus
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                className="w-full rounded-2xl border border-input p-4 bg-secondary/50 dark:bg-secondary/20 text-3xl font-bold outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted/50 text-center"
                                placeholder="00.0"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">kg</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-muted-foreground mb-2 ml-1">Cintura (cm) - Opcional</label>
                        <input 
                            type="number" 
                            value={newWaist}
                            onChange={(e) => setNewWaist(e.target.value)}
                            className="w-full rounded-2xl border border-input p-3 bg-secondary/50 dark:bg-secondary/20 text-xl font-bold outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted/50 text-center"
                            placeholder="00"
                        />
                    </div>
                    <div className="pt-2">
                        <Button onClick={handleCheckIn} className="w-full h-14 text-lg" size="lg">Salvar Registro</Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
       )}
       </AnimatePresence>
    </motion.div>
  );
};