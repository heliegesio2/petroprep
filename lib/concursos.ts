/**
 * Fonte única de dados da plataforma - vários concursos.
 *
 * IMPORTANTE: os números vêm de um panorama de imprensa (ago/2026) e de concursos
 * anteriores. São ESTIMATIVAS / referência - confira sempre a fonte oficial antes
 * de se inscrever. Só a Transpetro tem dados profundos (cargos, vagas, cotas,
 * conteúdo); os demais são cards de resumo até o dono priorizar cada um.
 *
 * Ao sair um edital oficial, ajustar o objeto do concurso aqui - é o único lugar.
 */

export type Escolaridade = "medio" | "tecnico" | "superior";

export const escolaridadeLabel: Record<Escolaridade, string> = {
  medio: "Ensino Médio",
  tecnico: "Nível Técnico",
  superior: "Nível Superior",
};

export interface Cargo {
  slug: string;
  titulo: string;
  escolaridade: Escolaridade;
  area: string;
  /** Faixa salarial inicial de referência, em R$. */
  salario: number;
  requisito: string;
}

export interface Vaga {
  cargoSlug: string;
  uf: string;
  unidade: string;
  /** Vagas de nomeação imediata (ampla + reservas, que são subconjunto). */
  imediatas: number;
}

export interface TopicoProva {
  disciplina: string;
  escolaridades: Escolaridade[];
  itens: string[];
  natureza: "basico" | "especifico";
}

export type GrupoReservaId = "negros" | "pcd" | "indigena" | "lgbtqia";

export interface GrupoReserva {
  id: GrupoReservaId;
  label: string;
  /** % das vagas do cargo reservado ao grupo. 0 = sem reserva prevista. */
  percentual: number;
  minVagasCargo: number;
  arredonda: "cima" | "matematico";
  /** true = cota prevista em lei federal para este tipo de concurso. */
  federal: boolean;
  nota: string;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export type ConcursoStatus = "inscricoes_abertas" | "previsto";

export interface Concurso {
  slug: string;
  nome: string;
  tituloCompleto: string;
  orgao: string;
  banca?: string;
  /** true só para o concurso em destaque (1º slide do carrossel). */
  destaque: boolean;
  status: ConcursoStatus;
  vagasTotais?: number;
  /** Piso da faixa salarial, quando o concurso divulga um intervalo. */
  salarioDe?: number;
  salarioAte?: number;
  /** ISO. Fim das inscrições. */
  inscricoesAte?: string;
  /** ISO. Data da prova - usada no countdown e na ordenação. */
  dataProva?: string;
  /** Usado pelo filtro (só relevante onde há dados profundos). */
  escolaridades: Escolaridade[];
  /** Frase de escolaridade exibida no banner (aceita "Fundamental" etc.). */
  escolaridadeTexto: string;
  resumo: string;
  linkOficial?: string;
  /** Dados profundos - presentes só onde já foram preenchidos. */
  cargos?: Cargo[];
  vagas?: Vaga[];
  conteudo?: TopicoProva[];
  gruposReserva?: GrupoReserva[];
}

// ---------------------------------------------------------------------------
// Rótulos e utilitários compartilhados
// ---------------------------------------------------------------------------

export const ufLabel: Record<string, string> = {
  RJ: "Rio de Janeiro",
  SP: "São Paulo",
  BA: "Bahia",
  PE: "Pernambuco",
  RN: "Rio Grande do Norte",
  PR: "Paraná",
  ES: "Espírito Santo",
  AM: "Amazonas",
};

export function formatBRL(valor: number, semCentavos = true): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: semCentavos ? 0 : 2,
    maximumFractionDigits: semCentavos ? 0 : 2,
  });
}

