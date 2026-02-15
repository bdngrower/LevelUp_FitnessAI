import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { StorageService } from '../services/storage';
import { DbService } from '../services/db';
import { ExerciseLog, WorkoutDay, ExerciseDefinition, UserProfile } from '../types';
import { CheckCircle, Clock, Play, ChevronRight } from '../components/Icons';
import { pageVariants, buttonTap, buttonHover } from '../utils/motion';
import { getExerciseDetails } from '../data/exercises';
import { playTimerBeep } from '../utils/audio';

const TIMER_STORAGE_KEY = 'levelup_active_timer_target';

export const ActiveWorkout: React.FC = () => {
  const { dayIndex } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  // Timer State (Persistence Logic)
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerTarget, setTimerTarget] = useState<number | null>(null);
  const hasPlayedSound = useRef(false);

  const [sessionLogs, setSessionLogs] = useState<ExerciseLog[]>([]);
  const [startTime] = useState(new Date());

  // Current exercise state
  const [weight, setWeight] = useState<number>(0);
  const [repsDone, setRepsDone] = useState<number>(0);
  const [rating, setRating] = useState<'easy' | 'ok' | 'hard'>('ok');

  // Details & Logic
  const [exerciseDetails, setExerciseDetails] = useState<ExerciseDefinition | undefined>(undefined);
  const [suggestion, setSuggestion] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Summary & Share state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{ duration: number; exercises: number; volume: number } | null>(null);

  // Load Profile & Plan
  useEffect(() => {
    const loadData = async () => {
      const user = await DbService.getProfile();
      setProfile(user);
      const plan = await DbService.getPlan();
      if (plan && dayIndex) {
        const d = plan.days[parseInt(dayIndex)];
        setDay(d);
        setCompletedSets(new Array(d.exercises.length).fill(0));
      }
    };
    loadData();

    // Restore Timer if exists
    const savedTarget = localStorage.getItem(TIMER_STORAGE_KEY);
    if (savedTarget) {
      const target = parseInt(savedTarget);
      if (target > Date.now()) {
        setTimerTarget(target);
        setIsTimerRunning(true);
      } else {
        localStorage.removeItem(TIMER_STORAGE_KEY);
      }
    }
  }, [dayIndex]);

  // Timer Tick & Logic
  useEffect(() => {
    let interval: any;

    if (isTimerRunning && timerTarget) {
      interval = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((timerTarget - now) / 1000);

        if (diff <= 0) {
          // Timer Finished
          setTimerRemaining(0);

          // Trigger Sound & Vibrate ONCE
          if (!hasPlayedSound.current) {
            const settings = StorageService.getSettings();
            if (settings.soundEnabled) {
              playTimerBeep();
            }
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200]);
            }
            hasPlayedSound.current = true;
          }
        } else {
          setTimerRemaining(diff);
        }
      }, 200);
    } else {
      setTimerRemaining(0);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timerTarget]);


  // Load logic when exercise changes
  useEffect(() => {
    if (day && profile) {
      const ex = day.exercises[currentExerciseIndex];
      const details = getExerciseDetails(ex.name);
      setExerciseDetails(details);
      setVideoError(false); // Reset video error for new exercise

      // Parse target reps (e.g., "10-12" -> 10)
      const targetReps = parseInt(ex.reps.split('-')[0]) || 10;
      setRepsDone(targetReps);

      DbService.getLastLogForExercise(ex.name).then(history => {

        if (history) {
          // Smart Progression Logic
          let suggestedWeight = history.weight;
          let reason = "Carga mantida";

          if (history.rating === 'easy') {
            // Increase 5% or 2.5kg minimum
            const increase = Math.max(2.5, suggestedWeight * 0.05);
            suggestedWeight += increase;
            reason = "Aumento por facilidade (+5%)";
          } else if (history.rating === 'hard') {
            suggestedWeight = Math.max(0, suggestedWeight * 0.9); // Reduce 10%
            reason = "Redução por dificuldade (-10%)";
          }

          // Round to nearest 0.5
          suggestedWeight = Math.round(suggestedWeight * 2) / 2;

          setWeight(suggestedWeight);
          setSuggestion(`${suggestedWeight}kg (${reason})`);
        } else {
          // New Exercise Logic
          let startWeight = 10; // Fallback
          if (details && details.defaultLoad) {
            const loadTable = profile.gender === 'female' ? details.defaultLoad.female : details.defaultLoad.male;
            startWeight = loadTable[profile.experience];
          }
          setWeight(startWeight);
          setSuggestion(`${startWeight}kg (Sugestão inicial para nível ${profile.experience === 'beginner' ? 'Iniciante' : profile.experience === 'intermediate' ? 'Intermediário' : 'Avançado'})`);
        }
      });
    }
  }, [currentExerciseIndex, day, profile]);

  const startRestTimer = (seconds: number) => {
    const now = Date.now();
    const target = now + (seconds * 1000);
    setTimerTarget(target);
    localStorage.setItem(TIMER_STORAGE_KEY, target.toString());
    setIsTimerRunning(true);
    hasPlayedSound.current = false;
    setTimerRemaining(seconds);
  };

  const cancelTimer = () => {
    setIsTimerRunning(false);
    setTimerTarget(null);
    localStorage.removeItem(TIMER_STORAGE_KEY);
    hasPlayedSound.current = false;
  };

  const addTime = (seconds: number) => {
    if (timerTarget) {
      const newTarget = timerTarget + (seconds * 1000);
      setTimerTarget(newTarget);
      localStorage.setItem(TIMER_STORAGE_KEY, newTarget.toString());
    }
  };

  const handleSetComplete = () => {
    if (!day) return;
    const ex = day.exercises[currentExerciseIndex];

    // Start rest timer
    startRestTimer(ex.restSeconds);
    setShowDetails(false); // Collapse details on next set

    const newCompleted = [...completedSets];
    newCompleted[currentExerciseIndex] += 1;
    setCompletedSets(newCompleted);

    // If all sets done
    if (newCompleted[currentExerciseIndex] >= ex.sets) {
      const log: ExerciseLog = {
        exerciseId: ex.id,
        exerciseName: ex.name,
        weightUsed: weight,
        repsCompleted: repsDone,
        setsCompleted: ex.sets,
        rating: rating,
        date: new Date().toISOString()
      };
      setSessionLogs(prev => [...prev, log]);

      // Delay navigation slightly so user sees the timer start
      setTimeout(() => {
        if (currentExerciseIndex < day.exercises.length - 1) {
          // We keep the timer running between exercises!
          setCurrentExerciseIndex(prev => prev + 1);
        } else {
          // Finish workout but maybe let timer run out? Or cancel?
          // Usually finish immediately
          cancelTimer();
          finishWorkout();
        }
      }, 100);
    }
  };

  const finishWorkout = async () => {
    if (!day || !dayIndex) return;

    const duration = Math.round((new Date().getTime() - startTime.getTime()) / 60000);
    const plan = await DbService.getPlan();

    await DbService.saveWorkoutLog({
      id: crypto.randomUUID(),
      planId: plan?.id || 'unknown',
      dayId: dayIndex,
      date: new Date().toISOString(),
      durationMinutes: duration,
      completedExercises: sessionLogs
    });

    // Calculate total volume
    const totalVolume = sessionLogs.reduce((sum, log) => {
      return sum + log.sets.reduce((s, set) => s + (set.weight * set.reps), 0);
    }, 0);

    setSummaryData({ duration, exercises: sessionLogs.length, volume: Math.round(totalVolume) });
    setShowSummary(true);
  };

  const handleShare = async () => {
    if (!summaryData || !day) return;
    const text = `💪 Treino concluído no LevelUp!\n\n🏋️ ${day.focus}\n⏱️ ${summaryData.duration}min\n🎯 ${summaryData.exercises} exercícios\n🔥 ${summaryData.volume}kg de volume total\n\n#LevelUpFitness #Treino`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'LevelUp Fitness', text });
      } else {
        await navigator.clipboard.writeText(text);
        alert('Texto copiado! Cole nas suas redes sociais.');
      }
    } catch (err) {
      // user cancelled
    }
  };

  const adjustWeight = (amount: number) => {
    setWeight(prev => Math.max(0, prev + amount));
  };

  if (!day) return <div className="h-screen flex items-center justify-center bg-background text-foreground">Carregando...</div>;

  const currentExercise = day.exercises[currentExerciseIndex];
  const progressPercent = ((currentExerciseIndex) / day.exercises.length) * 100;

  // Timer is finished if running but remaining <= 0
  const isTimerFinished = isTimerRunning && timerRemaining <= 0;

  return (
    <motion.div
      className="h-screen flex flex-col bg-background overflow-hidden"
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {/* Workout Summary Modal */}
      <AnimatePresence>
        {showSummary && summaryData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-card rounded-3xl overflow-hidden shadow-2xl border border-border"
            >
              {/* Gradient Header */}
              <div className="bg-gradient-to-br from-primary via-emerald-500 to-teal-500 p-8 text-center text-white">
                <div className="text-5xl mb-3">🏆</div>
                <h2 className="text-2xl font-black">Treino Concluído!</h2>
                <p className="text-white/80 text-sm mt-1">{day?.focus}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-0 divide-x divide-border border-b border-border">
                <div className="p-5 text-center">
                  <div className="text-2xl font-black text-foreground">{summaryData.duration}</div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-1">Minutos</div>
                </div>
                <div className="p-5 text-center">
                  <div className="text-2xl font-black text-foreground">{summaryData.exercises}</div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-1">Exercícios</div>
                </div>
                <div className="p-5 text-center">
                  <div className="text-2xl font-black text-primary">{summaryData.volume.toLocaleString()}</div>
                  <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider mt-1">kg Volume</div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                  Compartilhar Treino
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 rounded-2xl bg-secondary text-foreground font-bold text-sm hover:bg-muted transition-colors"
                >
                  Voltar ao Início
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="h-14 bg-card flex items-center justify-between px-4 border-b border-border shrink-0 z-10 shadow-sm relative">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/plan')} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
            <ChevronRight className="w-4 h-4 rotate-180" /> Voltar
          </button>
        </div>

        <div className="font-bold text-foreground truncate max-w-[150px] text-sm absolute left-1/2 -translate-x-1/2">{day.focus}</div>

        <div className="flex items-center gap-2">
          {/* Playlist Links */}
          <a
            href="https://open.spotify.com/genre/workout-page"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-[#1DB954]/10 hover:bg-[#1DB954]/20 flex items-center justify-center transition-colors"
            title="Abrir Spotify"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>
          </a>
          <a
            href="https://music.apple.com/search?term=workout+playlist"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-[#FC3C44]/10 hover:bg-[#FC3C44]/20 flex items-center justify-center transition-colors"
            title="Abrir Apple Music"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="#FC3C44"><path d="M23.994 6.124a9.23 9.23 0 00-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0019.7.25a10.38 10.38 0 00-1.667-.2C17.185.017 16.337 0 13.848 0h-3.7c-2.5 0-3.34.018-4.193.056a10.1 10.1 0 00-1.645.2A5.02 5.02 0 002.4.9C1.28 1.632.536 2.632.22 3.942a9.1 9.1 0 00-.2 1.69C-.014 6.482 0 7.33 0 9.82v4.36c0 2.49.014 3.34.053 4.19a9.1 9.1 0 00.2 1.69c.316 1.3 1.06 2.3 2.18 3.04a5 5 0 001.907.64c.55.115 1.1.17 1.667.2.85.038 1.7.056 4.19.056h3.7c2.5 0 3.34-.018 4.19-.056a10.1 10.1 0 001.645-.2 5 5 0 001.907-.64c1.12-.74 1.864-1.74 2.18-3.04a9.23 9.23 0 00.24-2.19c.038-.85.056-1.7.056-4.19V9.82c-.018-2.49-.036-3.34-.074-4.19zM17.886 16.4c0 .65-.234 1.19-.662 1.55-.386.33-.863.48-1.39.48a2.03 2.03 0 01-.57-.08 2.27 2.27 0 01-1.49-1.37 2.2 2.2 0 01-.16-.77c0-.65.23-1.19.66-1.55.386-.33.864-.48 1.39-.48.19 0 .38.03.57.08.653.19 1.13.61 1.49 1.37.1.24.16.51.16.77zM17.5 10.63v.004l-6.5 1.406V16.4c0 .65-.234 1.19-.662 1.55-.386.33-.863.48-1.39.48a2.03 2.03 0 01-.57-.08 2.27 2.27 0 01-1.49-1.37 2.2 2.2 0 01-.16-.77c0-.65.23-1.19.66-1.55.386-.33.864-.48 1.39-.48.19 0 .38.03.57.08.376.11.7.32.967.61V8.364l6.5-1.41v3.674z" /></svg>
          </a>

          {/* Timer */}
          <div className={`text-sm font-mono font-bold px-3 py-1 rounded-full transition-all ${isTimerRunning ? (isTimerFinished ? 'bg-green-500 text-white animate-pulse' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400') : 'bg-secondary text-muted-foreground'}`}>
            {String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:{String(timerRemaining % 60).padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary h-1 shrink-0">
        <motion.div
          className="bg-primary h-1"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center w-full max-w-lg mx-auto pb-4">

        {/* Exercise Header */}
        <div className="text-center mb-6 w-full">
          <h2 className="text-2xl font-bold text-foreground leading-tight mb-2">{currentExercise.name}</h2>
          <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
            <span className="bg-secondary/50 px-2 py-1 rounded-md font-medium">Série {completedSets[currentExerciseIndex] + 1}/{currentExercise.sets}</span>
            <span className="bg-secondary/50 px-2 py-1 rounded-md font-medium">Meta: {currentExercise.reps} reps</span>
          </div>
          {suggestion && (
            <div className="mt-2 text-xs text-primary bg-primary/10 inline-block px-3 py-1 rounded-full font-medium border border-primary/20">
              💡 {suggestion}
            </div>
          )}
        </div>


        {/* Technical Details Toggle */}
        <div className="w-full mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm text-left transition-all hover:bg-secondary/50"
          >
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></span>
              <span className="font-bold text-card-foreground text-sm">Ficha Técnica & Execução</span>
            </div>
            <svg className={`w-5 h-5 text-muted-foreground transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <AnimatePresence>
            {showDetails && exerciseDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border-x border-b border-border rounded-b-xl p-4 text-sm space-y-4 shadow-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Equipamento</span>
                      <span className="text-foreground font-medium">{exerciseDetails.equipment}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Músculos</span>
                      <span className="text-foreground font-medium">{exerciseDetails.muscles.primary}</span>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase mb-1">Execução</span>
                    <div className="space-y-2 text-foreground/80">
                      <p><span className="font-bold text-primary">1. Setup:</span> {exerciseDetails.execution.setup}</p>
                      <p><span className="font-bold text-primary">2. Movimento:</span> {exerciseDetails.execution.movement}</p>
                      <p><span className="font-bold text-primary">3. Dica:</span> {exerciseDetails.execution.tips}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-secondary/30 dark:bg-white/5 p-3 rounded-lg">
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Tempo (Cadência)</span>
                      <span className="text-foreground font-mono text-xs">{exerciseDetails.tempo}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Segurança</span>
                      <span className="text-destructive font-medium text-xs">{exerciseDetails.safety || "Mantenha a postura."}</span>
                    </div>
                  </div>

                  {exerciseDetails.alternatives.length > 0 && (
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase">Alternativas</span>
                      <span className="text-muted-foreground text-xs">{exerciseDetails.alternatives.join(", ")}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exercise Video Card */}
        {/* Exercise Video Card */}
        {/* Como cadastrar vídeos: Associe uma URL direta (.mp4) ou link de embed no campo 'video_url' do exercício no banco de dados. */}
        <div className="w-full mb-6 bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-primary fill-current" />
              <span className="font-bold text-sm">Demonstração</span>
            </div>
          </div>

          <div className="relative aspect-video bg-black/5 dark:bg-black flex items-center justify-center">
            {(currentExercise.videoUrl || exerciseDetails?.videoUrl) ? (
              <video
                key={currentExercise.videoUrl || exerciseDetails?.videoUrl}
                src={currentExercise.videoUrl || exerciseDetails?.videoUrl}
                className="w-full h-full object-contain"
                controls
                loop
                muted
                playsInline
              />
            ) : !videoError ? (
              <video
                key={currentExercise.name}
                src={`/videos/${currentExercise.name.replace(/ /g, '_')}.mp4`}
                className="w-full h-full object-contain"
                loop
                muted
                playsInline
                autoPlay
                onError={() => setVideoError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center">
                  <Play className="w-5 h-5 opacity-40 ml-1" />
                </div>
                <span className="text-sm font-medium opacity-60">Vídeo em breve</span>
              </div>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="w-full bg-card rounded-2xl p-6 shadow-sm border border-border mb-6">
          <div className="grid grid-cols-2 gap-8 mb-6 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-12 bg-border"></div>

            {/* Weight Input */}
            <div className="text-center">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Carga (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value))}
                className="w-full text-center text-4xl font-bold bg-transparent text-foreground border-0 focus:ring-0 p-0 placeholder:text-muted/50"
              />
              <div className="flex justify-center gap-2 mt-2">
                <button onClick={() => adjustWeight(-1)} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground font-bold hover:bg-muted">-</button>
                <button onClick={() => adjustWeight(1)} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground font-bold hover:bg-muted">+</button>
              </div>
              <div className="flex justify-center gap-1 mt-1">
                <button onClick={() => adjustWeight(-2.5)} className="text-[10px] bg-secondary/50 px-2 py-1 rounded text-muted-foreground">-2.5</button>
                <button onClick={() => adjustWeight(2.5)} className="text-[10px] bg-secondary/50 px-2 py-1 rounded text-muted-foreground">+2.5</button>
              </div>
            </div>

            {/* Reps Input */}
            <div className="text-center">
              <label className="block text-xs font-bold uppercase text-muted-foreground mb-2 tracking-wider">Reps</label>
              <input
                type="number"
                value={repsDone}
                onChange={(e) => setRepsDone(parseFloat(e.target.value))}
                className="w-full text-center text-4xl font-bold bg-transparent text-foreground border-0 focus:ring-0 p-0 placeholder:text-muted/50"
              />
              <div className="flex justify-center gap-2 mt-2">
                <button onClick={() => setRepsDone(r => Math.max(0, r - 1))} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground font-bold hover:bg-muted">-</button>
                <button onClick={() => setRepsDone(r => r + 1)} className="w-8 h-8 rounded-full bg-secondary text-muted-foreground font-bold hover:bg-muted">+</button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">RPE 8-9 (1-2 na reserva)</p>
            </div>
          </div>

          {/* Rating */}
          <div className="pt-4 border-t border-border">
            <label className="block text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider text-center">Como foi?</label>
            <div className="grid grid-cols-3 gap-3">
              <button onClick={() => setRating('easy')} className={`py-3 rounded-xl text-sm font-bold border transition-all ${rating === 'easy' ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-secondary border-transparent text-muted-foreground hover:bg-muted'}`}>Fácil</button>
              <button onClick={() => setRating('ok')} className={`py-3 rounded-xl text-sm font-bold border transition-all ${rating === 'ok' ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary border-transparent text-muted-foreground hover:bg-muted'}`}>OK</button>
              <button onClick={() => setRating('hard')} className={`py-3 rounded-xl text-sm font-bold border transition-all ${rating === 'hard' ? 'bg-destructive/20 border-destructive text-destructive' : 'bg-secondary border-transparent text-muted-foreground hover:bg-muted'}`}>Pesado</button>
            </div>
          </div>
        </div>

        {/* Action Button Area */}
        <div className="w-full mt-auto">
          <AnimatePresence mode="wait">
            {isTimerRunning ? (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="space-y-3"
              >
                <div className={`p-4 rounded-2xl flex items-center justify-between shadow-lg border border-border transition-colors ${isTimerFinished ? 'bg-green-500 text-white' : 'bg-card text-card-foreground'}`}>
                  <div className="flex items-center gap-3">
                    {isTimerFinished ? <CheckCircle className="w-8 h-8 animate-bounce" /> : <Clock className="w-8 h-8 text-primary animate-pulse" />}
                    <div>
                      <div className="text-xs font-bold uppercase opacity-70">{isTimerFinished ? 'Descanso Finalizado' : 'Descansando'}</div>
                      <div className="text-3xl font-black font-mono">
                        {String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:{String(timerRemaining % 60).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isTimerFinished && (
                      <button onClick={() => addTime(30)} className="px-3 py-2 bg-secondary/50 dark:bg-white/10 rounded-lg text-xs font-bold hover:bg-secondary">+30s</button>
                    )}
                    <button onClick={cancelTimer} className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${isTimerFinished ? 'bg-white text-green-600' : 'bg-primary text-primary-foreground'}`}>
                      {isTimerFinished ? 'Próxima Série' : 'Pular'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                whileHover={buttonHover}
                whileTap={buttonTap}
                onClick={handleSetComplete}
                className="w-full py-5 rounded-2xl bg-primary hover:bg-brand-500 text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-6 h-6" /> Concluir Série
              </motion.button>
            )}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};