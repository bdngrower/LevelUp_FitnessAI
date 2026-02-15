import { supabase } from './supabase';
import { UserProfile, WeeklyPlan } from "../types";

export const generateWorkoutPlan = async (user: UserProfile, progressionContext?: string, previousExercises?: string[]): Promise<WeeklyPlan> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
      body: { user, progressionContext, previousExercises },
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined
    });

    if (error) throw error;
    if (!data || !data.days) throw new Error("Formato inválido recebido da IA");

    return {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      days: data.days
    };
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
};