export function formatData(iso: string): string {
  // Interpreta "YYYY-MM-DD" como data local (evita o -1 dia por fuso e o
  // consequente mismatch de hidratação servidor/cliente).
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export const statusLabel: Record<ConcursoStatus, string> = {
  inscricoes_abertas: "Inscrições abertas",
  previsto: "Previsto (sem edital)",
};

// ---------------------------------------------------------------------------
// Reserva de vagas (cotas) - regras federais
// ---------------------------------------------------------------------------

export const gruposReservaPadrao: GrupoReserva[] = [
  {
    id: "negros",
    label: "Pessoa preta ou parda",
    percentual: 0.2,
    minVagasCargo: 3,
    arredonda: "matematico",
    federal: true,
    nota: "Lei 12.990/2014: 20% das vagas quando o cargo oferece 3 ou mais. Exige autodeclaração e, em geral, procedimento de heteroidentificação.",
  },
  {
    id: "pcd",
    label: "Pessoa com deficiência (PcD)",
    percentual: 0.05,
    minVagasCargo: 5,
    arredonda: "cima",
    federal: true,
    nota: "Decreto 9.508/2018: no mínimo 5% das vagas, com laudo médico e avaliação por equipe multiprofissional.",
  },
  {
    id: "indigena",
    label: "Pessoa indígena",
    percentual: 0,
    minVagasCargo: 0,
    arredonda: "cima",
    federal: false,
    nota: "Não há cota federal para indígenas em concursos da Petrobras/Transpetro. Você concorre na ampla concorrência. Alguns editais criam reserva própria - confirmamos quando o edital sair.",
  },
  {
    id: "lgbtqia",
    label: "Pessoa LGBTQIA+",
    percentual: 0,
    minVagasCargo: 0,
    arredonda: "cima",
    federal: false,
    nota: "Concursos federais não reservam vagas por orientação sexual ou identidade de gênero. Você concorre na ampla concorrência. Alguns concursos estaduais e municipais reservam vagas para pessoas trans.",
  },
];

function arredondaReserva(qtd: number, modo: "cima" | "matematico"): number {
  return modo === "cima" ? Math.ceil(qtd) : Math.round(qtd);
}

/** Vagas reservadas a um grupo, para um cargo com `imediatas` vagas. */
export function vagasReservadas(imediatas: number, grupo: GrupoReserva): number {
  if (grupo.percentual <= 0 || imediatas < grupo.minVagasCargo) return 0;
  const bruto = arredondaReserva(imediatas * grupo.percentual, grupo.arredonda);
  const teto = Math.floor(imediatas * 0.2); // teto de 20% (art. 37, VIII, CF)
  return Math.max(0, Math.min(bruto, teto || bruto));
}

// ---------------------------------------------------------------------------
// Dados profundos - Transpetro 2026 (banca Cesgranrio)
// ---------------------------------------------------------------------------

const cargosTranspetro: Cargo[] = [
  {
    slug: "tec-operacao",
    titulo: "Técnico(a) de Operação Júnior",
    escolaridade: "tecnico",
    area: "Operação",
    salario: 5876,
    requisito:
      "Curso técnico em áreas industriais (Química, Petroquímica, Mecânica, Eletrotécnica ou afins).",
  },
  {
    slug: "tec-manutencao",
    titulo: "Técnico(a) de Manutenção Júnior",
    escolaridade: "tecnico",
    area: "Manutenção",
    salario: 5876,
    requisito:
      "Curso técnico em Mecânica, Eletrônica, Eletrotécnica, Instrumentação ou Caldeiraria.",
  },
  {
    slug: "tec-administracao",
    titulo: "Técnico(a) de Administração e Controle Júnior",
    escolaridade: "medio",
    area: "Administrativo",
    salario: 5876,
    requisito: "Ensino médio completo.",
  },
  {
    slug: "eng-equipamentos",
    titulo: "Engenheiro(a) de Equipamentos Júnior",
    escolaridade: "superior",
    area: "Engenharia",
    salario: 13649,
    requisito:
      "Superior em Engenharia (Mecânica, Elétrica, Civil, Química ou afins) e registro no CREA.",
  },
  {
    slug: "eng-dutos",
    titulo: "Engenheiro(a) Júnior - Dutos/Transporte",
    escolaridade: "superior",
    area: "Engenharia",
    salario: 13649,
    requisito: "Superior em Engenharia e registro no CREA.",
  },
  {
    slug: "analista-sistemas",
    titulo: "Analista de Sistemas Júnior",
    escolaridade: "superior",
    area: "Tecnologia",
    salario: 13649,
    requisito:
      "Superior em Computação, Sistemas de Informação, Engenharia de Software ou afins.",
  },
  {
    slug: "advogado",
    titulo: "Advogado(a) Júnior",
    escolaridade: "superior",
    area: "Jurídico",
    salario: 13649,
    requisito: "Bacharel em Direito e inscrição na OAB. Prova discursiva.",
  },
  {
    slug: "profissional-contabilidade",
    titulo: "Profissional Júnior - Ciências Contábeis",
    escolaridade: "superior",
    area: "Administrativo",
    salario: 13649,
    requisito: "Superior em Ciências Contábeis e registro no CRC.",
  },
];

const vagasTranspetro: Vaga[] = [
  { cargoSlug: "tec-operacao", uf: "RJ", unidade: "Terminal do Rio de Janeiro", imediatas: 80 },
  { cargoSlug: "tec-operacao", uf: "BA", unidade: "Terminal de São Francisco do Conde", imediatas: 70 },
  { cargoSlug: "tec-operacao", uf: "PE", unidade: "Terminal de Suape", imediatas: 50 },
  { cargoSlug: "tec-operacao", uf: "SP", unidade: "Terminal de São Sebastião", imediatas: 40 },
  { cargoSlug: "tec-operacao", uf: "PR", unidade: "Terminal de Paranaguá", imediatas: 30 },
  { cargoSlug: "tec-operacao", uf: "RN", unidade: "Terminal de Guamaré", imediatas: 30 },

  { cargoSlug: "tec-manutencao", uf: "RJ", unidade: "Terminal do Rio de Janeiro", imediatas: 70 },
  { cargoSlug: "tec-manutencao", uf: "BA", unidade: "Terminal de São Francisco do Conde", imediatas: 60 },
  { cargoSlug: "tec-manutencao", uf: "SP", unidade: "Terminal de Cubatão", imediatas: 40 },
  { cargoSlug: "tec-manutencao", uf: "PE", unidade: "Terminal de Suape", imediatas: 40 },
  { cargoSlug: "tec-manutencao", uf: "AM", unidade: "Terminal de Manaus", imediatas: 30 },

  { cargoSlug: "tec-administracao", uf: "RJ", unidade: "Sede, Rio de Janeiro", imediatas: 50 },
  { cargoSlug: "tec-administracao", uf: "BA", unidade: "Salvador", imediatas: 25 },
  { cargoSlug: "tec-administracao", uf: "SP", unidade: "São Paulo", imediatas: 25 },
  { cargoSlug: "tec-administracao", uf: "RN", unidade: "Natal", imediatas: 20 },

  { cargoSlug: "eng-equipamentos", uf: "RJ", unidade: "Sede, Rio de Janeiro", imediatas: 45 },
  { cargoSlug: "eng-equipamentos", uf: "BA", unidade: "Salvador", imediatas: 20 },
  { cargoSlug: "eng-equipamentos", uf: "SP", unidade: "São Paulo", imediatas: 15 },

  { cargoSlug: "eng-dutos", uf: "RJ", unidade: "Sede, Rio de Janeiro", imediatas: 40 },
  { cargoSlug: "eng-dutos", uf: "ES", unidade: "Vitória", imediatas: 15 },

  { cargoSlug: "analista-sistemas", uf: "RJ", unidade: "Sede / TIC, Rio de Janeiro", imediatas: 45 },
  { cargoSlug: "analista-sistemas", uf: "SP", unidade: "São Paulo", imediatas: 15 },

  { cargoSlug: "advogado", uf: "RJ", unidade: "Jurídico, Rio de Janeiro", imediatas: 12 },
  { cargoSlug: "advogado", uf: "BA", unidade: "Salvador", imediatas: 3 },

  { cargoSlug: "profissional-contabilidade", uf: "RJ", unidade: "Sede, Rio de Janeiro", imediatas: 25 },
  { cargoSlug: "profissional-contabilidade", uf: "BA", unidade: "Salvador", imediatas: 10 },
];

const conteudoTranspetro: TopicoProva[] = [
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
      "Logística e transporte dutoviário e marítimo",
      "Transição energética e biocombustíveis",
      "Governança e compliance no Sistema Petrobras",
    ],
  },
  {
    disciplina: "Segurança, Meio Ambiente e Saúde (SMS)",
    escolaridades: ["tecnico", "superior"],
    natureza: "especifico",
    itens: [
      "Normas Regulamentadoras (NR-10, NR-13, NR-20, NR-33, NR-35)",
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
      "Operação: transferência e estocagem, bombas, medição e automação",
      "Manutenção: mecânica, elétrica, instrumentação e ensaios",
      "Engenharia: disciplina do cargo + integridade de dutos e regulação ANP",
      "TI: engenharia de software, dados, redes e segurança",
      "Administrativo: administração pública, contabilidade e licitações (Lei 14.133)",
    ],
  },
];

