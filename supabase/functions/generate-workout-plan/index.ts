import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "./cors.ts";

// ==================== LISTA COMPLETA DE EXERCÍCIOS ====================
const EXERCISES_BY_MUSCLE = {
  peito: [
    "Supino Reto com Barra", "Supino Inclinado com Barra", "Supino Declinado com Barra",
    "Supino Reto com Halteres", "Supino Inclinado com Halteres", "Supino Declinado com Halteres",
    "Crucifixo Reto com Halteres", "Crucifixo Inclinado com Halteres",
    "Crucifixo na Polia", "Crossover na Polia", "Peck Deck (Voador)",
    "Flexão de Braço", "Flexão com Pés Elevados", "Pullover com Halteres"
  ],
  costas: [
    "Puxada Alta (Polia)", "Puxada Frontal Aberta", "Puxada Triangular",
    "Remada Curvada com Barra", "Remada Curvada com Halteres", "Remada Cavalinho",
    "Remada Baixa na Polia", "Remada Unilateral com Halter", "Remada T-Bar",
    "Barra Fixa", "Levantamento Terra", "Levantamento Terra Romeno",
    "Pulldown com Corda", "Remada Alta", "Encolhimento com Barra",
    "Encolhimento com Halteres", "Pullover na Polia"
  ],
  pernas_quadriceps: [
    "Agachamento Livre", "Agachamento Frontal", "Agachamento Hack",
    "Leg Press 45", "Leg Press Horizontal", "Cadeira Extensora",
    "Afundo com Barra", "Afundo com Halteres", "Afundo Caminhando",
    "Agachamento Sumô", "Agachamento Búlgaro", "Sissy Squat"
  ],
  pernas_posterior: [
    "Levantamento Terra Romeno", "Stiff com Barra", "Stiff com Halteres",
    "Mesa Flexora", "Flexora em Pé", "Flexora Sentado",
    "Good Morning", "Nordic Curl", "Cadeira Flexora Unilateral"
  ],
  pernas_gluteos: [
    "Hip Thrust com Barra", "Hip Thrust na Máquina", "Elevação Pélvica",
    "Cadeira Abdutora", "Coice na Polia", "Coice na Máquina",
    "Agachamento Sumô", "Afundo Reverso", "Step Up com Halteres"
  ],
  pernas_panturrilha: [
    "Panturrilha em Pé na Máquina", "Panturrilha Sentado",
    "Panturrilha no Leg Press", "Panturrilha Unilateral", "Gêmeos Livre"
  ],
  ombros: [
    "Desenvolvimento com Barra", "Desenvolvimento com Halteres",
    "Desenvolvimento Arnold", "Desenvolvimento na Máquina",
    "Elevação Lateral com Halteres", "Elevação Lateral na Polia",
    "Elevação Frontal com Barra", "Elevação Frontal com Halteres",
    "Crucifixo Invertido com Halteres", "Crucifixo Invertido na Polia",
    "Remada Alta com Barra", "Remada Alta com Halteres",
    "Face Pull na Polia", "Desenvolvimento Militar"
  ],
  biceps: [
    "Rosca Direta com Barra", "Rosca Direta Barra W", "Rosca Direta com Halteres",
    "Rosca Alternada", "Rosca Martelo", "Rosca Scott com Barra",
    "Rosca Scott com Halteres", "Rosca Concentrada", "Rosca 21",
    "Rosca na Polia Baixa", "Rosca Inversa", "Rosca Simultânea"
  ],
  triceps: [
    "Tríceps Corda na Polia", "Tríceps Barra Reta", "Tríceps Francês com Barra",
    "Tríceps Francês com Halteres", "Tríceps Testa", "Mergulho em Paralelas",
    "Mergulho no Banco", "Tríceps Coice com Halteres", "Tríceps na Máquina",
    "Tríceps Unilateral na Polia", "Supino Fechado"
  ],
  abdomen: [
    "Prancha Abdominal", "Prancha Lateral", "Prancha Dinâmica",
    "Abdominal Supra", "Abdominal Remador", "Abdominal na Polia",
    "Elevação de Pernas Suspenso", "Elevação de Pernas no Apoio",
    "Abdominal Bicicleta", "Mountain Climber", "Russian Twist",
    "Ab Wheel (Roda Abdominal)", "Abdominal Canivete", "Dead Bug"
  ]
};

