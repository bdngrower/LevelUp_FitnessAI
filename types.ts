export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Gender = 'male' | 'female' | 'other';
export type CardioPreference = 'run' | 'walk' | 'bike' | 'stairmaster' | 'any';

export interface UserProfile {
  name?: string;
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: Gender;
  experience: ExperienceLevel;
  daysPerWeek: number; // 4-6
  timePerWorkout: number; // minutes
  cardioPreference: CardioPreference;
  limitations: string;
  goal: 'weight_loss'; // Fixed
  equipment: 'full_gym'; // Fixed
  waistSize?: number; // cm, optional
  avatarUrl?: string; // profile photo URL
  phone?: string; // (XX) XXXXX-XXXX
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  videoUrl?: string; // URL externa ou path local
  alternatives: string[];
  execution: {
    setup: string;
    movement: string;
    tips: string;
  };
  muscles: {
    primary: string;
    secondary: string[];
  };
  tempo: string;
  safety: string;
  defaultLoad: {
    male: { beginner: number; intermediate: number; advanced: number };
    female: { beginner: number; intermediate: number; advanced: number };
  };
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-12"
  rpe: number; // 1-10
  restSeconds: number;
  notes?: string;
  muscleGroup?: string;
  videoUrl?: string;
}

export interface CardioSession {
  type: string;
  durationMinutes: number;
  intensity: 'low' | 'moderate' | 'high' | 'interval';
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g., "Day 1 - Lower Body"
  focus: string;
  warmup: string;
  exercises: Exercise[];
  cardio: CardioSession;
  estimatedDuration: number;
}

export interface WeeklyPlan {
  id: string;
  createdAt: string; // ISO date
  days: WorkoutDay[];
}

export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string;
  weightUsed: number;
  repsCompleted: number; // Changed from implied strictly following plan
  setsCompleted: number;
  rating: 'easy' | 'ok' | 'hard';
  date: string;
}

export interface WorkoutLog {
  id: string;
  planId: string;
  dayId: string;
  date: string; // ISO date
  durationMinutes: number;
  completedExercises: ExerciseLog[];
}

export interface WeightLog {
  date: string;
  weight: number;
  waist?: number;
}

export interface HistoryItem {
  id: string;
  type: 'workout' | 'weight' | 'plan' | 'system';
  title: string;
  date: string;
  description?: string;
}