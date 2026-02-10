import { GoogleGenAI } from "npm:@google/genai";
import { corsHeaders } from "./cors.ts";

const EXERCISES_LIST = [
    "Supino Reto com Barra", "Supino Inclinado com Halteres", "Puxada Alta (Polia)",
    "Remada Curvada", "Agachamento Livre", "Leg Press 45", "Desenvolvimento com Halteres",
    "Elevação Lateral", "Tríceps Corda", "Rosca Direta Barra W", "Prancha Abdominal"
].join(", ");

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { user } = await req.json();

        if (!user) {
            throw new Error("Perfil de usuário não fornecido");
        }

        const apiKey = Deno.env.get('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY não configurada no ambiente");
        }

        const ai = new GoogleGenAI({ apiKey });

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
      [${EXERCISES_LIST}]
      Se necessário variar, use nomes muito comuns em Português.
  
      PERFIL DO ALUNO:
      - Nível: ${user.experience || 'Intermediário'}
      - Disponibilidade: ${user.daysPerWeek || 4} dias/semana
      - Equipamento: Academia Completa
      - Objetivo: Emagrecimento (Definição + Gasto Calórico)
      - Tempo por treino: ${user.timePerWorkout || 60} min
      - Preferência de Cardio: ${user.cardioPreference || 'Misto'}
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

        const modelId = 'gemini-2.0-flash'; // Using newer model if available, or fallback to reliable one. Trying gemini-2.0-flash as it is fast.

        // Fallback to flash-lite or similar if 2.0 not avail in this library version yet, but 1.5-flash is safe.
        // Let's stick to gemini-1.5-flash for stability unless I know 2.0 is out in this SDK.
        // Actually, gemini-2.0-flash-exp is available. Let's use gemini-1.5-flash for production stability.

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: systemPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });

        if (response.text) {
            let data = JSON.parse(response.text);
            if (!data.days) throw new Error("Formato inválido retornado pela IA");

            return new Response(JSON.stringify(data), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            });
        }

        throw new Error("Resposta vazia da IA");

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });
    }
});