const ALL_EXERCISES = Object.values(EXERCISES_BY_MUSCLE).flat().join(", ");

// ==================== CONFIGURAÇÕES ====================
const CONFIG = {
  TIMEOUT_MS: 45000, // 45 segundos
  MAX_RETRIES: 2,
  GEMINI_MODEL: 'gemini-1.5-flash',
  GROQ_MODEL: 'llama-3.3-70b-versatile'
};

// ==================== INTERFACES ====================
interface UserProfile {
  experience?: string;
  daysPerWeek: number;
  timePerWorkout?: number;
  cardioPreference?: string;
  limitations?: string;
  goal?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rpe: number;
  restSeconds: number;
  notes: string;
  muscleGroup: string;
}

interface CardioSession {
  type: string;
  durationMinutes: number;
  intensity: string;
  notes: string;
}

interface WorkoutDay {
  id: string;
  dayName: string;
  focus: string;
  warmup: string;
  exercises: Exercise[];
  cardio: CardioSession;
  estimatedDuration: number;
}

interface WorkoutPlan {
  days: WorkoutDay[];
}

// ==================== HELPER FUNCTIONS ====================
function validateUserProfile(user: UserProfile): void {
  if (!user) {
    throw new Error("Perfil de usuário não fornecido");
  }

  // Relaxed validation to match UI (1-7 days)
  if (!user.daysPerWeek || user.daysPerWeek < 1 || user.daysPerWeek > 7) {
    throw new Error("Dias por semana deve ser entre 1 e 7");
  }

  if (user.timePerWorkout && (user.timePerWorkout < 15 || user.timePerWorkout > 180)) {
    throw new Error("Tempo por treino deve ser entre 15 e 180 minutos");
  }
}

