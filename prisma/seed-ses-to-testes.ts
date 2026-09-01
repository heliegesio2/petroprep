import type { PrismaClient } from "@prisma/client";

/**
 * Banco inicial de questões do Concurso Saúde Tocantins 2026 (Módulo I).
 * Questões INÉDITAS, para treino, no espírito FGV (interpretação + literalidade,
 * 5 alternativas, gabarito comentado). Não são cópia de prova oficial e não
 * substituem estudo pela legislação/bibliografia. Português e Matemática/RL
 * reaproveitam o banco geral já existente (q-pt-*, q-mat-*).
 */

interface Q {
  id: string;
  disciplina: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  comentario: string;
}

const QUESTOES: Q[] = [
  // ---------------------------------------------------------- Informática Básica
  {
    id: "q-to-inf-01",
    disciplina: "Informática Básica",
    enunciado:
      "Um servidor precisa enviar um comunicado a vários colegas sem que os destinatários vejam os endereços uns dos outros. No cliente de e-mail, ele deve inserir os endereços no campo",
    alternativas: ["Para (To)", "Assunto", "Cco (Bcc)", "Cc", "Anexo"],
    correta: 2,
    comentario:
      "Cco (com cópia oculta / Bcc) envia a mensagem sem revelar os endereços aos demais destinatários. O campo Cc mostra todos os endereços a todos.",
  },
  {
    id: "q-to-inf-02",
    disciplina: "Informática Básica",
    enunciado:
      "No Microsoft Excel / LibreOffice Calc, a fórmula que retorna a média aritmética dos valores nas células de A1 até A10 é",
    alternativas: [
      "=SOMA(A1:A10)",
      "=MÉDIA(A1:A10)",
      "=CONT.NÚM(A1:A10)",
      "=MÁXIMO(A1:A10)",
      "=SE(A1:A10)",
    ],
    correta: 1,
    comentario:
      "MÉDIA (AVERAGE) calcula a média aritmética do intervalo. SOMA totaliza; CONT.NÚM conta células com número; MÁXIMO retorna o maior valor.",
  },
  {
    id: "q-to-inf-03",
    disciplina: "Informática Básica",
    enunciado:
      "Uma mensagem chega pedindo, com urgência, que o servidor confirme a senha do sistema clicando em um link para 'evitar o bloqueio da conta'. Essa é a descrição típica de um golpe de",
    alternativas: [
      "backup incremental",
      "phishing",
      "compactação de arquivos",
      "sincronização em nuvem",
      "atualização automática",
    ],
    correta: 1,
    comentario:
      "Phishing é a fraude que se passa por uma instituição confiável e usa urgência para induzir a vítima a informar senha ou dados. Nunca se confirma senha por link de e-mail.",
  },
  {
    id: "q-to-inf-04",
    disciplina: "Informática Básica",
    enunciado:
      "Sobre computação em nuvem (Google Drive, OneDrive), é correto afirmar que",
    alternativas: [
      "os arquivos ficam apenas no computador local, sem cópia remota",
      "permite acessar e sincronizar os mesmos arquivos em vários dispositivos pela internet",
      "funciona somente sem conexão com a internet",
      "substitui a necessidade de qualquer senha ou autenticação",
      "impede o compartilhamento de arquivos entre usuários",
    ],
    correta: 1,
    comentario:
      "A nuvem guarda os arquivos em servidores remotos e os sincroniza entre dispositivos conectados, permitindo acesso e compartilhamento controlados por autenticação.",
  },
  {
    id: "q-to-inf-05",
    disciplina: "Informática Básica",
    enunciado:
      "No Windows 10/11, a combinação de teclas usada para copiar um item selecionado e, em seguida, colá-lo é, respectivamente,",
    alternativas: [
      "Ctrl+X e Ctrl+V",
      "Ctrl+C e Ctrl+V",
      "Ctrl+Z e Ctrl+Y",
      "Ctrl+A e Ctrl+S",
      "Alt+Tab e Ctrl+P",
    ],
    correta: 1,
    comentario:
      "Ctrl+C copia e Ctrl+V cola. Ctrl+X recorta (move); Ctrl+Z desfaz; Ctrl+A seleciona tudo; Ctrl+S salva.",
  },
  {
    id: "q-to-inf-06",
    disciplina: "Informática Básica",
    enunciado:
      "A prática de manter cópias de segurança dos dados em local separado, para permitir a recuperação em caso de falha, perda ou ataque, é chamada de",
    alternativas: ["firewall", "backup", "cookie", "cache", "antivírus"],
    correta: 1,
    comentario:
      "Backup é a cópia de segurança. Firewall filtra o tráfego de rede; antivírus detecta programas maliciosos; cookies e cache são armazenamentos temporários do navegador.",
  },

  // --------------------------------------- História e Geografia do Tocantins
  {
    id: "q-to-geo-01",
    disciplina: "História e Geografia do Tocantins",
    enunciado:
      "O Estado do Tocantins foi criado pela Constituição Federal de 1988, a partir do desmembramento",
    alternativas: [
      "do sul do Estado do Pará",
      "do norte do Estado de Goiás",
      "do oeste do Estado do Maranhão",
      "do leste do Estado do Mato Grosso",
      "do Distrito Federal",
    ],
    correta: 1,
    comentario:
      "O Tocantins nasceu do desmembramento da porção norte de Goiás, reivindicação antiga da região, oficializada pela Constituição de 1988 e instalada em 1989.",
  },
  {
    id: "q-to-geo-02",
    disciplina: "História e Geografia do Tocantins",
    enunciado:
      "A capital do Tocantins, inaugurada em 1990, é uma cidade planejada chamada",
    alternativas: ["Araguaína", "Gurupi", "Porto Nacional", "Palmas", "Miracema"],
    correta: 3,
    comentario:
      "Palmas foi projetada para ser a capital. Miracema do Tocantins foi capital provisória nos primeiros meses; Araguaína é o maior município do norte do estado.",
  },
  {
    id: "q-to-geo-03",
    disciplina: "História e Geografia do Tocantins",
    enunciado:
      "O bioma predominante no território do Tocantins, marcado por vegetação de árvores retorcidas, gramíneas e estação seca acentuada, é o",
    alternativas: ["Cerrado", "Pantanal", "Caatinga", "Mata Atlântica", "Pampa"],
    correta: 0,
    comentario:
      "O Cerrado ocupa a maior parte do estado, em transição com a Amazônia ao norte. O Tocantins não tem Pantanal, Caatinga, Mata Atlântica nem Pampa em área expressiva.",
  },
  {
    id: "q-to-geo-04",
    disciplina: "História e Geografia do Tocantins",
    enunciado:
      "Os dois principais rios que delimitam e cortam o Estado do Tocantins, dando nome à região, são",
    alternativas: [
      "São Francisco e Parnaíba",
      "Tocantins e Araguaia",
      "Xingu e Tapajós",
      "Paraná e Paraguai",
      "Madeira e Purus",
    ],
    correta: 1,
    comentario:
      "O rio Tocantins (a leste) e o rio Araguaia (a oeste, na divisa com o Pará e Mato Grosso) são os eixos hidrográficos do estado.",
  },
  {
    id: "q-to-geo-05",
    disciplina: "História e Geografia do Tocantins",
    enunciado:
      "Região turística do leste do Tocantins, conhecida pelas dunas, serras, cachoeiras e fervedouros, é",
    alternativas: [
      "o Jalapão",
      "a Chapada Diamantina",
      "os Lençóis Maranhenses",
      "a Serra da Capivara",
      "o Parque dos Lençóis",
    ],
    correta: 0,
    comentario:
      "O Jalapão, com centro em Mateiros e Ponte Alta do Tocantins, é o principal destino de ecoturismo do estado. As demais opções ficam em outros estados.",
  },
  {
    id: "q-to-geo-06",
    disciplina: "História e Geografia do Tocantins",
    enunciado:
      "A base da economia do Tocantins, favorecida pela expansão da fronteira agrícola no Cerrado, é",
    alternativas: [
      "a indústria automobilística",
      "o agronegócio, com destaque para soja, milho e pecuária",
      "a extração de petróleo em plataformas",
      "a produção de vinho e maçã",
      "o polo petroquímico",
    ],
    correta: 1,
    comentario:
      "O agronegócio (grãos e pecuária) lidera a economia estadual, com forte crescimento da soja no sul e sudeste do Tocantins e logística ligada à Ferrovia Norte-Sul.",
  },

  // ----------------------------------------------------- Legislação do SUS
  {
    id: "q-to-leg-01",
    disciplina: "Legislação do SUS",
    enunciado:
      "São princípios doutrinários do Sistema Único de Saúde (SUS), previstos na Lei nº 8.080/1990,",
    alternativas: [
      "lucratividade, seletividade e concorrência",
      "universalidade, integralidade e equidade",
      "centralização, sigilo e hierarquia militar",
      "cobrança por procedimento e copagamento",
      "atendimento exclusivo a contribuintes da previdência",
    ],
    correta: 1,
    comentario:
      "Universalidade (saúde é direito de todos), integralidade (ações de promoção, prevenção e recuperação) e equidade (tratar desigualmente os desiguais) são os princípios doutrinários do SUS.",
  },
  {
    id: "q-to-leg-02",
    disciplina: "Legislação do SUS",
    enunciado:
      "A Lei nº 8.142/1990 dispõe sobre a participação da comunidade na gestão do SUS por meio de duas instâncias colegiadas em cada esfera de governo:",
    alternativas: [
      "a Assembleia Legislativa e o Tribunal de Contas",
      "a Conferência de Saúde e o Conselho de Saúde",
      "o Ministério Público e a Defensoria Pública",
      "o sindicato dos servidores e a OAB",
      "a Câmara de Vereadores e o Conselho Tutelar",
    ],
    correta: 1,
    comentario:
      "A Lei 8.142/90 cria a Conferência de Saúde (a cada 4 anos, avalia e propõe diretrizes) e o Conselho de Saúde (permanente e deliberativo), ambos com participação de usuários, trabalhadores e gestores.",
  },
  {
    id: "q-to-leg-03",
    disciplina: "Legislação do SUS",
    enunciado:
      "Nos Conselhos de Saúde, a representação dos usuários, em relação ao conjunto dos demais segmentos (governo, prestadores e trabalhadores), deve ser",
    alternativas: [
      "de 10% do total",
      "de 25% do total",
      "paritária, ou seja, 50% do total",
      "de 75% do total",
      "definida livremente pelo gestor",
    ],
    correta: 2,
    comentario:
      "A paridade dos Conselhos de Saúde reserva 50% das vagas aos usuários e os outros 50% divididos entre trabalhadores de saúde, governo e prestadores de serviço (Resolução CNS 453/2012).",
  },
  {
    id: "q-to-leg-04",
    disciplina: "Legislação do SUS",
    enunciado:
      "São diretrizes organizativas do SUS, conforme a Constituição de 1988 e a Lei nº 8.080/1990,",
    alternativas: [
      "descentralização, atendimento integral e participação da comunidade",
      "privatização, terceirização e cobrança de mensalidade",
      "centralização federal e comando único do Ministério da Defesa",
      "atendimento apenas em urgência e emergência",
      "livre concorrência entre planos privados",
    ],
    correta: 0,
    comentario:
      "As diretrizes do SUS são a descentralização (direção única em cada esfera), o atendimento integral (com prioridade para prevenção) e a participação da comunidade.",
  },
  {
    id: "q-to-leg-05",
    disciplina: "Legislação do SUS",
    enunciado:
      "O financiamento do SUS, conforme a legislação, é de responsabilidade",
    alternativas: [
      "exclusiva da União",
      "exclusiva dos municípios",
      "das três esferas de governo: União, Estados e Municípios",
      "do setor privado de saúde",
      "dos usuários, por meio de taxa mensal",
    ],
    correta: 2,
    comentario:
      "O SUS tem financiamento tripartite: recursos da União, dos Estados e dos Municípios, movimentados por meio dos respectivos Fundos de Saúde e fiscalizados pelos Conselhos.",
  },
  {
    id: "q-to-leg-06",
    disciplina: "Legislação do SUS",
    enunciado:
      "A regionalização e a hierarquização da rede de serviços do SUS têm como objetivo",
    alternativas: [
      "concentrar todos os atendimentos nos hospitais de grande porte da capital",
      "organizar os serviços por níveis de complexidade e por território, com a atenção primária como porta de entrada",
      "impedir o encaminhamento de pacientes entre municípios",
      "restringir o atendimento ao município de nascimento do usuário",
      "eliminar a atenção básica em favor da média e alta complexidade",
    ],
    correta: 1,
    comentario:
      "A rede é hierarquizada por níveis de complexidade (primária, secundária, terciária) e regionalizada por território, com a Atenção Primária à Saúde como porta de entrada preferencial e ordenadora do cuidado.",
  },
];

