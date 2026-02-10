import { supabase } from './supabase';
import { UserProfile, WeeklyPlan, WorkoutLog, WeightLog, ExerciseLog, WorkoutDay, Exercise, CardioSession, HistoryItem } from '../types';

export const DbService = {
    // Profile Methods
    async getProfile(): Promise<UserProfile | null> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .single();

        if (error || !data) return null;

        return {
            name: data.name || undefined,
            height: data.height,
            weight: data.current_weight,
            age: data.age,
            gender: data.gender as any,
            experience: data.experience_level as any,
            daysPerWeek: data.days_per_week,
            timePerWorkout: data.time_per_workout,
            cardioPreference: data.cardio_preference as any,
            limitations: data.limitations || '',
            goal: data.goal as any,
            equipment: data.equipment as any,
            waistSize: data.waist_size || undefined,
            avatarUrl: data.avatar_url || undefined,
        };
    },

    async saveProfile(profile: UserProfile): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            name: profile.name,
            height: profile.height,
            current_weight: profile.weight,
            age: profile.age,
            gender: profile.gender,
            experience_level: profile.experience,
            days_per_week: profile.daysPerWeek,
            time_per_workout: profile.timePerWorkout,
            cardio_preference: profile.cardioPreference,
            limitations: profile.limitations,
            goal: profile.goal,
            equipment: profile.equipment,
            waist_size: profile.waistSize,
            avatar_url: profile.avatarUrl,
            updated_at: new Date().toISOString()
        });

        if (error) throw error;
    },

    // Weight Logs
    async getWeightLogs(): Promise<WeightLog[]> {
        const { data, error } = await supabase
            .from('weight_logs')
            .select('*')
            .order('date', { ascending: true });

        if (error) throw error;

        return data.map(log => ({
            date: log.date,
            weight: log.weight,
            waist: log.waist_size || undefined
        }));
    },

    async addWeightLog(log: WeightLog): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { error } = await supabase.from('weight_logs').insert({
            user_id: user.id,
            date: log.date,
            weight: log.weight,
            waist_size: log.waist
        });

        if (error) throw error;

        // Update profile current weight
        await supabase.from('profiles').update({
            current_weight: log.weight,
            waist_size: log.waist,
            updated_at: new Date().toISOString()
        }).eq('id', user.id);
    },

    // Plan Methods (Complex: Plan -> Days -> Exercises)
    async savePlan(plan: WeeklyPlan): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        // 1. Deactivate old plans
        await supabase.from('workout_plans')
            .update({ active: false })
            .eq('user_id', user.id);

        // 2. Create new plan
        const { data: planData, error: planError } = await supabase
            .from('workout_plans')
            .insert({
                user_id: user.id,
                created_at: plan.createdAt,
                active: true
            })
            .select()
            .single();

        if (planError || !planData) throw planError;

        // 3. Create Days and Exercises
        for (const [index, day] of plan.days.entries()) {
            const { data: dayData, error: dayError } = await supabase
                .from('workout_days')
                .insert({
                    plan_id: planData.id,
                    day_name: day.dayName,
                    focus: day.focus,
                    warmup: day.warmup,
                    cardio: day.cardio, // JSONB
                    estimated_duration: day.estimatedDuration,
                    day_index: index
                })
                .select()
                .single();

            if (dayError || !dayData) throw dayError;

            // Exercises
            const exercisesToInsert = day.exercises.map((ex, i) => ({
                day_id: dayData.id,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                rpe: ex.rpe,
                rest_seconds: ex.restSeconds,
                notes: ex.notes,
                muscle_group: ex.muscleGroup,
                order_index: i
            }));

            if (exercisesToInsert.length > 0) {
                const { error: exError } = await supabase.from('exercises').insert(exercisesToInsert);
                if (exError) throw exError;
            }
        }
    },

    async getPlan(): Promise<WeeklyPlan | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Get active plan
        const { data: planData, error: planError } = await supabase
            .from('workout_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (planError || !planData) return null;

        // Get days with exercises
        const { data: daysData, error: daysError } = await supabase
            .from('workout_days')
            .select(`
        *,
        exercises (*)
      `)
            .eq('plan_id', planData.id)
            .order('day_index', { ascending: true });

        if (daysError || !daysData) return null;

        const days: WorkoutDay[] = daysData.map(d => ({
            id: d.id, // Using DB ID now
            dayName: d.day_name,
            focus: d.focus,
            warmup: d.warmup,
            cardio: d.cardio as CardioSession,
            estimatedDuration: d.estimated_duration,
            exercises: (d.exercises as any[]).sort((a, b) => a.order_index - b.order_index).map(e => ({
                id: e.id,
                name: e.name,
                sets: e.sets,
                reps: e.reps,
                rpe: e.rpe,
                restSeconds: e.rest_seconds,
                notes: e.notes,
                muscleGroup: e.muscle_group
            }))
        }));

        return {
            id: planData.id,
            createdAt: planData.created_at,
            days: days
        };
    },

    // Log Methods
    async getWorkoutLogs(): Promise<WorkoutLog[]> {
        const { data: logData, error } = await supabase
            .from('workout_logs')
            .select(`
            *,
            exercise_logs (*)
        `)
            .order('date', { ascending: true });

        if (error) return [];

        return logData.map(log => ({
            id: log.id,
            planId: log.plan_id || '',
            dayId: log.day_id || '',
            date: log.date,
            durationMinutes: log.duration_minutes,
            completedExercises: (log.exercise_logs as any[]).map(e => ({
                exerciseId: e.id, // Using DB ID, unrelated to plan ID usually
                exerciseName: e.exercise_name,
                weightUsed: e.weight_used,
                repsCompleted: e.reps_completed,
                setsCompleted: e.sets_completed,
                rating: e.rating as any,
                date: log.date // implied
            }))
        }));
    },

    async saveWorkoutLog(log: WorkoutLog): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user logged in');

        const { data: logData, error: logError } = await supabase
            .from('workout_logs')
            .insert({
                user_id: user.id,
                plan_id: log.planId || null,
                day_id: log.dayId || null,
                date: log.date,
                duration_minutes: log.durationMinutes,
                notes: null // Add notes to type if needed
            })
            .select()
            .single();

        if (logError || !logData) throw logError;

        const exLogs = log.completedExercises.map(ex => ({
            workout_log_id: logData.id,
            exercise_name: ex.exerciseName,
            weight_used: ex.weightUsed,
            reps_completed: ex.repsCompleted,
            sets_completed: ex.setsCompleted,
            rating: ex.rating
        }));

        if (exLogs.length > 0) {
            const { error: exError } = await supabase.from('exercise_logs').insert(exLogs);
            if (exError) throw exError;
        }
    },

    async getLastLogForExercise(exerciseName: string): Promise<{ weight: number, rating: 'easy' | 'ok' | 'hard' } | null> {
        // This query is a bit complex in Supabase to do efficiently without a join on latest
        // We can select exercise_logs ordered by date via inner join but Supabase simplify:
        // Select exercise logs where name matches, order by created_at desc limit 1?
        // exercise_logs doesn't have date, workout_logs has date.

        const { data, error } = await supabase
            .from('exercise_logs')
            .select(`
            weight_used,
            rating,
            workout_logs!inner(date)
        `)
            .eq('exercise_name', exerciseName)
            .order('workout_logs(date)', { ascending: false } as any) // Syntax might be tricky
            .limit(1)
            .maybeSingle(); // Use maybeSingle to avoid 406 on 0 rows

        // The order by on joined table is tricky. 
        // Alternative: Get logs, flatten, sort client side if volume is low, OR use a specialized RPC / view.
        // For now, let's try a simpler approach if the above fails or just fetch last 10 workouts and find it.

        if (data) {
            return { weight: data.weight_used, rating: data.rating as any };
        }
        return null;
    },

    async getHistory(): Promise<HistoryItem[]> {
        const { data: wLogs } = await supabase.from('workout_logs').select('id, date, duration_minutes').order('date', { ascending: false }).limit(5);
        const { data: weightLogs } = await supabase.from('weight_logs').select('id, date, weight').order('date', { ascending: false }).limit(5);

        const history: HistoryItem[] = [];

        wLogs?.forEach(l => history.push({
            id: l.id,
            type: 'workout',
            title: 'Treino Concluído',
            date: l.date,
            description: `${l.duration_minutes} min`
        }));

        weightLogs?.forEach(l => history.push({
            id: l.id,
            type: 'weight',
            title: 'Peso Registrado',
            date: l.date,
            description: `${l.weight}kg`
        }));

        return history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }
};
