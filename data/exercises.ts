import { ExerciseDefinition } from "../types";

export const EXERCISE_DB: Record<string, ExerciseDefinition> = {
  "Supino Reto com Barra": {
    id: "supino_reto",
    name: "Supino Reto com Barra",
    muscleGroup: "Peito",
    equipment: "Banco Supino e Barra Olímpica",
    alternatives: ["Supino com Halteres", "Máquina de Supino Sentado"],
    execution: {
      setup: "Deite-se no banco com os olhos abaixo da barra. Pés firmes no chão. Faça a retração escapular (junte as omoplatas). Pegada levemente mais larga que os ombros.",
      movement: "Tire a barra do suporte. Desça controladamente até tocar o meio do peito (linha dos mamilos). Empurre a barra para cima explosivamente.",
      tips: "Não tire a lombar do banco excessivamente (ponte leve é ok). Cotovelos devem estar a 45º do tronco, não 90º."
    },
    muscles: {
      primary: "Peitoral Maior",
      secondary: ["Tríceps", "Deltoide Anterior"]
    },
    tempo: "2s descida, 1s pausa embaixo, 1s subida (2-1-1-0)",
    safety: "Mantenha os punhos retos. Se for carga alta, peça ajuda (spotter).",
    defaultLoad: {
      male: { beginner: 20, intermediate: 50, advanced: 80 }, // Total weight (bar + plates)
      female: { beginner: 10, intermediate: 25, advanced: 40 }
    }
  },
  "Supino Inclinado com Halteres": {
    id: "supino_inclinado_halter",
    name: "Supino Inclinado com Halteres",
    muscleGroup: "Peito",
    equipment: "Banco Inclinado (30-45º) e Halteres",
    alternatives: ["Supino Inclinado Máquina", "Supino Inclinado Barra"],
    execution: {
      setup: "Ajuste o banco a 30 ou 45 graus. Sente-se com os halteres nos joelhos. Use as pernas para impulsionar os pesos para a posição inicial.",
      movement: "Desça os halteres flexionando os cotovelos até a altura do peito. Empurre para cima unindo-os no topo sem bater.",
      tips: "Mantenha o peito estufado o tempo todo."
    },
    muscles: {
      primary: "Peitoral Superior",
      secondary: ["Tríceps", "Deltoide Anterior"]
    },
    tempo: "2-0-1-0",
    safety: "Cuidado ao soltar os pesos no final, não jogue os ombros para trás.",
    defaultLoad: {
      male: { beginner: 10, intermediate: 20, advanced: 30 }, // Per hand
      female: { beginner: 4, intermediate: 10, advanced: 16 }
    }
  },
  "Puxada Alta (Polia)": {
    id: "puxada_alta",
    name: "Puxada Alta (Polia)",
    muscleGroup: "Costas",
    equipment: "Máquina de Puxada Alta (Lat Pulldown)",
    alternatives: ["Barra Fixa (Graviton)", "Puxada Articulada"],
    execution: {
      setup: "Ajuste o apoio de pernas para ficar firme. Pegada aberta (maior que ombros). Tronco levemente inclinado para trás.",
      movement: "Puxe a barra em direção ao peitoral superior, focando em descer os cotovelos. Controle a subida.",
      tips: "Pense em 'esmagar' uma laranja com as axilas. Não balance o corpo."
    },
    muscles: {
      primary: "Latíssimo do Dorso",
      secondary: ["Bíceps", "Redondo Maior"]
    },
    tempo: "2-1-1-0",
    safety: "Não puxe a barra atrás da nuca (risco para ombros).",
    defaultLoad: {
      male: { beginner: 25, intermediate: 50, advanced: 75 },
      female: { beginner: 15, intermediate: 30, advanced: 45 }
    }
  },
  "Remada Curvada": {
    id: "remada_curvada",
    name: "Remada Curvada",
    muscleGroup: "Costas",
    equipment: "Barra ou Halteres",
    alternatives: ["Remada Baixa (Cabo)", "Remada Máquina Peito Apoiado"],
    execution: {
      setup: "Pés na largura dos ombros. Flexione levemente os joelhos. Incline o tronco à frente (aprox 45-60º) mantendo a coluna neutra.",
      movement: "Puxe a barra em direção ao umbigo, retraindo as escápulas.",
      tips: "Olhe para o chão na diagonal, não para frente (protege a cervical)."
    },
    muscles: {
      primary: "Costas (Espessura)",
      secondary: ["Bíceps", "Lombar (Isometria)"]
    },
    tempo: "2-0-1-0",
    safety: "Se sentir dor na lombar, troque por Remada Máquina ou Apoiada.",
    defaultLoad: {
      male: { beginner: 20, intermediate: 50, advanced: 80 },
      female: { beginner: 10, intermediate: 25, advanced: 40 }
    }
  },
  "Agachamento Livre": {
    id: "agachamento_livre",
    name: "Agachamento Livre",
    muscleGroup: "Pernas",
    equipment: "Hack ou Gaiola de Agachamento",
    alternatives: ["Leg Press 45", "Agachamento Globet"],
    execution: {
      setup: "Barra apoiada no trapézio. Pés largura dos ombros, pontas levemente para fora.",
      movement: "Inicie o movimento quadril para trás e joelhos para fora. Desça até quebrar a paralela (se tiver mobilidade). Suba empurrando o chão.",
      tips: "Mantenha o peito estufado. Respire fundo e trave o abdômen antes de descer (Bracing)."
    },
    muscles: {
      primary: "Quadríceps e Glúteos",
      secondary: ["Posterior", "Core"]
    },
    tempo: "3-0-1-0 (Descida lenta)",
    safety: "Nunca deixe os joelhos entrarem (valgo dinâmico) na subida.",
    defaultLoad: {
      male: { beginner: 20, intermediate: 60, advanced: 100 },
      female: { beginner: 10, intermediate: 30, advanced: 60 }
    }
  },
  "Leg Press 45": {
    id: "leg_press",
    name: "Leg Press 45",
    muscleGroup: "Pernas",
    equipment: "Máquina Leg Press 45º",
    alternatives: ["Agachamento Hack", "Agachamento Búlgaro"],
    execution: {
      setup: "Apoie bem as costas e o quadril no banco. Pés na largura do quadril, no meio da plataforma.",
      movement: "Destrave a máquina. Flexione os joelhos trazendo a plataforma até próximo ao peito (sem tirar o quadril do banco). Empurre.",
      tips: "Não estenda completamente os joelhos no final (não travar a articulação)."
    },
    muscles: {
      primary: "Quadríceps",
      secondary: ["Glúteos"]
    },
    tempo: "2-0-1-0",
    safety: "Segure nas alças laterais para manter o quadril colado no banco.",
    defaultLoad: {
      male: { beginner: 40, intermediate: 120, advanced: 200 },
      female: { beginner: 20, intermediate: 60, advanced: 100 }
    }
  },
  "Desenvolvimento com Halteres": {
    id: "desenvolvimento",
    name: "Desenvolvimento com Halteres",
    muscleGroup: "Ombros",
    equipment: "Banco (90º) e Halteres",
    alternatives: ["Desenvolvimento Máquina", "Desenvolvimento Militar (Barra)"],
    execution: {
      setup: "Sente-se com as costas apoiadas. Halteres na altura das orelhas.",
      movement: "Empurre os halteres para cima até estender os braços. Desça controladamente até a altura das orelhas.",
      tips: "Cotovelos levemente para frente, não totalmente abertos (protege o manguito)."
    },
    muscles: {
      primary: "Deltoide Anterior e Médio",
      secondary: ["Tríceps"]
    },
    tempo: "2-0-1-0",
    safety: "Evite arquear demais as costas.",
    defaultLoad: {
      male: { beginner: 8, intermediate: 18, advanced: 26 },
      female: { beginner: 3, intermediate: 8, advanced: 14 }
    }
  },
  "Elevação Lateral": {
    id: "elevacao_lateral",
    name: "Elevação Lateral",
    muscleGroup: "Ombros",
    equipment: "Halteres",
    alternatives: ["Elevação Lateral Polia", "Máquina de Elevação Lateral"],
    execution: {
      setup: "Pés largura ombros, tronco levemente inclinado a frente.",
      movement: "Eleve os braços lateralmente até a altura dos ombros. Cotovelos levemente flexionados.",
      tips: "Pense em jogar os halteres para longe, não apenas para cima."
    },
    muscles: {
      primary: "Deltoide Médio",
      secondary: []
    },
    tempo: "2-1-1-0",
    safety: "Não use impulso com o corpo.",
    defaultLoad: {
      male: { beginner: 4, intermediate: 10, advanced: 16 },
      female: { beginner: 2, intermediate: 5, advanced: 8 }
    }
  },
  "Tríceps Corda": {
    id: "triceps_corda",
    name: "Tríceps Corda",
    muscleGroup: "Braços",
    equipment: "Polia Alta + Corda",
    alternatives: ["Tríceps Testa", "Tríceps Francês"],
    execution: {
      setup: "Pegue a corda, cotovelos colados ao lado do corpo.",
      movement: "Estenda os cotovelos puxando a corda para baixo e abrindo-a no final do movimento.",
      tips: "Apenas o antebraço se move. O cotovelo fica fixo."
    },
    muscles: {
      primary: "Tríceps Braquial",
      secondary: []
    },
    tempo: "2-0-1-0",
    safety: "",
    defaultLoad: {
      male: { beginner: 10, intermediate: 20, advanced: 35 },
      female: { beginner: 5, intermediate: 15, advanced: 20 }
    }
  },
  "Rosca Direta Barra W": {
    id: "rosca_direta",
    name: "Rosca Direta Barra W",
    muscleGroup: "Braços",
    equipment: "Barra W",
    alternatives: ["Rosca com Halteres", "Rosca Polia"],
    execution: {
      setup: "Pegada na largura dos ombros, palmas para frente (supinada).",
      movement: "Flexione os cotovelos trazendo a barra até o peito.",
      tips: "Não jogue os cotovelos para frente no final."
    },
    muscles: {
      primary: "Bíceps",
      secondary: ["Antebraço"]
    },
    tempo: "2-0-1-0",
    safety: "Evite gangorrar o tronco.",
    defaultLoad: {
      male: { beginner: 10, intermediate: 25, advanced: 40 },
      female: { beginner: 5, intermediate: 10, advanced: 20 }
    }
  },
  "Prancha Abdominal": {
    id: "prancha",
    name: "Prancha Abdominal",
    muscleGroup: "Abdômen",
    equipment: "Colchonete",
    alternatives: ["Abdominal Infra", "Abdominal Máquina"],
    execution: {
      setup: "Apoie antebraços e ponta dos pés no chão. Corpo em linha reta.",
      movement: "Segure a posição contraindo glúteos e abdômen.",
      tips: "Não deixe o quadril cair nem subir demais."
    },
    muscles: {
      primary: "Reto Abdominal (Core)",
      secondary: []
    },
    tempo: "Isometria",
    safety: "Se doer a lombar, pare e corrija a postura.",
    defaultLoad: {
      male: { beginner: 0, intermediate: 0, advanced: 0 },
      female: { beginner: 0, intermediate: 0, advanced: 0 }
    }
  }
};

export const getExerciseDetails = (name: string): ExerciseDefinition | undefined => {
  // Simple exact match first
  if (EXERCISE_DB[name]) return EXERCISE_DB[name];
  
  // Fuzzy match or fallback lookup (simplified for MVP)
  const key = Object.keys(EXERCISE_DB).find(k => name.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(name.toLowerCase()));
  return key ? EXERCISE_DB[key] : undefined;
};