// ---------------------------------------------------------------------------
// Catálogo de concursos
// ---------------------------------------------------------------------------

const listaBruta: Concurso[] = [
  {
    slug: "transpetro-2026",
    nome: "Transpetro",
    tituloCompleto: "Concurso Transpetro 2026",
    orgao: "Petrobras Transporte S.A. (Transpetro)",
    banca: "Cesgranrio",
    destaque: true,
    status: "inscricoes_abertas",
    vagasTotais: 4171,
    salarioAte: 15034.81,
    inscricoesAte: "2026-09-14",
    dataProva: "2026-11-29",
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio, técnico e superior (conforme o cargo)",
    resumo:
      "Quadros Terra e Mar. Vagas em terminais e dutos pelo país, com prova no estilo Cesgranrio.",
    linkOficial: "https://www.cesgranrio.org.br/concurso/transpetro-2026/",
    cargos: cargosTranspetro,
    vagas: vagasTranspetro,
    conteudo: conteudoTranspetro,
    gruposReserva: gruposReservaPadrao,
  },
  {
    slug: "ses-to-2026",
    nome: "SES TO",
    tituloCompleto: "Secretaria de Saúde do Tocantins 2026",
    orgao: "Governo do Tocantins",
    destaque: false,
    status: "inscricoes_abertas",
    vagasTotais: 5124,
    salarioDe: 1735,
    salarioAte: 17727.63,
    inscricoesAte: "2026-09-10",
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio/técnico (ex.: técnico de enfermagem) e superior (médico, enfermeiro, fisioterapeuta)",
    resumo:
      "Maior concurso de saúde aberto no momento: milhares de vagas para todos os níveis em unidades de saúde do estado.",
  },
  {
    slug: "pc-ba-2026",
    nome: "PC BA",
    tituloCompleto: "Polícia Civil da Bahia 2026",
    orgao: "Polícia Civil do Estado da Bahia",
    destaque: false,
    status: "inscricoes_abertas",
    vagasTotais: 750,
    salarioDe: 6433.06,
    salarioAte: 16495.67,
    inscricoesAte: "2026-09-08",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Delegado, Escrivão e Investigador)",
    resumo:
      "Carreiras policiais com etapas de aptidão física e psicológica. Salário de Delegado no topo.",
  },
  {
    slug: "pc-ma-2026",
    nome: "PC MA",
    tituloCompleto: "Polícia Civil do Maranhão 2026",
    orgao: "Polícia Civil do Estado do Maranhão",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 6514.3,
    salarioAte: 22820.23,
    inscricoesAte: "2026-08-24",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Delegado, Oficial e Investigador)",
    resumo:
      "Cargos de Delegado, Oficial de Polícia e Investigador, com remuneração de Delegado acima de R$ 22 mil.",
  },
  {
    slug: "pc-pr-2026",
    nome: "PC PR",
    tituloCompleto: "Polícia Civil do Paraná 2026",
    orgao: "Polícia Civil do Estado do Paraná",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 9007.67,
    salarioAte: 26876.48,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Delegado, Agente e Papiloscopista)",
    resumo:
      "Uma das carreiras policiais mais bem pagas em disputa: Delegado do PR passa de R$ 26 mil iniciais.",
  },
  {
    slug: "tce-sp-2026",
    nome: "TCE SP",
    tituloCompleto: "Tribunal de Contas do Estado de São Paulo 2026",
    orgao: "Tribunal de Contas do Estado de São Paulo",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 20940.2,
    inscricoesAte: "2026-09-17",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor / Agente da Fiscalização)",
    resumo:
      "Controle externo em São Paulo, com salário inicial acima de R$ 20 mil e prova de alto nível.",
  },
  {
    slug: "tj-pr-2026",
    nome: "TJ PR",
    tituloCompleto: "Tribunal de Justiça do Paraná 2026",
    orgao: "Tribunal de Justiça do Estado do Paraná",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 23264.47,
    inscricoesAte: "2026-09-14",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (ex.: Contador)",
    resumo:
      "Carreiras de nível superior no Judiciário paranaense, entre os maiores salários iniciais dos concursos abertos.",
  },
  {
    slug: "mp-sp-2026",
    nome: "MP SP",
    tituloCompleto: "Ministério Público de São Paulo 2026",
    orgao: "Ministério Público do Estado de São Paulo",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 9114.75,
    salarioAte: 12494.68,
    inscricoesAte: "2026-09-15",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Analista de Promotoria)",
    resumo:
      "Analista de Promotoria de Justiça, com atuação de apoio técnico às promotorias do estado.",
  },
  {
    slug: "iss-manaus-2026",
    nome: "ISS Manaus",
    tituloCompleto: "ISS Manaus 2026: Auditor Fiscal",
    orgao: "Prefeitura de Manaus / SEMEF",
    destaque: false,
    status: "inscricoes_abertas",
    vagasTotais: 20,
    salarioAte: 27270.61,
    inscricoesAte: "2026-08-27",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Fiscal de Tributos Municipais)",
    resumo:
      "Poucas vagas, salário no topo da lista. Prova de alto nível em Direito Tributário e Contabilidade.",
  },
  {
    slug: "bombeiros-rr-2026",
    nome: "CBM RR",
    tituloCompleto: "Corpo de Bombeiros Militar de Roraima 2026",
    orgao: "Corpo de Bombeiros Militar do Estado de Roraima",
    destaque: false,
    status: "inscricoes_abertas",
    vagasTotais: 300,
    salarioAte: 13817.22,
    inscricoesAte: "2026-08-24",
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (Soldado) e superior (Oficial)",
    resumo:
      "Ingresso na carreira militar de bombeiro, com vagas de praça e de oficial e etapas de aptidão física.",
  },
  {
    slug: "prefeitura-santos-2026",
    nome: "Pref. Santos",
    tituloCompleto: "Prefeitura de Santos 2026",
    orgao: "Prefeitura Municipal de Santos (SP)",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 13263.43,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Fundamental, médio e superior (vários cargos)",
    resumo:
      "Concurso municipal amplo, com cargos administrativos, técnicos e de nível superior na Baixada Santista.",
  },
  {
    slug: "receita-federal-2026",
    nome: "Receita Federal",
    tituloCompleto: "Concurso Receita Federal 2026 (previsto)",
    orgao: "Ministério da Fazenda / Receita Federal do Brasil",
    destaque: false,
    status: "previsto",
    vagasTotais: 146,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor-Fiscal e Analista-Tributário)",
    resumo:
      "Um dos concursos federais mais aguardados. Edital ainda não publicado.",
  },
  {
    slug: "tcu-2026",
    nome: "TCU",
    tituloCompleto: "Concurso TCU 2026 (previsto)",
    orgao: "Tribunal de Contas da União",
    destaque: false,
    status: "previsto",
    vagasTotais: 100,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Federal de Controle Externo)",
    resumo:
      "Controle externo federal, com remuneração inicial acima de R$ 20 mil. Previsto para 2026.",
  },
  {
    slug: "pm-sp-2026",
    nome: "PM SP",
    tituloCompleto: "Polícia Militar de São Paulo 2026 (previsto)",
    orgao: "Polícia Militar do Estado de São Paulo",
    destaque: false,
    status: "previsto",
    vagasTotais: 2000,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (Soldado) e superior (Oficial)",
    resumo:
      "Soldado PM 2ª Classe. Um dos maiores concursos de segurança previstos para o ano.",
  },
  {
    slug: "sefaz-ba-2026",
    nome: "Sefaz BA",
    tituloCompleto: "Secretaria da Fazenda da Bahia 2026 (previsto)",
    orgao: "Secretaria da Fazenda do Estado da Bahia",
    destaque: false,
    status: "previsto",
    vagasTotais: 200,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Fiscal e Agente de Tributos)",
    resumo:
      "Carreira fiscal estadual. Edital previsto para 2026.",
  },

  // ---- Demais concursos com inscrições abertas (panorama ago/2026) ----
  {
    slug: "sesau-al-2026",
    nome: "Sesau AL",
    tituloCompleto: "Secretaria de Saúde de Alagoas 2026",
    orgao: "Governo de Alagoas / Sesau",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 2050.55,
    salarioAte: 5757.15,
    inscricoesAte: "2026-08-26",
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio/técnico (assistente) e superior (especialista)",
    resumo: "Milhares de vagas para a rede estadual de saúde de Alagoas.",
  },
  {
    slug: "prefeitura-cristalina-2026",
    nome: "Pref. Cristalina",
    tituloCompleto: "Prefeitura de Cristalina (GO) 2026",
    orgao: "Prefeitura Municipal de Cristalina (GO)",
    destaque: false,
    status: "inscricoes_abertas",
    vagasTotais: 307,
    salarioAte: 5165.78,
    inscricoesAte: "2026-09-10",
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Fundamental, médio e superior (vários cargos)",
    resumo: "Concurso municipal amplo no interior de Goiás.",
  },
  {
    slug: "pc-al-2026",
    nome: "PC AL",
    tituloCompleto: "Polícia Civil de Alagoas 2026",
    orgao: "Polícia Civil do Estado de Alagoas",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 5318.63,
    inscricoesAte: "2026-09-11",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Agente e Escrivão)",
    resumo: "Carreiras policiais de nível superior, com etapas de aptidão física.",
  },
  {
    slug: "tce-ma-2026",
    nome: "TCE MA",
    tituloCompleto: "Tribunal de Contas do Estado do Maranhão 2026",
    orgao: "Tribunal de Contas do Estado do Maranhão",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 11061.72,
    escolaridades: ["medio"],
    escolaridadeTexto: "Médio (Técnico de Controle Externo)",
    resumo: "Controle externo no Maranhão, com cargo técnico de nível médio bem remunerado.",
  },
  {
    slug: "tcdf-2026",
    nome: "TCDF",
    tituloCompleto: "Tribunal de Contas do Distrito Federal 2026",
    orgao: "Tribunal de Contas do Distrito Federal",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 14990.41,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Analista de Administração Pública)",
    resumo: "Controle externo no DF, com salário inicial próximo de R$ 15 mil.",
  },
  {
    slug: "iss-taubate-2026",
    nome: "ISS Taubaté",
    tituloCompleto: "ISS Taubaté 2026: Auditor Fiscal",
    orgao: "Prefeitura de Taubaté (SP)",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 10653.91,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Fiscal Tributário)",
    resumo: "Fiscalização tributária municipal no interior paulista.",
  },
  {
    slug: "iss-caruaru-2026",
    nome: "ISS Caruaru",
    tituloCompleto: "ISS Caruaru 2026: Auditor / Analista Fiscal",
    orgao: "Prefeitura de Caruaru (PE)",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 6000,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor e Analista Fiscal)",
    resumo: "Carreira fiscal municipal no agreste pernambucano.",
  },
  {
    slug: "pericia-ma-2026",
    nome: "Perícia MA",
    tituloCompleto: "Perícia Oficial do Maranhão 2026",
    orgao: "Instituto de Perícia Oficial do Estado do Maranhão",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 14675.58,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Perito Oficial e áreas técnicas)",
    resumo: "Perícia criminal e médico-legal, com exigência de formação específica.",
  },
  {
    slug: "policia-penal-ma-2026",
    nome: "Pol. Penal MA",
    tituloCompleto: "Polícia Penal do Maranhão 2026",
    orgao: "Secretaria de Administração Penitenciária do Maranhão",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 3521.43,
    salarioAte: 8638.77,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Inspetor e Especialista Penal)",
    resumo: "Carreira penal estadual, com prova objetiva e etapas de aptidão.",
  },
  {
    slug: "pmbm-ba-saude-2026",
    nome: "PM/CBM BA (Saúde)",
    tituloCompleto: "PM e Bombeiros da Bahia 2026: Saúde",
    orgao: "Polícia Militar e Corpo de Bombeiros Militar da Bahia",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 9973.34,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (áreas de saúde - oficiais)",
    resumo: "Vagas para profissionais de saúde nas corporações militares baianas.",
  },
  {
    slug: "abgf-2026",
    nome: "ABGF",
    tituloCompleto: "Agência Brasileira Gestora de Fundos 2026",
    orgao: "ABGF - Agência Brasileira Gestora de Fundos Garantidores e Garantias",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 15200,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Analista)",
    resumo: "Estatal federal ligada a fundos garantidores, com salário competitivo.",
  },
  {
    slug: "agepar-2026",
    nome: "AGEPAR",
    tituloCompleto: "Agência Reguladora do Paraná 2026",
    orgao: "AGEPAR - Agência Reguladora de Serviços Públicos Delegados do Paraná",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 10334.74,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Especialista em Regulação e áreas administrativas)",
    resumo: "Agência reguladora estadual (saneamento, energia, transporte).",
  },
  {
    slug: "sape-sc-2026",
    nome: "SAP SC",
    tituloCompleto: "Administração Prisional de Santa Catarina 2026",
    orgao: "Secretaria de Estado da Administração Prisional e Socioeducativa de SC",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 11521.24,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (carreiras técnicas e de gestão)",
    resumo: "Cargos administrativos e técnicos no sistema prisional catarinense.",
  },
  {
    slug: "unificado-pi-2026",
    nome: "Unificado PI",
    tituloCompleto: "Concurso Público Unificado do Piauí 2026",
    orgao: "Governo do Estado do Piauí",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 13536.01,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (vários órgãos estaduais)",
    resumo: "Seleção unificada para diversos órgãos do estado do Piauí.",
  },
  {
    slug: "faetec-rj-2026",
    nome: "Faetec RJ",
    tituloCompleto: "Faetec RJ 2026: Professores temporários",
    orgao: "Fundação de Apoio à Escola Técnica do Rio de Janeiro",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 2003.32,
    salarioAte: 4066.64,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (docência - contratos temporários)",
    resumo: "Processo seletivo para professores da rede técnica estadual do RJ.",
  },
  {
    slug: "ufrrj-2026",
    nome: "UFRRJ",
    tituloCompleto: "Universidade Federal Rural do Rio de Janeiro 2026",
    orgao: "UFRRJ",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 6407.39,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio e superior (técnico-administrativos em educação)",
    resumo: "Vagas de técnico-administrativo na universidade federal fluminense.",
  },
  {
    slug: "ufpe-2026",
    nome: "UFPE",
    tituloCompleto: "Universidade Federal de Pernambuco 2026",
    orgao: "UFPE",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 5215.39,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio e superior (técnico-administrativos em educação)",
    resumo: "Cargos técnico-administrativos na maior universidade federal do Nordeste.",
  },
  {
    slug: "ifpi-2026",
    nome: "IFPI",
    tituloCompleto: "Instituto Federal do Piauí 2026",
    orgao: "IFPI",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 6400,
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio, técnico e superior (docentes e técnicos)",
    resumo: "Vagas para docentes e técnico-administrativos no Instituto Federal do Piauí.",
  },
  {
    slug: "guarda-vida-saquarema-2026",
    nome: "Guarda-Vida Saquarema",
    tituloCompleto: "Guarda-Vidas de Saquarema (RJ) 2026",
    orgao: "Prefeitura de Saquarema (RJ)",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 1690.05,
    escolaridades: ["medio"],
    escolaridadeTexto: "Médio (com teste de aptidão aquática)",
    resumo: "Contratação de guarda-vidas para a orla do município fluminense.",
  },
  {
    slug: "seplag-mg-2026",
    nome: "Seplag MG",
    tituloCompleto: "Seplag Minas Gerais 2026",
    orgao: "Secretaria de Planejamento e Gestão de Minas Gerais",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 5226.6,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio ou superior - conferir o cargo no edital",
    resumo: "Cargos de gestão e apoio administrativo no governo mineiro.",
  },
  {
    slug: "docas-pa-2026",
    nome: "Docas PA",
    tituloCompleto: "Companhia Docas do Pará 2026",
    orgao: "CDP - Companhia Docas do Pará",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 6985.76,
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio (guarda portuário), técnico e superior (analista)",
    resumo: "Vagas na administração dos portos do estado do Pará.",
  },
  {
    slug: "saude-rj-iaserj-2026",
    nome: "Iaserj RJ",
    tituloCompleto: "Saúde RJ / Iaserj 2026",
    orgao: "Instituto de Assistência dos Servidores do Estado do RJ",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 7100,
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio, técnico e superior (área da saúde)",
    resumo: "Profissionais de saúde para a rede assistencial dos servidores fluminenses.",
  },
  {
    slug: "cidennf-rj-2026",
    nome: "Cidennf RJ",
    tituloCompleto: "Consórcio do Noroeste Fluminense (Cidennf) 2026",
    orgao: "Cidennf - Consórcio Intermunicipal de Desenvolvimento do Noroeste Fluminense",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 2194,
    salarioAte: 5637,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio e superior (saúde e administração)",
    resumo: "Consórcio intermunicipal de saúde no noroeste do Rio de Janeiro.",
  },
  {
    slug: "cra-rj-2026",
    nome: "CRA RJ",
    tituloCompleto: "Conselho Regional de Administração do RJ 2026",
    orgao: "CRA-RJ",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 2437,
    salarioAte: 6369,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio e superior (agente fiscal e analista)",
    resumo: "Conselho profissional de administração, com cargos de fiscalização.",
  },
  {
    slug: "demhab-poa-2026",
    nome: "DEMHAB POA",
    tituloCompleto: "DEMHAB Porto Alegre 2026",
    orgao: "Departamento Municipal de Habitação de Porto Alegre",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 11822.92,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (assistente adm.) e superior (arquiteto, engenheiro, economista)",
    resumo: "Órgão municipal de habitação da capital gaúcha.",
  },
  {
    slug: "hob-mg-2026",
    nome: "HOB MG",
    tituloCompleto: "Hospital Odilon Behrens (Belo Horizonte) 2026",
    orgao: "HOB - Hospital Municipal Odilon Behrens",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 2003,
    salarioAte: 7397.55,
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio/técnico e superior (área hospitalar)",
    resumo: "Hospital público de referência em Belo Horizonte.",
  },
  {
    slug: "procon-al-2026",
    nome: "Procon AL",
    tituloCompleto: "Procon Alagoas 2026",
    orgao: "Procon do Estado de Alagoas",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 5501.43,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (fiscal) e superior (analista)",
    resumo: "Órgão estadual de defesa do consumidor.",
  },
  {
    slug: "caer-rr-2026",
    nome: "CAER RR",
    tituloCompleto: "Companhia de Águas e Esgotos de Roraima 2026",
    orgao: "CAER - Companhia de Águas e Esgotos de Roraima",
    destaque: false,
    status: "inscricoes_abertas",
    salarioDe: 3036,
    salarioAte: 4554,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio e superior (operação e áreas técnicas)",
    resumo: "Estatal de saneamento do estado de Roraima.",
  },
  {
    slug: "cremers-2026",
    nome: "CREMERS",
    tituloCompleto: "Conselho Regional de Medicina do RS 2026",
    orgao: "CREMERS",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 18847.08,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (agente fiscal) e superior (médico fiscal)",
    resumo: "Conselho profissional de medicina, com carreira de fiscalização bem paga.",
  },
  {
    slug: "creci-sp-2026",
    nome: "CRECI SP",
    tituloCompleto: "Conselho Regional de Corretores de Imóveis de SP 2026",
    orgao: "CRECI-SP",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 9940,
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio/técnico e superior",
    resumo: "Conselho profissional dos corretores de imóveis paulistas.",
  },
  {
    slug: "emater-mg-2026",
    nome: "Emater MG",
    tituloCompleto: "Emater Minas Gerais 2026",
    orgao: "Emater-MG - Empresa de Assistência Técnica e Extensão Rural",
    destaque: false,
    status: "inscricoes_abertas",
    salarioAte: 7321.75,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio e superior (extensão rural e áreas técnicas)",
    resumo: "Assistência técnica e extensão rural em Minas Gerais.",
  },

  // ---- Demais concursos previstos (sem edital) ----
  {
    slug: "cgu-2026",
    nome: "CGU",
    tituloCompleto: "Concurso CGU 2026 (previsto)",
    orgao: "Controladoria-Geral da União",
    destaque: false,
    status: "previsto",
    vagasTotais: 60,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Federal de Finanças e Controle)",
    resumo: "Órgão central de controle interno do Executivo federal. Edital previsto.",
  },
  {
    slug: "camara-deputados-2026",
    nome: "Câmara dos Deputados",
    tituloCompleto: "Concurso Câmara dos Deputados 2026 (previsto)",
    orgao: "Câmara dos Deputados",
    destaque: false,
    status: "previsto",
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Analista Legislativo)",
    resumo: "Carreira legislativa federal, entre as mais bem pagas. Edital previsto.",
  },
  {
    slug: "pmdf-2026",
    nome: "PMDF",
    tituloCompleto: "Polícia Militar do Distrito Federal 2026 (previsto)",
    orgao: "Polícia Militar do Distrito Federal",
    destaque: false,
    status: "previsto",
    vagasTotais: 2000,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (Soldado) e superior (Oficial)",
    resumo: "Um dos maiores concursos de segurança previstos para o DF.",
  },
  {
    slug: "pm-pe-2026",
    nome: "PM PE",
    tituloCompleto: "Polícia Militar de Pernambuco 2026 (previsto)",
    orgao: "Polícia Militar de Pernambuco",
    destaque: false,
    status: "previsto",
    vagasTotais: 1320,
    escolaridades: ["medio", "superior"],
    escolaridadeTexto: "Médio (Soldado) e superior (Oficial)",
    resumo: "Reforço do efetivo da PM pernambucana. Edital previsto para 2026.",
  },
  {
    slug: "sefaz-df-2026",
    nome: "Sefaz DF",
    tituloCompleto: "Secretaria de Fazenda do DF 2026 (previsto)",
    orgao: "Secretaria de Economia do Distrito Federal",
    destaque: false,
    status: "previsto",
    vagasTotais: 115,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Fiscal e Analista)",
    resumo: "Carreira fiscal do Distrito Federal. Edital previsto.",
  },
  {
    slug: "sefaz-to-2026",
    nome: "Sefaz TO",
    tituloCompleto: "Secretaria de Fazenda do Tocantins 2026 (previsto)",
    orgao: "Secretaria da Fazenda do Estado do Tocantins",
    destaque: false,
    status: "previsto",
    vagasTotais: 100,
    escolaridades: ["superior"],
    escolaridadeTexto: "Superior (Auditor Fiscal)",
    resumo: "Carreira fiscal estadual do Tocantins. Edital previsto.",
  },
  {
    slug: "ministerio-saude-2026",
    nome: "Ministério da Saúde",
    tituloCompleto: "Concurso Ministério da Saúde 2026 (previsto)",
    orgao: "Ministério da Saúde",
    destaque: false,
    status: "previsto",
    vagasTotais: 7027,
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio, técnico e superior (várias áreas da saúde)",
    resumo: "Mais de 7 mil vagas solicitadas pelo Ministério da Saúde. Edital previsto.",
  },
];