function getSplitStrategy(daysPerWeek: number): string {
  const strategies: Record<number, string> = {
    1: `
      DIVISÃO OBRIGATÓRIA (1 Dia - Full Body):
      - Dia 1: Full Body Completo (Foco em Compostos: Agachamento, Supino, Remada, Desenvolvimento)
      
      IMPORTANTE: Volume alto por sessão, já que é o único estímulo semanal.
    `,
    2: `
      DIVISÃO OBRIGATÓRIA (2 Dias - Upper/Lower ou Full Body 2x):
      - Dia 1: Membros Superiores (Push/Pull) + Core
      - Dia 2: Membros Inferiores (Legs) + Cardio
      OU
      - Dia 1: Full Body A
      - Dia 2: Full Body B
      
      IMPORTANTE: Garanta pelo menos 48h de descanso entre os treinos se for Full Body.
    `,
    3: `
      DIVISÃO OBRIGATÓRIA (3 Dias - ABC):
      - Dia 1 (A): Peito + Tríceps + Ombro Anterior + Cardio Moderado
      - Dia 2 (B): Costas + Bíceps + Ombro Posterior + Cardio Moderado
      - Dia 3 (C): Pernas Completo (Quadríceps + Posterior + Glúteo + Panturrilha) + Abdômen + Cardio Leve
      
      IMPORTANTE: Maximize cada treino com volume alto para compensar menor frequência semanal.
    `,
    4: `
      DIVISÃO OBRIGATÓRIA (4 Dias - ABCD):
      - Dia 1 (A): Peito + Tríceps + Cardio Moderado (15-20min)
      - Dia 2 (B): Costas + Bíceps + Cardio Moderado (15-20min)
      - Dia 3 (C): Pernas Completo (Quadríceps + Posterior + Glúteo + Panturrilha) + Cardio Leve (10-15min)
      - Dia 4 (D): Ombros (Anterior/Lateral/Posterior) + Abdômen + Cardio Moderado (20min)
      
      IMPORTANTE: Equilíbrio entre volume e intensidade.
    `,
    5: `
      DIVISÃO OBRIGATÓRIA (5 Dias):
      - Dia 1: Peito + Cardio HIIT (15min)
      - Dia 2: Costas + Cardio Moderado (20min)
      - Dia 3: Pernas (Quadríceps + Panturrilha) + Cardio Leve (10min)
      - Dia 4: Ombros + Abdômen + Cardio Moderado (15min)
      - Dia 5: Posterior de Coxa + Glúteo + Braços (Bíceps/Tríceps) + Cardio HIIT (15min)
      
      IMPORTANTE: Divisão permite maior especialização muscular.
    `,
    6: `
      DIVISÃO OBRIGATÓRIA (6 Dias - Push/Pull/Legs 2x):
      - Dia 1: PUSH A (Peito + Ombro Anterior/Lateral + Tríceps) + Cardio 15min
      - Dia 2: PULL A (Costas + Ombro Posterior + Bíceps) + Cardio 15min
      - Dia 3: LEGS A (Quadríceps + Panturrilha) + Cardio Leve 10min
      - Dia 4: PUSH B (Peito + Ombro Anterior/Lateral + Tríceps) [variação de exercícios] + Cardio 15min
      - Dia 5: PULL B (Costas + Ombro Posterior + Bíceps) [variação de exercícios] + Cardio 15min
      - Dia 6: LEGS B (Posterior + Glúteo + Abdômen) + Cardio Leve 10min
      
      IMPORTANTE: Máxima frequência - varie exercícios entre dia A e B do mesmo grupo.
    `,
    7: `
      DIVISÃO OBRIGATÓRIA (7 Dias - Frequência Contínua):
      - Seguir estrutura Push/Pull/Legs rotativa ou Upper/Lower adaptado.
      - Dia 7 deve ser OBRIGATORIAMENTE Recuperação Ativa (Cardio leve + Mobilidade + Abdominal) ou um treino regenerativo.
      
      IMPORTANTE: Cuidado extremo com volume para não gerar overtraining.
    `
  };

  return strategies[daysPerWeek] || strategies[4];
}

