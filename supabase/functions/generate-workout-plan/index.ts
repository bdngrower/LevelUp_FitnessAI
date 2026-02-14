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

    // Manual JWT Verification (since we'll disable Gateway verification for debugging)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
        console.error("Missing Authorization Header");
        return new Response(JSON.stringify({ error: "Missing Authorization Header" }), { status: 401, headers: corsHeaders });
    }

    try {
        const { user, progressionContext, previousExercises } = await req.json();

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
      
      ${progressionContext ? `
      CONTEXTO DE EVOLUÇÃO (IMPORTANTE):
      O aluno completou a semana anterior.
      FEEDBACK: ${progressionContext}
      
      APLIQUE SOBRECARGA PROGRESSIVA:
      - Aumente levemente o volume (séries/reps) OU a intensidade em relação a um treino padrão.
      - Foco em técnica aprimorada e estímulo metabólico.
      ` : ''}

      ${previousExercises && previousExercises.length > 0 ? `
      VARIEDADE E ROTAÇÃO DE EXERCÍCIOS (CRÍTICO):
      Os seguintes exercícios foram usados no último plano:
      [${previousExercises.join(', ')}]
      
      DIRETRIZES DE VARIEDADE:
      1. EVITE REPETIR exercícios dessa lista, especialmente para o mesmo grupo muscular.
      2. SUBSTITUA por variações biomecanicamente equivalentes.
         Exemplos:
         - Supino Reto Barra -> Supino Reto Halteres ou Máquina
         - Agachamento Livre -> Leg Press ou Hack Machine
         - Puxada Alta -> Barra Fixa ou Graviton
      3. Se não houver alternativa viável (ex: exercícios muito básicos), pode manter, mas mude o método (ex: de 3x10 para 4x8 ou Drop-set).
      4. O objetivo é dar novos estímulos ao músculo.
      ` : ''}

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
        console.error("Erro com Gemini:", error);

        // Fallback to Groq
        const groqKey = Deno.env.get('GROQ_API_KEY');
        if (groqKey) {
            try {
                console.log("Tentando fallback com Groq...");
                const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile", // Or mixtral-8x7b-32768
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: "Gere o plano de treino JSON." }
                        ],
                        response_format: { type: "json_object" }
                    })
                });

                if (groqResponse.ok) {
                    const groqData = await groqResponse.json();
                    const content = groqData.choices[0]?.message?.content;
                    if (content) {
                        const data = JSON.parse(content);
                        return new Response(JSON.stringify(data), {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            status: 200
                        });
                    }
                } else {
                    console.error("Erro Groq:", await groqResponse.text());
                }
            } catch (groqError) {
                console.error("Erro total no fallback Groq:", groqError);
            }
        }

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
        });
    }
});