function chaveOrdenacao(c: Concurso): number {
  const data = c.dataProva ?? c.inscricoesAte;
  return data ? new Date(data).getTime() : Number.MAX_SAFE_INTEGER;
}

/** Destaque primeiro, depois abertas (por data), depois previstos. */
function tier(c: Concurso): number {
  if (c.destaque) return 0;
  return c.status === "inscricoes_abertas" ? 1 : 2;
}

export const concursos: Concurso[] = [...listaBruta].sort((a, b) => {
  if (tier(a) !== tier(b)) return tier(a) - tier(b);
  const porData = chaveOrdenacao(a) - chaveOrdenacao(b);
  return porData !== 0 ? porData : a.nome.localeCompare(b.nome, "pt-BR");
});

export const concursoDestaque =
  concursos.find((c) => c.destaque) ?? concursos[0];

export function getConcurso(slug: string): Concurso | undefined {
  return concursos.find((c) => c.slug === slug);
}

// ---------------------------------------------------------------------------
// Filtro de vagas / cotas (para concursos com dados profundos)
// ---------------------------------------------------------------------------

export interface FiltroVagas {
  escolaridade: Escolaridade | "todas";
  area: string;
  uf: string;
  grupos: GrupoReservaId[];
}

export interface LinhaResultado {
  cargo: Cargo;
  uf: string;
  unidade: string;
  imediatas: number;
  reservadasParaVoce: number;
}

