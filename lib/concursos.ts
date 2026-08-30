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

/** Transpetro 2026: são 4 editais independentes. */
export type EditalTranspetro =
  | "mar-guarnicao"
  | "mar-oficiais"
  | "terra-medio"
  | "terra-superior";

export const editalLabel: Record<EditalTranspetro, string> = {
  "mar-guarnicao": "Quadro de Mar - Guarnição",
  "mar-oficiais": "Quadro de Mar - Oficiais",
  "terra-medio": "Quadro de Terra - Médio/Técnico",
  "terra-superior": "Quadro de Terra - Superior",
};

export interface Cargo {
  slug: string;
  titulo: string;
  escolaridade: Escolaridade;
  area: string;
  /** Salário inicial, em R$. */
  salario: number;
  /** Taxa de inscrição, em R$. */
  taxa?: number;
  requisito: string;
  /** Só na Transpetro: a qual dos 4 editais o cargo pertence. */
  edital?: EditalTranspetro;
}

export interface Vaga {
  cargoSlug: string;
  /** "Nacional", "Norte/Nordeste", "Rio de Janeiro", "São Paulo", "Sul", "Todos os polos de terra". */
  polo: string;
  imediatas: number;
  cadastroReserva: number;
}

export interface TopicoProva {
  disciplina: string;
  escolaridades: Escolaridade[];
  itens: string[];
  natureza: "basico" | "especifico";
  /** Parágrafo de conteúdo real. */
  resumo?: string;
  /** Quanto cai na prova. */
  prioridade?: "alta" | "media" | "baixa";
  /** Editais que cobram (rótulos livres). */
  editais?: string[];
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

/** Agrupa concursos para escolher a foto do slide. Ver IMAGEM_POR_CATEGORIA. */
export type CategoriaConcurso =
  | "petroleo"
  | "policia"
  | "bombeiros"
  | "saude"
  | "juridico"
  | "fiscal"
  | "educacao"
  | "administracao";

export const IMAGEM_POR_CATEGORIA: Record<CategoriaConcurso, string> = {
  petroleo: "/banner/transpetro-2026.jpg",
  policia: "/banner/cat-policia.jpg",
  bombeiros: "/banner/cat-bombeiros.jpg",
  saude: "/banner/cat-saude.jpg",
  juridico: "/banner/cat-juridico.jpg",
  fiscal: "/banner/cat-fiscal.jpg",
  educacao: "/banner/cat-educacao.jpg",
  administracao: "/banner/cat-administracao.jpg",
};

export interface Concurso {
  slug: string;
  categoria: CategoriaConcurso;
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
  /** Página do edital / do concurso no site do órgão ou da banca. */
  linkOficial?: string;
  /** Página onde o candidato cria a conta, escolhe o cargo e paga a taxa. */
  linkInscricao?: string;
  /** Caminho da foto do slide (ex.: "/banner/<slug>.jpg"). Ver public/banner/LEIA-ME.md. */
  imagem?: string;
  /** Dados profundos - presentes só onde já foram preenchidos. */
  cargos?: Cargo[];
  vagas?: Vaga[];
  conteudo?: TopicoProva[];
  gruposReserva?: GrupoReserva[];
}

// ---------------------------------------------------------------------------
// Rótulos e utilitários compartilhados
// ---------------------------------------------------------------------------

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

// Dados dos 4 editais Transpetro 2026 (Cesgranrio). Vagas imediatas e cadastro
// de reserva conforme cobertura da imprensa especializada; lista de cargos
// parcial (os principais). Confira o edital para o quadro completo por polo.
const cargosTranspetro: Cargo[] = [
  // Edital 01 - Quadro de Mar, Guarnição (nível médio, taxa R$ 81,50, nacional)
  { slug: "mar-auxiliar-saude", titulo: "Auxiliar de Saúde", escolaridade: "medio", area: "Saúde", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + técnico em Enfermagem, CIR e curso de formação da Marinha." },
  { slug: "mar-condutor-bombeador", titulo: "Condutor Bombeador", escolaridade: "medio", area: "Máquinas", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + certificação da Marinha para a função (CIR/STCW)." },
  { slug: "mar-condutor-mecanico", titulo: "Condutor Mecânico", escolaridade: "medio", area: "Máquinas", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + certificação da Marinha para a função (CIR/STCW)." },
  { slug: "mar-cozinheiro", titulo: "Cozinheiro", escolaridade: "medio", area: "Camarotagem", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + curso de formação de aquaviário da Marinha." },
  { slug: "mar-eletricista", titulo: "Eletricista", escolaridade: "medio", area: "Máquinas", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + técnico em Eletrotécnica/Eletrônica e certificação da Marinha." },
  { slug: "mar-moco-conves", titulo: "Moço de Convés", escolaridade: "medio", area: "Convés", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + curso de formação de aquaviário da Marinha (CFAQ)." },
  { slug: "mar-moco-maquinas", titulo: "Moço de Máquinas", escolaridade: "medio", area: "Máquinas", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + curso de formação de aquaviário da Marinha (CFAQ)." },
  { slug: "mar-taifeiro", titulo: "Taifeiro", escolaridade: "medio", area: "Camarotagem", salario: 5464, taxa: 81.5, edital: "mar-guarnicao", requisito: "Ensino médio + curso de formação de aquaviário da Marinha." },
  // Edital 02 - Quadro de Mar, Oficiais (nível superior, taxa R$ 117, nacional)
  { slug: "mar-2o-oficial-maquinas", titulo: "2º Oficial de Máquinas", escolaridade: "superior", area: "Máquinas", salario: 15034.81, taxa: 117, edital: "mar-oficiais", requisito: "Formação de Oficial de Máquinas da Marinha Mercante e certificação (CIR/STCW)." },
  { slug: "mar-2o-oficial-nautica", titulo: "2º Oficial de Náutica", escolaridade: "superior", area: "Náutica", salario: 15034.81, taxa: 117, edital: "mar-oficiais", requisito: "Formação de Oficial de Náutica da Marinha Mercante e certificação (CIR/STCW)." },
  // Edital 03 - Quadro de Terra, Médio/Técnico (taxa R$ 81,50, polos Norte/Nordeste, RJ, SP, Sul)
  { slug: "terra-adm-controle", titulo: "Técnico(a) de Administração e Controle Júnior", escolaridade: "tecnico", area: "Administrativo", salario: 5876, taxa: 81.5, edital: "terra-medio", requisito: "Ensino médio completo." },
  { slug: "terra-dutos-terminais", titulo: "Técnico(a) de Dutos e Terminais Júnior", escolaridade: "tecnico", area: "Operação", salario: 5876, taxa: 81.5, edital: "terra-medio", requisito: "Curso técnico em Química, Petroquímica, Mecânica, Eletrotécnica ou afins." },
  { slug: "terra-manutencao-mecanica", titulo: "Técnico(a) de Manutenção Júnior - Mecânica", escolaridade: "tecnico", area: "Manutenção", salario: 5876, taxa: 81.5, edital: "terra-medio", requisito: "Curso técnico em Mecânica." },
  { slug: "terra-manutencao-eletrica", titulo: "Técnico(a) de Manutenção Júnior - Elétrica/Instrumentação", escolaridade: "tecnico", area: "Manutenção", salario: 5876, taxa: 81.5, edital: "terra-medio", requisito: "Curso técnico em Eletrotécnica, Eletrônica ou Instrumentação." },
  { slug: "terra-seguranca", titulo: "Técnico(a) de Segurança Júnior", escolaridade: "tecnico", area: "SMS", salario: 5876, taxa: 81.5, edital: "terra-medio", requisito: "Curso técnico em Segurança do Trabalho e registro no MTE." },
  // Edital 04 - Quadro de Terra, Superior (taxa R$ 117, polos Norte/Nordeste, RJ, SP, Sul)
  { slug: "terra-administracao", titulo: "Profissional Júnior - Administração", escolaridade: "superior", area: "Administrativo", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Superior em Administração e registro no CRA." },
  { slug: "terra-contabeis", titulo: "Profissional Júnior - Ciências Contábeis", escolaridade: "superior", area: "Administrativo", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Superior em Ciências Contábeis e registro no CRC." },
  { slug: "terra-eng-mecanica", titulo: "Engenheiro(a) Júnior - Mecânica", escolaridade: "superior", area: "Engenharia", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Superior em Engenharia Mecânica e registro no CREA." },
  { slug: "terra-eng-civil", titulo: "Engenheiro(a) Júnior - Civil", escolaridade: "superior", area: "Engenharia", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Superior em Engenharia Civil e registro no CREA." },
  { slug: "terra-eng-eletrica", titulo: "Engenheiro(a) Júnior - Elétrica", escolaridade: "superior", area: "Engenharia", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Superior em Engenharia Elétrica e registro no CREA." },
  { slug: "terra-analise-sistemas", titulo: "Analista de Sistemas Júnior", escolaridade: "superior", area: "Tecnologia", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Superior em Computação, Sistemas de Informação ou afins." },
  { slug: "terra-advocacia", titulo: "Advogado(a) Júnior", escolaridade: "superior", area: "Jurídico", salario: 12916, taxa: 117, edital: "terra-superior", requisito: "Bacharel em Direito e inscrição na OAB. Prova objetiva + discursiva." },
];

const vagasTranspetro: Vaga[] = [
  // Quadro de Mar: abrangência nacional
  { cargoSlug: "mar-auxiliar-saude", polo: "Nacional", imediatas: 3, cadastroReserva: 63 },
  { cargoSlug: "mar-condutor-bombeador", polo: "Nacional", imediatas: 3, cadastroReserva: 63 },
  { cargoSlug: "mar-condutor-mecanico", polo: "Nacional", imediatas: 3, cadastroReserva: 63 },
  { cargoSlug: "mar-cozinheiro", polo: "Nacional", imediatas: 12, cadastroReserva: 252 },
  { cargoSlug: "mar-eletricista", polo: "Nacional", imediatas: 4, cadastroReserva: 84 },
  { cargoSlug: "mar-moco-conves", polo: "Nacional", imediatas: 15, cadastroReserva: 315 },
  { cargoSlug: "mar-moco-maquinas", polo: "Nacional", imediatas: 45, cadastroReserva: 945 },
  { cargoSlug: "mar-taifeiro", polo: "Nacional", imediatas: 4, cadastroReserva: 84 },
  { cargoSlug: "mar-2o-oficial-maquinas", polo: "Nacional", imediatas: 51, cadastroReserva: 561 },
  { cargoSlug: "mar-2o-oficial-nautica", polo: "Nacional", imediatas: 40, cadastroReserva: 440 },
  // Quadro de Terra: distribuídas entre os polos (detalhe no Anexo de Vagas do edital)
  { cargoSlug: "terra-adm-controle", polo: "Todos os polos de terra", imediatas: 5, cadastroReserva: 65 },
  { cargoSlug: "terra-dutos-terminais", polo: "Todos os polos de terra", imediatas: 8, cadastroReserva: 104 },
  { cargoSlug: "terra-manutencao-mecanica", polo: "Todos os polos de terra", imediatas: 5, cadastroReserva: 65 },
  { cargoSlug: "terra-manutencao-eletrica", polo: "Todos os polos de terra", imediatas: 4, cadastroReserva: 52 },
  { cargoSlug: "terra-seguranca", polo: "Todos os polos de terra", imediatas: 4, cadastroReserva: 52 },
  { cargoSlug: "terra-administracao", polo: "Todos os polos de terra", imediatas: 5, cadastroReserva: 55 },
  { cargoSlug: "terra-contabeis", polo: "Todos os polos de terra", imediatas: 5, cadastroReserva: 55 },
  { cargoSlug: "terra-eng-mecanica", polo: "Todos os polos de terra", imediatas: 6, cadastroReserva: 66 },
  { cargoSlug: "terra-eng-civil", polo: "Todos os polos de terra", imediatas: 3, cadastroReserva: 33 },
  { cargoSlug: "terra-eng-eletrica", polo: "Todos os polos de terra", imediatas: 5, cadastroReserva: 55 },
  { cargoSlug: "terra-analise-sistemas", polo: "Todos os polos de terra", imediatas: 5, cadastroReserva: 55 },
  { cargoSlug: "terra-advocacia", polo: "Todos os polos de terra", imediatas: 1, cadastroReserva: 11 },
];

// Conteúdo montado a partir do edital Transpetro 2026 (Cesgranrio) e das provas
// anteriores da mesma banca. Os "Conhecimentos Básicos" caem em todos os editais;
// os "Conhecimentos Específicos" mudam por cargo. Confira o conteúdo programático
// completo no anexo do seu edital.
const conteudoTranspetro: TopicoProva[] = [
  {
    disciplina: "Língua Portuguesa",
    escolaridades: ["medio", "tecnico", "superior"],
    natureza: "basico",
    prioridade: "alta",
    editais: ["Todos os 4 editais"],
    resumo:
      "É a disciplina que mais pesa entre os conhecimentos básicos e a que mais elimina candidato na Cesgranrio. A banca cobra interpretação de textos longos (jornalísticos e de divulgação técnica), com pegadinhas de inferência, tese e ponto de vista do autor. Gramática sempre contextualizada ao texto: reescritura de frases sem mudar o sentido, substituição de conectivos, colocação e referência dos pronomes, regência e crase, concordância e pontuação. Vale treinar com provas anteriores da própria Cesgranrio.",
    itens: [
      "Compreensão e interpretação de textos: tese, argumento, inferência e ironia",
      "Coesão e coerência: conectivos, referência, elipse e progressão temática",
      "Reescritura de períodos preservando o sentido",
      "Ortografia, acentuação, emprego da crase e pontuação",
      "Classes de palavras, regência verbal e nominal",
      "Concordância verbal e nominal",
      "Significação das palavras: sinonímia, antonímia, denotação e conotação",
    ],
  },
  {
    disciplina: "Matemática",
    escolaridades: ["medio", "tecnico"],
    natureza: "basico",
    prioridade: "media",
    editais: ["Quadro de Mar - Guarnição", "Quadro de Terra - Médio/Técnico (parte dos cargos)"],
    resumo:
      "Cobrança de raciocínio quantitativo aplicado, sem exigir demonstração. O forte da banca é porcentagem, proporção e regra de três em problemas com contexto (consumo, vazão, rendimento, escala). Aparecem também funções de 1º e 2º grau, progressões, sistemas lineares e noções de estatística e probabilidade. Leitura de gráficos e tabelas costuma valer questões fáceis, então não deixe passar.",
    itens: [
      "Razão, proporção, divisão proporcional e porcentagem",
      "Regra de três simples e composta",
      "Funções e equações do 1º e 2º grau",
      "Progressões aritmética e geométrica",
      "Sistemas de equações lineares",
      "Estatística descritiva e probabilidade básica",
      "Leitura e interpretação de gráficos e tabelas",
    ],
  },
  {
    disciplina: "Língua Inglesa",
    escolaridades: ["superior"],
    natureza: "basico",
    prioridade: "media",
    editais: ["Quadro de Terra - Superior", "Quadro de Mar - Oficiais"],
    resumo:
      "Prova de leitura instrumental: dois ou três textos técnicos/acadêmicos da área de energia e logística, com questões de ideia principal, detalhe, inferência e vocabulário em contexto. Não cobra produção escrita. Foco em reconhecer referência (this, that, it), sufixos e prefixos, false friends, e o sentido de conectivos (however, therefore, whereas). Para os Oficiais, some vocabulário marítimo padrão (SMCP).",
    itens: [
      "Ideia principal, propósito e público do texto",
      "Inferência e informação explícita x implícita",
      "Vocabulário em contexto, formação de palavras e false friends",
      "Referência pronominal e conectivos",
      "Tempos verbais, voz passiva e modais",
      "Terminologia de óleo, gás, dutos e navegação",
    ],
  },
  {
    disciplina: "Conhecimentos Específicos - Quadro de Mar (Guarnição)",
    escolaridades: ["medio"],
    natureza: "especifico",
    prioridade: "alta",
    editais: ["Quadro de Mar - Guarnição"],
    resumo:
      "Varia por função (Moço de Convés, Moço de Máquinas, Condutor, Eletricista, Cozinheiro, Taifeiro, Auxiliar de Saúde), mas o tronco comum é segurança da vida no mar, marinharia e legislação aquaviária. Estude a partir da bibliografia da Marinha (Ensino Profissional Marítimo) indicada no edital. Convés cobra faina de amarração, cabos e sinalização; Máquinas cobra sistemas de bombeamento, motores e lubrificação; funções de saúde e camaroteiro têm conteúdo próprio.",
    itens: [
      "Segurança da vida no mar, SOLAS e uso de EPI/EPC a bordo",
      "Marinharia: cabos, nós, amarração, sinalização náutica",
      "Prevenção e combate a incêndio e abandono de navio",
      "Máquinas: bombas, motores de combustão, sistemas de óleo e lastro",
      "Convés: manobra, movimentação de carga e conservação do navio",
      "Legislação aquaviária (NORMAM) e STCW aplicável à função",
      "Primeiros socorros e higiene a bordo",
    ],
  },
  {
    disciplina: "Conhecimentos Específicos - Quadro de Mar (Oficiais)",
    escolaridades: ["superior"],
    natureza: "especifico",
    prioridade: "alta",
    editais: ["Quadro de Mar - Oficiais"],
    resumo:
      "Nível de Oficial de Náutica ou de Máquinas da Marinha Mercante, seguindo a Convenção STCW. Náutica cobra navegação (estimada, costeira e eletrônica), estabilidade, RIPEAM e manobra; Máquinas cobra termodinâmica aplicada, motores diesel marítimos, sistemas auxiliares, geração e distribuição elétrica de bordo. Os dois compartilham segurança, MARPOL e gestão de recursos de passadiço/praça de máquinas.",
    itens: [
      "Náutica: navegação estimada, costeira e eletrônica (GPS, radar, ECDIS)",
      "RIPEAM, manobra e governo do navio",
      "Estabilidade, trim e plano de carga",
      "Máquinas: motores diesel marítimos, turbinas e sistemas auxiliares",
      "Geração, distribuição e proteção elétrica de bordo",
      "MARPOL, prevenção da poluição e gestão de resíduos",
      "Gerenciamento de recursos e procedimentos de emergência",
    ],
  },
  {
    disciplina: "Conhecimentos Específicos - Quadro de Terra (Técnico)",
    escolaridades: ["tecnico"],
    natureza: "especifico",
    prioridade: "alta",
    editais: ["Quadro de Terra - Médio/Técnico"],
    resumo:
      "Depende do cargo. Dutos e Terminais: transferência e estocagem de derivados, bombas e compressores, medição, boletim de medição e automação de terminais. Manutenção (Mecânica ou Elétrica/Instrumentação): planejamento de manutenção, elementos de máquinas, ensaios, malhas de controle e instrumentação. Segurança: Normas Regulamentadoras, PPRA/PGR, APR e investigação de acidentes. Administração e Controle: rotinas administrativas, noções de contabilidade e de licitações.",
    itens: [
      "Dutos e Terminais: transferência, estocagem, bombas, medição e automação",
      "Manutenção mecânica: elementos de máquinas, lubrificação, alinhamento e ensaios",
      "Manutenção elétrica/instrumentação: malhas de controle, sensores e NR-10",
      "Segurança do trabalho: NRs (NR-13, NR-20, NR-33, NR-35), APR e PT",
      "Administração e Controle: rotinas administrativas e noções de contabilidade",
      "SMS: resposta a emergências, gestão ambiental e legislação",
    ],
  },
  {
    disciplina: "Conhecimentos Específicos - Quadro de Terra (Superior)",
    escolaridades: ["superior"],
    natureza: "especifico",
    prioridade: "alta",
    editais: ["Quadro de Terra - Superior"],
    resumo:
      "Conteúdo da formação do cargo mais o recorte do setor. Engenharias (Mecânica, Civil, Elétrica): disciplina de base + integridade de dutos, tancagem, projeto e regulação da ANP. Análise de Sistemas: engenharia de software, banco de dados, redes, cloud e segurança da informação. Administração e Contábeis: administração pública, orçamento, contabilidade societária e pública, Lei 14.133 (licitações). Advocacia tem prova discursiva além da objetiva.",
    itens: [
      "Engenharia Mecânica: mecânica dos fluidos, máquinas de fluxo, materiais e soldagem",
      "Engenharia Civil: estruturas, geotecnia, fundações e obras industriais",
      "Engenharia Elétrica: sistemas de potência, acionamentos e proteção",
      "Integridade de dutos e terminais, corrosão e inspeção",
      "Análise de Sistemas: engenharia de software, dados, redes e segurança",
      "Administração/Contábeis: administração pública, orçamento e Lei 14.133",
      "Advocacia: Direito Constitucional, Administrativo, Civil, Trabalho e discursiva",
    ],
  },
];

// ---------------------------------------------------------------------------
// Catálogo de concursos
// ---------------------------------------------------------------------------

const listaBruta: Concurso[] = [
  {
    slug: "transpetro-2026",
    categoria: "petroleo",
    nome: "Transpetro",
    tituloCompleto: "Concurso Transpetro 2026",
    orgao: "Petrobras Transporte S.A. (Transpetro)",
    banca: "Cesgranrio",
    destaque: true,
    status: "inscricoes_abertas",
    vagasTotais: 4171,
    salarioDe: 5464,
    salarioAte: 15034.81,
    inscricoesAte: "2026-09-14",
    dataProva: "2026-11-29",
    escolaridades: ["medio", "tecnico", "superior"],
    escolaridadeTexto: "Médio, técnico e superior (conforme o edital)",
    resumo:
      "Quatro editais: Quadro de Mar (Guarnição e Oficiais) e Quadro de Terra (médio/técnico e superior). Cerca de 281 vagas imediatas e 3.890 de cadastro de reserva, prova Cesgranrio em 29/11.",
    linkOficial: "https://www.cesgranrio.org.br/concurso/transpetro-2026/",
    linkInscricao: "https://concursos.cesgranrio.org.br/portal/avaliacoes/22",
    imagem: "/banner/transpetro-2026.jpg",
    cargos: cargosTranspetro,
    vagas: vagasTranspetro,
    conteudo: conteudoTranspetro,
    gruposReserva: gruposReservaPadrao,
  },
  {
    slug: "ses-to-2026",
    categoria: "saude",
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
    categoria: "policia",
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
    categoria: "policia",
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
    categoria: "policia",
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
    categoria: "juridico",
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
    categoria: "juridico",
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
    categoria: "juridico",
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
    categoria: "fiscal",
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
    categoria: "bombeiros",
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
    categoria: "administracao",
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
    categoria: "fiscal",
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
    categoria: "juridico",
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
    categoria: "policia",
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
    categoria: "fiscal",
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
    categoria: "saude",
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
    categoria: "administracao",
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
    categoria: "policia",
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
    categoria: "juridico",
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
    categoria: "juridico",
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
    categoria: "fiscal",
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
    categoria: "fiscal",
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
    categoria: "policia",
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
    categoria: "policia",
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
    categoria: "saude",
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
    categoria: "administracao",
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
    categoria: "administracao",
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
    categoria: "policia",
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
    categoria: "administracao",
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
    categoria: "educacao",
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
    categoria: "educacao",
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
    categoria: "educacao",
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
    categoria: "educacao",
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
    categoria: "bombeiros",
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
    categoria: "administracao",
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
    categoria: "administracao",
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
    categoria: "saude",
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
    categoria: "saude",
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
    categoria: "administracao",
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
    categoria: "administracao",
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
    categoria: "saude",
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
    categoria: "fiscal",
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
    categoria: "administracao",
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
    categoria: "saude",
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
    categoria: "administracao",
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
    categoria: "administracao",
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
    categoria: "juridico",
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
    categoria: "juridico",
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
    categoria: "policia",
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
    categoria: "policia",
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
    categoria: "fiscal",
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
    categoria: "fiscal",
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
    categoria: "saude",
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

/** Foto do slide: a específica do concurso, senão a da categoria. */
export function imagemDoConcurso(concurso: Concurso): string {
  return concurso.imagem ?? IMAGEM_POR_CATEGORIA[concurso.categoria];
}

/**
 * Link "onde me inscrevo e pago a taxa": a página de inscrição quando conhecida,
 * senão a página oficial do concurso. `undefined` = ainda não temos URL.
 */
export function linkInscricaoDoConcurso(concurso: Concurso): string | undefined {
  return concurso.linkInscricao ?? concurso.linkOficial;
}

// ---------------------------------------------------------------------------
// Filtro do carrossel (nível de concurso): estreita a lista pelo perfil
// ---------------------------------------------------------------------------

export type FiltroSituacao = "todas" | "inscricoes_abertas" | "previsto";

export interface FiltroConcursos {
  escolaridade: Escolaridade | "todas";
  situacao: FiltroSituacao;
  /** Salário mínimo (teto do cargo) que o concurso precisa alcançar. */
  salarioMinimo: number;
}

export const filtroConcursosVazio: FiltroConcursos = {
  escolaridade: "todas",
  situacao: "todas",
  salarioMinimo: 0,
};

export const opcoesSalarioMinimo: { valor: number; label: string }[] = [
  { valor: 0, label: "Qualquer salário" },
  { valor: 3000, label: "A partir de R$ 3.000" },
  { valor: 5000, label: "A partir de R$ 5.000" },
  { valor: 8000, label: "A partir de R$ 8.000" },
  { valor: 12000, label: "A partir de R$ 12.000" },
  { valor: 18000, label: "A partir de R$ 18.000" },
];

export function concursoAtendeFiltro(
  concurso: Concurso,
  filtro: FiltroConcursos,
): boolean {
  if (
    filtro.escolaridade !== "todas" &&
    !concurso.escolaridades.includes(filtro.escolaridade)
  ) {
    return false;
  }
  if (filtro.situacao !== "todas" && concurso.status !== filtro.situacao) {
    return false;
  }
  if (filtro.salarioMinimo > 0) {
    if (!concurso.salarioAte || concurso.salarioAte < filtro.salarioMinimo) {
      return false;
    }
  }
  return true;
}

export function filtrarConcursos(filtro: FiltroConcursos): Concurso[] {
  return concursos.filter((c) => concursoAtendeFiltro(c, filtro));
}

export interface ResumoConcursos {
  total: number;
  salarioMin: number | null;
  salarioMax: number | null;
}

export function resumoConcursos(lista: Concurso[]): ResumoConcursos {
  const pisos = lista
    .map((c) => c.salarioDe ?? c.salarioAte)
    .filter((v): v is number => typeof v === "number");
  const tetos = lista
    .map((c) => c.salarioAte)
    .filter((v): v is number => typeof v === "number");
  return {
    total: lista.length,
    salarioMin: pisos.length ? Math.min(...pisos) : null,
    salarioMax: tetos.length ? Math.max(...tetos) : null,
  };
}

// ---------------------------------------------------------------------------
// Filtro de vagas / cotas (para concursos com dados profundos)
// ---------------------------------------------------------------------------

export interface FiltroVagas {
  escolaridade: Escolaridade | "todas";
  area: string;
  polo: string;
  edital: string;
  grupos: GrupoReservaId[];
}

export interface LinhaResultado {
  cargo: Cargo;
  polo: string;
  editalLabel: string;
  imediatas: number;
  cadastroReserva: number;
  reservadasParaVoce: number;
}

export interface ResultadoVagas {
  totalImediatas: number;
  totalReserva: number;
  totalCargos: number;
  reservadasParaVoce: number;
  porGrupo: { grupo: GrupoReserva; vagas: number }[];
  linhas: LinhaResultado[];
}

export const filtroVazio: FiltroVagas = {
  escolaridade: "todas",
  area: "todas",
  polo: "todos",
  edital: "todos",
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
    if (filtro.polo !== "todos" && vaga.polo !== filtro.polo) continue;
    if (filtro.edital !== "todos" && cargo.edital !== filtro.edital) continue;

    let reservadasParaVoce = 0;
    for (const grupo of gruposSelecionados) {
      const r = vagasReservadas(vaga.imediatas, grupo);
      reservadasParaVoce += r;
      porGrupoMap.set(grupo.id, (porGrupoMap.get(grupo.id) ?? 0) + r);
    }

    linhas.push({
      cargo,
      polo: vaga.polo,
      editalLabel: cargo.edital ? editalLabel[cargo.edital] : "",
      imediatas: vaga.imediatas,
      cadastroReserva: vaga.cadastroReserva,
      reservadasParaVoce,
    });
  }

  linhas.sort((a, b) => b.imediatas - a.imediatas);

  return {
    totalImediatas: linhas.reduce((s, l) => s + l.imediatas, 0),
    totalReserva: linhas.reduce((s, l) => s + l.cadastroReserva, 0),
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

export function polosDoConcurso(concurso: Concurso): string[] {
  return Array.from(new Set((concurso.vagas ?? []).map((v) => v.polo))).sort();
}

export function editaisDoConcurso(
  concurso: Concurso,
): { id: EditalTranspetro; label: string }[] {
  const ids = Array.from(
    new Set(
      (concurso.cargos ?? [])
        .map((c) => c.edital)
        .filter((e): e is EditalTranspetro => Boolean(e)),
    ),
  );
  return ids.map((id) => ({ id, label: editalLabel[id] }));
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