const SIMULADOS = [
  {
    slug: "to-portugues",
    titulo: "Saúde Tocantins - Língua Portuguesa",
    descricao:
      "Interpretação de texto, classes de palavras, concordância, regência e crase no estilo FGV.",
    disciplina: "Língua Portuguesa",
    duracaoMin: 40,
    questoes: [
      "q-pt-01", "q-pt-02", "q-pt-03", "q-pt-04", "q-pt-05",
      "q-pt-06", "q-pt-07", "q-pt-08", "q-pt-09", "q-pt-10",
    ],
    materias: ["medio--lingua-portuguesa", "superior--lingua-portuguesa"],
  },
  {
    slug: "to-matematica-rl",
    titulo: "Saúde Tocantins - Matemática e Raciocínio Lógico",
    descricao:
      "Porcentagem, razão e proporção, regra de três, funções e lógica de argumentação.",
    disciplina: "Matemática",
    duracaoMin: 45,
    questoes: [
      "q-mat-01", "q-mat-02", "q-mat-03", "q-mat-04", "q-mat-05",
      "q-mat-06", "q-mat-07", "q-mat-08", "q-mat-09", "q-mat-10",
    ],
    materias: [
      "medio--matematica-e-raciocinio-logico",
      "superior--raciocinio-logico-e-matematico",
    ],
  },
  {
    slug: "to-informatica",
    titulo: "Saúde Tocantins - Informática Básica",
    descricao:
      "Windows, pacote Office/LibreOffice, internet, e-mail, nuvem e segurança da informação.",
    disciplina: "Informática Básica",
    duracaoMin: 25,
    questoes: [
      "q-to-inf-01", "q-to-inf-02", "q-to-inf-03",
      "q-to-inf-04", "q-to-inf-05", "q-to-inf-06",
    ],
    materias: ["medio--informatica-basica"],
  },
  {
    slug: "to-tocantins",
    titulo: "Saúde Tocantins - História e Geografia do Tocantins",
    descricao:
      "Criação do estado, capital planejada, rios, bioma Cerrado, Jalapão e economia.",
    disciplina: "História e Geografia do Tocantins",
    duracaoMin: 25,
    questoes: [
      "q-to-geo-01", "q-to-geo-02", "q-to-geo-03",
      "q-to-geo-04", "q-to-geo-05", "q-to-geo-06",
    ],
    materias: [
      "medio--historia-e-geografia-do-tocantins",
      "superior--historia-e-geografia-do-estado-do-tocantins",
    ],
  },
  {
    slug: "to-legislacao",
    titulo: "Saúde Tocantins - Legislação do SUS",
    descricao:
      "Princípios e diretrizes do SUS, Lei 8.080, Lei 8.142, controle social e financiamento.",
    disciplina: "Legislação do SUS",
    duracaoMin: 25,
    questoes: [
      "q-to-leg-01", "q-to-leg-02", "q-to-leg-03",
      "q-to-leg-04", "q-to-leg-05", "q-to-leg-06",
    ],
    materias: ["superior--legislacao"],
  },
];

