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
      
      IMPORTANTE: Equilíbrio entre volume e intensidade. NÃO GERE DIAS 5, 6 OU 7.
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
SEU TOM DE VOZ: Técnico, motivador e direto. Um treinador exigente que foca na qualidade do movimento.

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

🚨 REGRA DE OURO (SEGURANÇA):
As Limitações Físicas (${user.limitations || 'Nenhuma'}) TÊM PRIORIDADE TOTAL sobre qualquer outra regra.
Se houver dor ou lesão reportada (ex: "dor no joelho"), ELIMINE exercícios de alto impacto ou carga axial direta nessa articulação e substitua por alternativas seguras.

DIRETRIZES TÉCNICAS OBRIGATÓRIAS:

1. GESTÃO DE TEMPO (PRIORIDADE):
   - O tempo total (${user.timePerWorkout || 60}min) é um LIMITE RÍGIDO.
   - Se o treino ficou longo demais: REDUZA o cardio para 10-15min ou REMOVA 1 série de cada exercício.
   - NÃO sacrifique o aquecimento.

2. ESTRUTURA E ORDEM:
   - Aquecimento (5-7min): Mobilidade + Ativação Específica.
   - Musculação: Compostos PRIMEIRO (exceto técnica de pré-exaustão para Avançados).
   - Cardio: Ao final.

3. PARÂMETROS DE VOLUME E INTENSIDADE (Refinados):
   
   INICIANTE:
   - Foco: Aprendizado motor e consistência.
   - 3 Séries | 10-15 Reps | RPE 6-7 | Descanso 60-90s.
   
   INTERMEDIÁRIO:
   - Foco Hipertrofia: 3-4 Séries | 8-12 Reps | RPE 7-8.
   - Foco Resistência/Definição: 3 Séries | 12-15 Reps | RPE 7-8.
   - NUNCA misture faixas aleatoriamente. Escolha uma via metabólica.
   - Descanso: 45-75s.
   
   AVANÇADO:
   - Foco Performance/Quebra de Platô.
   - 4-6 Séries | 6-12 Reps (Periodização) | RPE 8-9 (Falha técnica).
   - Técnicas: Drop-sets e Bi-sets permitidos estrategicamente.
   - Descanso: 30-90s.

4. PROGRESSÃO E VARIAÇÃO REAL:
   - Variação significa MUDAR O EXERCÍCIO ou O ÂNGULO (ex: Supino Barra -> Supino Halter), não apenas a pegada.
   - Se o plano for Push/Pull/Legs 2x (6 dias): Os dias A e B DEVEM ter exercícios diferentes para estimular porções diferentes do músculo.
   - Essa regra vale para TODOS os grupos (Push, Pull e Legs).

5. NOTAS TÉCNICAS (PADRÃO "TREINADOR ELITE"):
   - Formato curto e imperativo (Max 10 palavras).
   - Foco em erro comum. Ex: "Contraia o glúteo no topo", "Não curve a lombar", "Cotovelos fechados".

6. FORMATO DE CARDIO (EMAGRECIMENTO):
   - HIIT: Ideal pós-treino de Braços/Tronco. (10-15min explulsivos).
   - LISS: Ideal pós-treino de Pernas ou dias de recuperação. (20-30min constantes).

FORMATO DE RESPOSTA (JSON ESTRITO):
{
  "days": [
    {
      "id": "day-1",
      "dayName": "Dia 1 - [Nome do Treino com Foco]",
      "focus": "[Grupo Muscular Principal]",
      "warmup": "[Descrição detalhada do aquecimento - 5-7min]",
      "exercises": [
        {
          "id": "ex-1",
          "name": "[Nome EXATO do exercício]",
          "sets": [número],
          "reps": "[faixa ex: 10-12]",
          "rpe": [número],
          "restSeconds": [segundos],
          "notes": "[Dica técnica de elite]",
          "muscleGroup": "[grupo]"
        }
      ],
      "cardio": {
        "type": "[HIIT/LISS/Misto]",
        "durationMinutes": [tempo],
        "intensity": "[intensidade]",
        "notes": "[Protocolo ex: 30s ON / 30s OFF]"
      },
      "estimatedDuration": [tempo total estimado]
    }
  ]
}

VALIDAÇÕES FINAIS:
✓ Gere EXATAMENTE ${user.daysPerWeek} dias.
✓ Verifique se a soma (Warmup + (Series * (Tempo Execucao + Descanso)) + Cardio) cabe em ${user.timePerWorkout || 60}min.
✓ Se "Dor no Joelho": ZERO agachamento profundo/impacto.
✓ Se "Dor no Ombro": ZERO desenvolvimento militar/supino inclinado excessivo.
✓ Retorne APENAS o JSON.
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
  expectedDays: number,
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

      // STRICT VALIDATION: Check day count
      if (data.days.length > expectedDays) {
        console.warn(`⚠️ Gemini gerou ${data.days.length} dias, mas o usuário pediu ${expectedDays}. Cortando excesso.`);
        data.days = data.days.slice(0, expectedDays);
      } else if (data.days.length < expectedDays) {
        console.warn(`⚠️ Gemini gerou menos dias (${data.days.length}) que o pedido (${expectedDays}).`);
        // In strict mode we might throw, but for now accept to avoid 500 error, user will just have fewer days
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
  expectedDays: number,
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

      // STRICT VALIDATION: Check day count
      if (data.days.length > expectedDays) {
        console.warn(`⚠️ Groq gerou ${data.days.length} dias, mas o usuário pediu ${expectedDays}. Cortando excesso.`);
        data.days = data.days.slice(0, expectedDays);
      } else if (data.days.length < expectedDays) {
        console.warn(`⚠️ Groq gerou menos dias (${data.days.length}) que o pedido (${expectedDays}).`);
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
        const workoutPlan = await generateWithGemini(geminiKey, systemPrompt, user.daysPerWeek);
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

    const workoutPlan = await generateWithGroq(groqKey, systemPrompt, user.daysPerWeek);
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