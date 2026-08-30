/**
 * Fonte única de dados da plataforma — vários concursos.
 *
 * IMPORTANTE: os números vêm de um panorama de imprensa (ago/2026) e de concursos
 * anteriores. São ESTIMATIVAS / referência — confira sempre a fonte oficial antes
 * de se inscrever. Só a Transpetro tem dados profundos (cargos, vagas, cotas,
 * conteúdo); os demais são cards de resumo até o dono priorizar cada um.
 *
 * Ao sair um edital oficial, ajustar o objeto do concurso aqui — é o único lugar.
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
  salarioAte?: number;
  /** ISO. Fim das inscrições. */
  inscricoesAte?: string;
  /** ISO. Data da prova — usada no countdown e na ordenação. */
  dataProva?: string;
  escolaridades: Escolaridade[];
  resumo: string;
  linkOficial?: string;
  /** Dados profundos — presentes só onde já foram preenchidos. */
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
// Reserva de vagas (cotas) — regras federais
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
    nota: "Não há cota federal para indígenas em concursos da Petrobras/Transpetro. Você concorre na ampla concorrência. Alguns editais criam reserva própria — confirmamos quando o edital sair.",
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
// Dados profundos — Transpetro 2026 (banca Cesgranrio)
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
    titulo: "Engenheiro(a) Júnior — Dutos/Transporte",
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
    titulo: "Profissional Júnior — Ciências Contábeis",
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

  { cargoSlug: "tec-administracao", uf: "RJ", unidade: "Sede — Rio de Janeiro", imediatas: 50 },
  { cargoSlug: "tec-administracao", uf: "BA", unidade: "Salvador", imediatas: 25 },
  { cargoSlug: "tec-administracao", uf: "SP", unidade: "São Paulo", imediatas: 25 },
  { cargoSlug: "tec-administracao", uf: "RN", unidade: "Natal", imediatas: 20 },

  { cargoSlug: "eng-equipamentos", uf: "RJ", unidade: "Sede — Rio de Janeiro", imediatas: 45 },
  { cargoSlug: "eng-equipamentos", uf: "BA", unidade: "Salvador", imediatas: 20 },
  { cargoSlug: "eng-equipamentos", uf: "SP", unidade: "São Paulo", imediatas: 15 },

  { cargoSlug: "eng-dutos", uf: "RJ", unidade: "Sede — Rio de Janeiro", imediatas: 40 },
  { cargoSlug: "eng-dutos", uf: "ES", unidade: "Vitória", imediatas: 15 },

  { cargoSlug: "analista-sistemas", uf: "RJ", unidade: "Sede / TIC — Rio de Janeiro", imediatas: 45 },
  { cargoSlug: "analista-sistemas", uf: "SP", unidade: "São Paulo", imediatas: 15 },

  { cargoSlug: "advogado", uf: "RJ", unidade: "Jurídico — Rio de Janeiro", imediatas: 12 },
  { cargoSlug: "advogado", uf: "BA", unidade: "Salvador", imediatas: 3 },

  { cargoSlug: "profissional-contabilidade", uf: "RJ", unidade: "Sede — Rio de Janeiro", imediatas: 25 },
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
    resumo:
      "Quadros Terra e Mar. Vagas de nível médio, técnico e superior em terminais e dutos pelo país, com prova no estilo Cesgranrio.",
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
    salarioAte: 17727.63,
    inscricoesAte: "2026-09-10",
    escolaridades: ["medio", "tecnico", "superior"],
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
    salarioAte: 16495.67,
    inscricoesAte: "2026-09-08",
    escolaridades: ["superior"],
    resumo:
      "Vagas para Delegado, Investigador e Escrivão, com exigência de nível superior e etapas de aptidão física e psicológica.",
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
    resumo:
      "Carreiras de nível superior no Judiciário paranaense, com um dos salários iniciais mais altos entre os concursos abertos.",
  },
  {
    slug: "iss-manaus-2026",
    nome: "ISS Manaus",
    tituloCompleto: "ISS Manaus 2026 — Auditor Fiscal",
    orgao: "Prefeitura de Manaus / SEMEF",
    destaque: false,
    status: "inscricoes_abertas",
    vagasTotais: 20,
    salarioAte: 27270.61,
    inscricoesAte: "2026-08-27",
    escolaridades: ["superior"],
    resumo:
      "Poucas vagas, salário no topo da lista. Auditor Fiscal de Tributos Municipais, prova de alto nível em Direito Tributário e Contabilidade.",
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
    resumo:
      "Auditor-Fiscal e Analista-Tributário. Edital ainda não publicado — um dos mais aguardados da esfera federal.",
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
    resumo:
      "Auditor Federal de Controle Externo. Previsto para 2026, com remuneração inicial acima de R$ 20 mil.",
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
    resumo:
      "Auditor Fiscal e Agente de Tributos. Carreira fiscal estadual, edital previsto para 2026.",
  },
];

function chaveOrdenacao(c: Concurso): number {
  const data = c.dataProva ?? c.inscricoesAte;
  return data ? new Date(data).getTime() : Number.MAX_SAFE_INTEGER;
}

export const concursos: Concurso[] = [...listaBruta].sort((a, b) => {
  if (a.destaque !== b.destaque) return a.destaque ? -1 : 1;
  return chaveOrdenacao(a) - chaveOrdenacao(b);
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
      "Estamos finalizando o checkout. Ao clicar em “Assinar” você reserva sua vaga com o preço atual — assim que o pagamento abrir, você é avisado em primeira mão e entra antes do reajuste.",
  },
  {
    pergunta: "Os números de vagas e salários são oficiais?",
    resposta:
      "São uma referência montada a partir da imprensa especializada e de editais anteriores. Editais e prazos mudam quase toda semana — confirme sempre na fonte oficial antes de se inscrever. Para a Transpetro, o edital já está publicado pela Cesgranrio.",
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
