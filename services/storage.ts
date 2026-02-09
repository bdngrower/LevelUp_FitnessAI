import { UserProfile, WeeklyPlan, WorkoutLog, WeightLog } from '../types';

const KEYS = {
  PROFILE: 'cutcoach_profile',
  PLAN: 'cutcoach_plan',
  WORKOUT_LOGS: 'cutcoach_workout_logs',
  WEIGHT_LOGS: 'cutcoach_weight_logs',
  AUTH: 'cutcoach_auth_session',
  HISTORY: 'cutcoach_history_audit',
  SETTINGS: 'cutcoach_settings'
};

export interface HistoryItem {
    id: string;
    type: 'workout' | 'weight' | 'plan' | 'system';
    title: string;
    date: string;
    description?: string;
}

export interface AppSettings {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    soundEnabled: boolean;
}

const safeParse = <T>(data: string | null, fallback: T): T => {
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing storage data:', e);
    return fallback;
  }
};

export const StorageService = {
  // Auth Methods
  login: () => {
    localStorage.setItem(KEYS.AUTH, 'true');
  },

  logout: () => {
    localStorage.removeItem(KEYS.AUTH);
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem(KEYS.AUTH) === 'true';
  },

  // Profile Methods
  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    // Check if initial weight log needed
    const logs = StorageService.getWeightLogs();
    if (logs.length === 0) {
        StorageService.addWeightLog({ date: new Date().toISOString(), weight: profile.weight, waist: profile.waistSize });
    }
  },

  getProfile: (): UserProfile | null => {
    return safeParse<UserProfile | null>(localStorage.getItem(KEYS.PROFILE), null);
  },

  savePlan: (plan: WeeklyPlan) => {
    localStorage.setItem(KEYS.PLAN, JSON.stringify(plan));
    StorageService.addHistory({
        type: 'plan',
        title: 'Novo plano criado',
        description: `${plan.days.length} dias de treino gerados.`
    });
  },

  getPlan: (): WeeklyPlan | null => {
    return safeParse<WeeklyPlan | null>(localStorage.getItem(KEYS.PLAN), null);
  },

  saveWorkoutLog: (log: WorkoutLog) => {
    const logs = StorageService.getWorkoutLogs();
    logs.push(log);
    localStorage.setItem(KEYS.WORKOUT_LOGS, JSON.stringify(logs));
    StorageService.addHistory({
        type: 'workout',
        title: 'Treino Concluído',
        description: `Duração: ${log.durationMinutes} min. Ex: ${log.completedExercises.length}`
    });
  },

  getWorkoutLogs: (): WorkoutLog[] => {
    return safeParse<WorkoutLog[]>(localStorage.getItem(KEYS.WORKOUT_LOGS), []);
  },

  addWeightLog: (log: WeightLog) => {
    const logs = StorageService.getWeightLogs();
    const existingIndex = logs.findIndex(l => l.date.split('T')[0] === log.date.split('T')[0]);
    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }
    logs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    localStorage.setItem(KEYS.WEIGHT_LOGS, JSON.stringify(logs));
    
    // Update profile current weight
    const profile = StorageService.getProfile();
    if (profile) {
      profile.weight = log.weight;
      if (log.waist) profile.waistSize = log.waist;
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
    }

    StorageService.addHistory({
        type: 'weight',
        title: 'Peso Registrado',
        description: `${log.weight}kg`
    });
  },

  getWeightLogs: (): WeightLog[] => {
    return safeParse<WeightLog[]>(localStorage.getItem(KEYS.WEIGHT_LOGS), []);
  },

  getLastLogForExercise: (exerciseName: string): { weight: number, rating: 'easy' | 'ok' | 'hard' } | null => {
    const allLogs = StorageService.getWorkoutLogs();
    const sortedLogs = [...allLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const workout of sortedLogs) {
      const exLog = workout.completedExercises.find(e => e.exerciseName === exerciseName);
      if (exLog) {
        return { weight: exLog.weightUsed, rating: exLog.rating };
      }
    }
    return null;
  },

  // Audit Log / History
  addHistory: (item: Omit<HistoryItem, 'id' | 'date'>) => {
      const history = StorageService.getHistory();
      const newItem: HistoryItem = {
          ...item,
          id: crypto.randomUUID(),
          date: new Date().toISOString()
      };
      // Keep last 50 items
      const updatedHistory = [newItem, ...history].slice(0, 50);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(updatedHistory));
  },

  getHistory: (): HistoryItem[] => {
      return safeParse<HistoryItem[]>(localStorage.getItem(KEYS.HISTORY), []);
  },

  // Settings
  saveSettings: (settings: AppSettings) => {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
      // Apply theme immediately
      if (settings.theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
          document.documentElement.classList.remove('dark');
      } else {
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
              document.documentElement.classList.add('dark');
          } else {
              document.documentElement.classList.remove('dark');
          }
      }
  },

  getSettings: (): AppSettings => {
      return safeParse<AppSettings>(localStorage.getItem(KEYS.SETTINGS), { theme: 'system', notifications: true, soundEnabled: true });
  },

  clearAll: () => {
    localStorage.clear();
  }
};