function buildSystemPrompt(user: UserProfile): string {
  const splitStrategy = getSplitStrategy(user.daysPerWeek);

  return `
Você é o LevelUp Fitness AI, um treinador de elite brasileiro especializado em emagrecimento, hipertrofia e performance.

LISTA COMPLETA DE EXERCÍCIOS DISPONÍVEIS (USE PREFERENCIALMENTE ESTES):
${ALL_EXERCISES}

BANCO DE DADOS DE EXERCÍCIOS POR GRUPO MUSCULAR:
${JSON.stringify(EXERCISES_BY_MUSCLE, null, 2)}

PERFIL DETALHADO DO ALUNO:
- Nível de Experiência: ${user.experience || 'Intermediário'}
- Disponibilidade Semanal: ${user.daysPerWeek} dias/semana
- Equipamento Disponível: Academia Completa
- Objetivo Principal: ${user.goal || 'Emagrecimento (Definição + Gasto Calórico + Preservação Muscular)'}
- Tempo Disponível por Treino: ${user.timePerWorkout || 60} minutos
- Preferência de Cardio: ${user.cardioPreference || 'Misto (HIIT + LISS)'}
- Limitações Físicas/Restrições: ${user.limitations || 'Nenhuma reportada'}

${splitStrategy}

DIRETRIZES TÉCNICAS OBRIGATÓRIAS:

1. ESTRUTURA DE CADA DIA:
   - Aquecimento Específico: 5-7 minutos (mobilidade + ativação neuromuscular)
   - Exercícios de Musculação: 6 a 9 exercícios por treino
   - Cardio Final: Duração e intensidade ajustadas ao objetivo

2. SELEÇÃO E ORDEM DOS EXERCÍCIOS:
   - SEMPRE comece com exercícios compostos/multiarticulares (ex: Supino, Agachamento, Remada)
   - Progr ida para exercícios de isolamento
   - Priorize exercícios da lista fornecida
   - Varie pegadas, ângulos e equipamentos para estimulação completa
   - Para emagrecimento: prefira exercícios que recrutam mais massa muscular

3. PARÂMETROS DE TREINO (BASEADO NO NÍVEL):
   
   INICIANTE:
   - Séries: 3-4 por exercício
   - Repetições: 10-15 (controle e aprendizado motor)
   - RPE: 6-7 (deixar 3-4 reps na reserva)
   - Descanso: 60-90 segundos
   
   INTERMEDIÁRIO:
   - Séries: 3-5 por exercício
   - Repetições: 8-12 (hipertrofia) ou 12-15 (resistência/definição)
   - RPE: 7-8 (deixar 2-3 reps na reserva)
   - Descanso: 45-75 segundos
   
   AVANÇADO:
   - Séries: 4-6 por exercício (podendo usar drop sets, bi-sets)
   - Repetições: 6-15 (periodização ondulatória)
   - RPE: 8-9 (deixar 1-2 reps na reserva)
   - Descanso: 30-90 segundos (variar conforme exercício)

4. CARDIO ESTRATÉGICO PARA EMAGRECIMENTO:
   
   HIIT (Alta Intensidade Intervalado):
   - Duração: 10-20 minutos
   - Ideal pós-treino de membros superiores
   - Exemplos: Bike sprint, Escada, Burpees, Remador
   
   LISS (Baixa Intensidade Contínuo):
   - Duração: 20-30 minutos
   - Ideal pós-treino de pernas
   - Exemplos: Esteira inclinada, Elíptico, Bike leve
   
   MISTO:
   - Alternar entre HIIT e LISS ao longo da semana

5. PROGRESSÃO E VARIAÇÃO:
   - Se treino 6 dias (Push/Pull/Legs 2x): dia A e B do mesmo grupamento devem ter exercícios DIFERENTES
   - Exemplo: Push A (Supino Barra + Crucifixo Halter), Push B (Supino Halter + Crossover Polia)

6. NOTAS TÉCNICAS:
   - SEMPRE inclua uma dica de execução técnica para cada exercício
   - Foque em: controle, amplitude, respiração, postura, ativação muscular

FORMATO DE RESPOSTA (JSON ESTRITO - COPIE EXATAMENTE ESTA ESTRUTURA):

{
  "days": [
    {
      "id": "day-1",
      "dayName": "Dia 1 - [Nome do Treino]",
      "focus": "[Grupo Muscular Principal]",
      "warmup": "[Descrição detalhada do aquecimento específico - 5-7min]",
      "exercises": [
        {
          "id": "ex-1",
          "name": "[Nome EXATO do exercício da lista fornecida]",
          "sets": [número de séries],
          "reps": "[faixa de repetições - ex: 10-12]",
          "rpe": [7, 8 ou 9],
          "restSeconds": [30-90],
          "notes": "[Dica técnica específica e objetiva]",
          "muscleGroup": "[grupo muscular principal]"
        }
      ],
      "cardio": {
        "type": "[Tipo específico de cardio - ex: HIIT na Bike, Esteira Inclinada LISS]",
        "durationMinutes": [10-30],
        "intensity": "[leve|moderada|alta|intervalado]",
        "notes": "[Protocolo detalhado - ex: 30seg sprint / 30seg recuperação x 10 rounds]"
      },
      "estimatedDuration": [tempo total estimado em minutos]
    }
  ]
}

VALIDAÇÕES FINAIS:
✓ Gere EXATAMENTE ${user.daysPerWeek} dias de treino
✓ Cada dia deve ter entre 6-9 exercícios de musculação
✓ Use exercícios da lista fornecida sempre que possível
✓ Varie os exercícios ao longo da semana (sem repetições desnecessárias)
✓ Cardio presente em TODOS os dias
✓ Tempo total de cada treino deve respeitar o limite de ${user.timePerWorkout || 60} minutos
✓ Aquecimento específico e relevante para cada treino
✓ Retorne APENAS o JSON, sem texto adicional
`;
}