export interface ResultadoVagas {
  totalImediatas: number;
  totalCargos: number;
  reservadasParaVoce: number;
  porGrupo: { grupo: GrupoReserva; vagas: number }[];
  linhas: LinhaResultado[];
}

export const filtroVazio: FiltroVagas = {
  escolaridade: "todas",
  area: "todas",
  uf: "todas",
  grupos: [],
};

export function filtrarVagas(
  concurso: Concurso,
  filtro: FiltroVagas,
): ResultadoVagas {
  const cargos = concurso.cargos ?? [];
  const vagas = concurso.vagas ?? [];
  const gruposDoConcurso = concurso.gruposReserva ?? gruposReservaPadrao;

  const cargoPorSlug = new Map(cargos.map((c) => [c.slug, c]));
  const gruposSelecionados = gruposDoConcurso.filter((g) =>
    filtro.grupos.includes(g.id),
  );

  const linhas: LinhaResultado[] = [];
  const porGrupoMap = new Map<GrupoReservaId, number>();

  for (const vaga of vagas) {
    const cargo = cargoPorSlug.get(vaga.cargoSlug);
    if (!cargo) continue;
    if (filtro.escolaridade !== "todas" && cargo.escolaridade !== filtro.escolaridade) continue;
    if (filtro.area !== "todas" && cargo.area !== filtro.area) continue;
    if (filtro.uf !== "todas" && vaga.uf !== filtro.uf) continue;

    let reservadasParaVoce = 0;
    for (const grupo of gruposSelecionados) {
      const r = vagasReservadas(vaga.imediatas, grupo);
      reservadasParaVoce += r;
      porGrupoMap.set(grupo.id, (porGrupoMap.get(grupo.id) ?? 0) + r);
    }

    linhas.push({ cargo, uf: vaga.uf, unidade: vaga.unidade, imediatas: vaga.imediatas, reservadasParaVoce });
  }

  linhas.sort((a, b) => b.imediatas - a.imediatas);

  return {
    totalImediatas: linhas.reduce((s, l) => s + l.imediatas, 0),
    totalCargos: new Set(linhas.map((l) => l.cargo.slug)).size,
    reservadasParaVoce: linhas.reduce((s, l) => s + l.reservadasParaVoce, 0),
    porGrupo: gruposSelecionados.map((grupo) => ({
      grupo,
      vagas: porGrupoMap.get(grupo.id) ?? 0,
    })),
    linhas,
  };
}