export async function seedTestesSesTo(prisma: PrismaClient, concursoId: string) {
  for (const q of QUESTOES) {
    const dados = {
      disciplina: q.disciplina,
      banca: "FGV",
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      correta: q.correta,
      comentario: q.comentario,
      dificuldade: 3,
    };
    await prisma.questao.upsert({
      where: { id: q.id },
      create: { id: q.id, ...dados },
      update: dados,
    });
  }

  for (const s of SIMULADOS) {
    const sim = await prisma.simulado.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        titulo: s.titulo,
        descricao: s.descricao,
        disciplina: s.disciplina,
        duracaoMin: s.duracaoMin,
        gratuito: false,
        concursoId,
      },
      update: {
        titulo: s.titulo,
        descricao: s.descricao,
        disciplina: s.disciplina,
        duracaoMin: s.duracaoMin,
        concursoId,
      },
    });
    await prisma.simuladoQuestao.deleteMany({ where: { simuladoId: sim.id } });
    await prisma.simuladoQuestao.createMany({
      data: s.questoes.map((questaoId, i) => ({
        simuladoId: sim.id,
        questaoId,
        ordem: i + 1,
      })),
    });
    await prisma.materiaConcurso.updateMany({
      where: { concursoId, slug: { in: s.materias } },
      data: { simuladoSlug: s.slug },
    });
  }

  console.log(
    `Testes ${SIMULADOS.length} do ses-to-2026 (${QUESTOES.length} questões novas + reaproveitadas).`,
  );
}