// ==================== TIMEOUT WRAPPER ====================
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operação excedeu o tempo limite'
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

// ==================== GEMINI GENERATOR ====================
async function generateWithGemini(
  apiKey: string,
  systemPrompt: string,
  retries: number = CONFIG.MAX_RETRIES
): Promise<WorkoutPlan> {
  const ai = new GoogleGenerativeAI(apiKey);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Tentativa Gemini ${attempt + 1}/${retries + 1}`);

      const model = ai.getGenerativeModel({
        model: CONFIG.GEMINI_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 8192
        }
      });

      const response = await withTimeout(
        model.generateContent(systemPrompt),
        CONFIG.TIMEOUT_MS,
        'Gemini API timeout'
      );

      const text = response.response.text();
      if (!text) {
        throw new Error('Resposta vazia do Gemini');
      }

      const data = JSON.parse(text) as WorkoutPlan;

      if (!data.days || !Array.isArray(data.days) || data.days.length === 0) {
        throw new Error('Formato inválido: faltam dias de treino');
      }

      console.log(`✅ Sucesso Gemini: ${data.days.length} dias gerados`);
      return data;

    } catch (error) {
      console.error(`❌ Erro Gemini tentativa ${attempt + 1}:`, error);

      if (attempt === retries) {
        throw error;
      }

      // Aguarda antes de tentar novamente (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error('Falha em todas as tentativas do Gemini');
}

// ==================== GROQ GENERATOR (FALLBACK) ====================
async function generateWithGroq(
  apiKey: string,
  systemPrompt: string,
  retries: number = CONFIG.MAX_RETRIES
): Promise<WorkoutPlan> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Tentativa Groq ${attempt + 1}/${retries + 1}`);

      const response = await withTimeout(
        fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: CONFIG.GROQ_MODEL,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: "Gere o plano de treino completo em JSON conforme as instruções." }
            ],
            response_format: { type: "json_object" },
            temperature: 0.8,
            max_tokens: 8000
          })
        }),
        CONFIG.TIMEOUT_MS,
        'Groq API timeout'
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq HTTP ${response.status}: ${errorText}`);
      }

      const groqData = await response.json();
      const content = groqData.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Resposta vazia do Groq');
      }

      const data = JSON.parse(content) as WorkoutPlan;

      if (!data.days || !Array.isArray(data.days) || data.days.length === 0) {
        throw new Error('Formato inválido: faltam dias de treino');
      }

      console.log(`✅ Sucesso Groq: ${data.days.length} dias gerados`);
      return data;

    } catch (error) {
      console.error(`❌ Erro Groq tentativa ${attempt + 1}:`, error);

      if (attempt === retries) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }

  throw new Error('Falha em todas as tentativas do Groq');
}

// ==================== MAIN HANDLER ====================
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando geração de plano de treino...');

    // 1. Verify Authentication Manually
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !authUser) {
      console.error('❌ Auth Error:', authError);
      throw new Error('Unauthorized: Invalid Token');
    }

    // Parse and validate request
    const { user } = await req.json();
    validateUserProfile(user);

    console.log(`📋 Perfil: ${user.daysPerWeek} dias/semana, Nível: ${user.experience || 'Intermediário'}`);

    // Build prompt
    const systemPrompt = buildSystemPrompt(user);

    // Try Gemini first
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const workoutPlan = await generateWithGemini(geminiKey, systemPrompt);
        return new Response(JSON.stringify(workoutPlan), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      } catch (geminiError) {
        console.error('⚠️ Gemini falhou, tentando Groq...', geminiError);
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY não configurada, pulando para Groq');
    }

    // Fallback to Groq
    const groqKey = Deno.env.get('GROQ_API_KEY');
    if (!groqKey) {
      throw new Error('Nenhuma API key configurada (GEMINI_API_KEY ou GROQ_API_KEY)');
    }

    const workoutPlan = await generateWithGroq(groqKey, systemPrompt);
    return new Response(JSON.stringify(workoutPlan), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('💥 Erro fatal:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Erro desconhecido',
        details: error.toString(),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});