export function areasDoConcurso(concurso: Concurso): string[] {
  return Array.from(new Set((concurso.cargos ?? []).map((c) => c.area))).sort();
}

export function ufsDoConcurso(concurso: Concurso): string[] {
  return Array.from(new Set((concurso.vagas ?? []).map((v) => v.uf))).sort();
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export const faq: FaqItem[] = [
  {
    pergunta: "Como funcionam os planos?",
    resposta:
      "São dois. O Plano Transpetro (R$ 50) dá acesso a todo o material, simulados e conteúdo da Transpetro até o dia da prova. O Plano Completo (R$ 80) libera todos os concursos da plataforma e os materiais que forem entrando.",
  },
  {
    pergunta: "O pagamento já está disponível?",
    resposta:
      "Estamos finalizando o checkout. Ao clicar em “Assinar” você reserva sua vaga com o preço atual - assim que o pagamento abrir, você é avisado em primeira mão e entra antes do reajuste.",
  },
  {
    pergunta: "Os números de vagas e salários são oficiais?",
    resposta:
      "São uma referência montada a partir da imprensa especializada e de editais anteriores. Editais e prazos mudam quase toda semana - confirme sempre na fonte oficial antes de se inscrever. Para a Transpetro, o edital já está publicado pela Cesgranrio.",
  },
  {
    pergunta: "Os simulados são no estilo da banca?",
    resposta:
      "Sim. Para a Transpetro seguem o padrão Cesgranrio (objetivas de múltipla escolha, muita interpretação e literalidade). Para os demais concursos, seguem a banca de cada um.",
  },
  {
    pergunta: "Esta plataforma é oficial de algum órgão?",
    resposta:
      "Não. É uma iniciativa independente de preparação para concursos, sem vínculo com a Petrobras, a Transpetro, a Cesgranrio ou qualquer órgão público. As inscrições são feitas apenas nos canais oficiais.",
  },
];
