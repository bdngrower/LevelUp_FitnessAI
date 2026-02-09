import { GoogleGenAI } from "@google/genai";
import { UserProfile, WeeklyPlan } from "../types";
import { EXERCISE_DB } from "../data/exercises";

export const generateWorkoutPlan = async (user: UserProfile): Promise<WeeklyPlan> => {
  // Initialize AI client lazily to avoid 'process is not defined' crashes during initial bundle load
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Create a list of available exercises to guide the AI
  const availableExercises = Object.keys(EXERCISE_DB).join(", ");

  let splitStrategy = "";
  if (user.daysPerWeek === 4) {
    splitStrategy = `
      DIVISÃO OBRIGATÓRIA (4 Dias):
      - Dia 1: Peito + Tríceps + Cardio
      - Dia 2: Costas + Bíceps + Cardio
      - Dia 3: Pernas Completo (Quadríceps/Posterior/Glúteo/Panturrilha) + Cardio Leve
      - Dia 4: Ombros + Abdômen + Cardio
    `;
  } else if (user.daysPerWeek === 5) {
    splitStrategy = "Divisão sugerida: ABC Superior/Inferior ou Body Part Split (Peito, Costas, Pernas, Ombros, Braços).";
  } else {
    splitStrategy = "Divisão sugerida: ABC x2 (Push/Pull/Legs).";
  }

  const systemPrompt = `
    Você é o LevelUp Fitness AI, um treinador de elite brasileiro especializado em emagrecimento e definição.
    Crie um plano de treino semanal em formato JSON.
    
    IMPORTANTE: Use PREFERENCIALMENTE exercícios desta lista para garantir que o app mostre a ficha técnica correta:
    [${availableExercises}]
    Se necessário variar, use nomes muito comuns em Português.

    PERFIL DO ALUNO:
    - Nível: ${user.experience} (Iniciante/Intermediário/Avançado)
    - Disponibilidade: ${user.daysPerWeek} dias/semana
    - Equipamento: Academia Completa
    - Objetivo: Emagrecimento (Definição + Gasto Calórico)
    - Tempo por treino: ${user.timePerWorkout} min
    - Preferência de Cardio: ${user.cardioPreference}
    - Limitações físicas: ${user.limitations || "Nenhuma"}
    
    ESTRUTURA DO PLANO:
    ${splitStrategy}
    
    DIRETRIZES:
    - Gere exatamente ${user.daysPerWeek} dias de treino.
    - Cada dia deve ter: Aquecimento (5m), 5 a 8 Exercícios de Musculação, Cardio Final.
    - Exercícios compostos primeiro.
    - Cardio: Ajuste a intensidade e duração para foco em queima de gordura (ex: HIIT leve ou LISS).
    
    FORMATO DE RESPOSTA (JSON ESTRITO):
    {
      "days": [
        {
          "id": "day-1",
          "dayName": "string (ex: Dia 1 - Peito e Tríceps)",
          "focus": "string (ex: Peito e Tríceps)",
          "warmup": "string (ex: 5min esteira + manguito rotador)",
          "exercises": [
             { 
               "id": "ex-1", 
               "name": "string (Nome exato da lista fornecida se possível)", 
               "sets": number, 
               "reps": "string (ex: 10-12 ou 8-10)", 
               "rpe": number (7-9), 
               "restSeconds": number, 
               "notes": "string (Dica curta de técnica)", 
               "muscleGroup": "string"
             }
          ],
          "cardio": {
             "type": "string (ex: Esteira Inclinada)", 
             "durationMinutes": number, 
             "intensity": "leve|moderada|alta|intervalado", 
             "notes": "string"
          },
          "estimatedDuration": number
        }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        days: data.days
      };
    }
    throw new Error("Nenhum dado retornado pela IA");
  } catch (error) {
    console.error("Erro ao gerar plano:", error);
    throw error;
  }
};