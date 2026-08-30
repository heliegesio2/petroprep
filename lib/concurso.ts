/**
 * Fonte única de dados do concurso para toda a landing page.
 *
 * IMPORTANTE: até 2026-08 a Petrobras NÃO publicou edital para 2027.
 * Os números abaixo são ESTIMATIVAS baseadas em concursos anteriores da
 * Petrobras (Cebraspe 2023/2025) e no concurso Transpetro 2026 (Cesgranrio).
 * Assim que o edital sair, revisar este arquivo — ele é o único lugar que
 * precisa mudar para a landing refletir os dados oficiais.
 *
 * Campos marcados com `oficial: false` devem exibir selo de "estimativa".
 */

export type Escolaridade = "medio" | "tecnico" | "superior";

export interface Cargo {
  slug: string;
  titulo: string;
  escolaridade: Escolaridade;
  area: string;
  /** Faixa salarial inicial de referência, em R$. */
  salario: number;
  requisito: string;
  /** Se true, cai conteúdo específico além do de conhecimentos básicos. */
  temEspecificas: boolean;
}

export interface TopicoProva {
  disciplina: string;
  /** Escolaridades em que a disciplina costuma ser cobrada. */
  escolaridades: Escolaridade[];
  itens: string[];
  /** "basico" = comum a quase todos os cargos; "especifico" = por cargo. */
  natureza: "basico" | "especifico";
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

const KEY_DATE = "2027-05-30T13:00:00-03:00";

export const concurso = {
  nome: "Concurso Petrobras 2027",
  /** Banca historicamente alternada entre Cesgranrio e Cebraspe. */
  bancaProvavel: "Cesgranrio",
  oficial: false,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://petroprep2027.com.br",

  /** Data-alvo do countdown. Ajustar quando o edital definir a data da prova. */
  dataProvaEstimada: KEY_DATE,

  numeros: {
    vagasImediatasEstimadas: 900,
    cadastroReservaEstimado: 6000,
    salarioInicialMaximo: 15034.81,
    oficial: false,
  },

  linksOficiais: [
    { label: "Portal de Concursos da Petrobras", url: "https://petrobras.com.br/quem-somos/concursos" },
    { label: "Fundação Cesgranrio", url: "https://www.cesgranrio.org.br" },
    { label: "Concurso Transpetro 2026 (referência)", url: "https://www.cesgranrio.org.br/concurso/transpetro-2026/" },
  ],
} as const;

export const cargos: Cargo[] = [
  {
    slug: "tec-operacao",
    titulo: "Técnico(a) de Operação Júnior",
    escolaridade: "tecnico",
    area: "Operação",
    salario: 5876.0,
    requisito: "Curso técnico em áreas industriais (Química, Petroquímica, Mecânica, Eletrotécnica ou afins).",
    temEspecificas: true,
  },
  {
    slug: "tec-manutencao",
    titulo: "Técnico(a) de Manutenção Júnior",
    escolaridade: "tecnico",
    area: "Manutenção",
    salario: 5876.0,
    requisito: "Curso técnico em Mecânica, Eletrônica, Eletrotécnica, Instrumentação ou Caldeiraria.",
    temEspecificas: true,
  },
  {
    slug: "tec-administracao",
    titulo: "Técnico(a) de Administração e Controle Júnior",
    escolaridade: "medio",
    area: "Administrativo",
    salario: 5876.0,
    requisito: "Ensino médio completo.",
    temEspecificas: true,
  },
  {
    slug: "eng-petroleo",
    titulo: "Engenheiro(a) de Petróleo Júnior",
    escolaridade: "superior",
    area: "Engenharia",
    salario: 13649.0,
    requisito: "Superior em Engenharia (áreas correlatas) e registro no CREA.",
    temEspecificas: true,
  },
  {
    slug: "eng-equipamentos",
    titulo: "Engenheiro(a) de Equipamentos Júnior",
    escolaridade: "superior",
    area: "Engenharia",
    salario: 13649.0,
    requisito: "Superior em Engenharia (Mecânica, Elétrica, Civil, Química ou afins) e registro no CREA.",
    temEspecificas: true,
  },
  {
    slug: "analista-sistemas",
    titulo: "Analista de Sistemas Júnior",
    escolaridade: "superior",
    area: "Tecnologia",
    salario: 13649.0,
    requisito: "Superior em Computação, Sistemas de Informação, Engenharia de Software ou afins.",
    temEspecificas: true,
  },
  {
    slug: "advogado",
    titulo: "Advogado(a) Júnior",
    escolaridade: "superior",
    area: "Jurídico",
    salario: 13649.0,
    requisito: "Bacharel em Direito e inscrição na OAB. Prova discursiva.",
    temEspecificas: true,
  },
  {
    slug: "profissional-junior-contabilidade",
    titulo: "Profissional Júnior — Ciências Contábeis",
    escolaridade: "superior",
    area: "Administrativo",
    salario: 13649.0,
    requisito: "Superior em Ciências Contábeis e registro no CRC.",
    temEspecificas: true,
  },
];

export const conteudoProgramatico: TopicoProva[] = [
  {
    disciplina: "Língua Portuguesa",
    escolaridades: ["medio", "tecnico", "superior"],
    natureza: "basico",
    itens: [
      "Compreensão e interpretação de textos",
      "Coesão e coerência textual",
      "Ortografia, acentuação e pontuação",
      "Classes de palavras e regência",
      "Concordância verbal e nominal",
      "Semântica e figuras de linguagem",
    ],
  },
  {
    disciplina: "Língua Inglesa",
    escolaridades: ["tecnico", "superior"],
    natureza: "basico",
    itens: [
      "Interpretação de textos técnicos",
      "Vocabulário da indústria de óleo e gás",
      "Tempos verbais e voz passiva",
      "Conectivos e referência textual",
    ],
  },
  {
    disciplina: "Matemática / Raciocínio Lógico",
    escolaridades: ["medio", "tecnico"],
    natureza: "basico",
    itens: [
      "Razão, proporção e porcentagem",
      "Regra de três simples e composta",
      "Funções e equações do 1º e 2º grau",
      "Estatística descritiva básica",
      "Lógica proposicional e sequências",
    ],
  },
  {
    disciplina: "Atualidades e Setor de Energia",
    escolaridades: ["medio", "tecnico", "superior"],
    natureza: "basico",
    itens: [
      "Panorama da indústria de petróleo e gás natural",
      "Transição energética e fontes renováveis",
      "Pré-sal e política de conteúdo local",
      "Governança e compliance na Petrobras",
    ],
  },
  {
    disciplina: "Segurança, Meio Ambiente e Saúde (SMS)",
    escolaridades: ["tecnico", "superior"],
    natureza: "especifico",
    itens: [
      "Normas Regulamentadoras (NR-10, NR-13, NR-33, NR-35)",
      "Análise preliminar de risco e permissão de trabalho",
      "Resposta a emergências e combate a incêndio",
      "Gestão ambiental e licenciamento",
    ],
  },
  {
    disciplina: "Conhecimentos Específicos por Cargo",
    escolaridades: ["medio", "tecnico", "superior"],
    natureza: "especifico",
    itens: [
      "Operação: termodinâmica, operações unitárias, processos de refino",
      "Manutenção: mecânica, elétrica, instrumentação e ensaios",
      "Engenharia: disciplina específica do cargo + regulação ANP",
      "TI: engenharia de software, dados, redes e segurança",
      "Administrativo: administração pública, contabilidade e licitações (Lei 14.133)",
    ],
  },
];

export const faq: FaqItem[] = [
  {
    pergunta: "Já saiu o edital do concurso Petrobras 2027?",
    resposta:
      "Ainda não. Até agora a Petrobras não publicou edital para 2027 — o concurso técnico de 2023/2025 tem validade até junho de 2027. Nesta plataforma os números são estimativas com base em concursos anteriores e no concurso Transpetro 2026; assim que o edital oficial for publicado, atualizamos tudo e avisamos quem está na lista.",
  },
  {
    pergunta: "Qual banca vai organizar a prova?",
    resposta:
      "A Petrobras costuma alternar entre Cesgranrio e Cebraspe. O concurso Transpetro 2026 é da Cesgranrio, então nossos simulados seguem o estilo Cesgranrio: questões objetivas de múltipla escolha, muita interpretação e pegadinhas de literalidade.",
  },
  {
    pergunta: "Os simulados são no estilo da prova real?",
    resposta:
      "Sim. As questões seguem o formato da banca provável, com distribuição por disciplina parecida com a dos últimos editais e correção comentada.",
  },
  {
    pergunta: "Preciso pagar para entrar na lista?",
    resposta:
      "Não. A lista de espera é gratuita. Você recebe o material de estudo inicial, o resumo do edital quando sair e acesso antecipado aos simulados.",
  },
  {
    pergunta: "Esta plataforma é oficial da Petrobras?",
    resposta:
      "Não. A PetroPrep é uma iniciativa independente de preparação para concursos e não tem vínculo com a Petrobras, a Transpetro ou a Cesgranrio. As inscrições do concurso são feitas apenas nos canais oficiais.",
  },
];

/** Utilitário para exibir R$ de forma consistente. */
export function formatBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export const escolaridadeLabel: Record<Escolaridade, string> = {
  medio: "Ensino Médio",
  tecnico: "Nível Técnico",
  superior: "Nível Superior",
};
