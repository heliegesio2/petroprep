/**
 * Seed dos simulados (banco de questões + provas montadas).
 *
 * Idempotente: roda quantas vezes quiser. Questões por `id` fixo, simulados por
 * `slug`, e a lista de questões de cada simulado é refeita a cada execução.
 *
 * As questões são INÉDITAS, escritas no estilo Cesgranrio (5 alternativas,
 * interpretação e literalidade, gabarito comentado) apenas para treino. Não são
 * cópia de nenhuma prova oficial.
 */
import { PrismaClient } from "@prisma/client";
import { seedConcursos } from "./seed-concursos";

const prisma = new PrismaClient();

interface QuestaoSeed {
  id: string;
  disciplina: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  comentario: string;
  dificuldade?: number;
}

const questoes: QuestaoSeed[] = [
  // ------------------------------------------------------------------ Português
  {
    id: "q-pt-01",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Leia o trecho: "A transição energética não é um evento, mas um processo: exige décadas de investimento, revisão de contratos e, sobretudo, decisões políticas que sobrevivam a um único mandato."\n\nA ideia central defendida pelo autor é a de que a transição energética',
    alternativas: [
      "é inviável no curto prazo por falta de tecnologia.",
      "depende de continuidade e não se resolve de imediato.",
      "só ocorrerá quando houver consenso político total.",
      "deve ser conduzida exclusivamente pela iniciativa privada.",
      "já foi concluída na maior parte dos países desenvolvidos.",
    ],
    correta: 1,
    comentario:
      'O trecho opõe "evento" a "processo" e cita "décadas" e decisões que "sobrevivam a um único mandato" - ou seja, defende continuidade ao longo do tempo. As demais extrapolam o que o texto afirma.',
    dificuldade: 2,
  },
  {
    id: "q-pt-02",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Em "Embora os prazos fossem apertados, a equipe entregou o relatório dentro do previsto", a conjunção destacada estabelece relação de',
    alternativas: ["causa", "concessão", "condição", "conclusão", "finalidade"],
    correta: 1,
    comentario:
      '"Embora" introduz uma oração concessiva: admite um obstáculo (prazos apertados) que não impediu o resultado. Poderia ser trocada por "ainda que" ou "mesmo que".',
    dificuldade: 2,
  },
  {
    id: "q-pt-03",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Assinale a opção em que o emprego do sinal indicativo de crase está CORRETO.',
    alternativas: [
      "O material foi entregue à todos os candidatos.",
      "Ele se referiu à uma norma antiga.",
      "A prova terá início às 14 horas.",
      "Começou à chover durante o exame.",
      "Estou disposto à ajudar os colegas.",
    ],
    correta: 2,
    comentario:
      'Em "às 14 horas" há crase pela locução adverbial de tempo com palavra feminina. Antes de pronome indefinido ("todos"), artigo indefinido ("uma") e verbo ("chover", "ajudar") não ocorre crase.',
    dificuldade: 3,
  },
  {
    id: "q-pt-04",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Na frase "Fazem dez anos que a unidade opera sem acidentes", a norma-padrão recomenda a forma',
    alternativas: [
      '"Fazem dez anos", pois o sujeito é "dez anos".',
      '"Faz dez anos", pois o verbo fazer indicando tempo decorrido é impessoal.',
      '"Fazem-se dez anos", com o pronome apassivador.',
      '"Há de fazer dez anos", única forma aceita.',
      '"Fizeram dez anos", concordando no plural.',
    ],
    correta: 1,
    comentario:
      'O verbo "fazer" indicando tempo decorrido é impessoal: não tem sujeito e fica sempre na 3ª pessoa do singular - "Faz dez anos".',
    dificuldade: 2,
  },
  {
    id: "q-pt-05",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Considere: "O gestor pediu ao técnico que revisasse os dados antes de enviá-los à diretoria."\n\nO pronome "los" retoma',
    alternativas: [
      '"gestor"',
      '"técnico"',
      '"dados"',
      '"diretoria"',
      "a oração inteira",
    ],
    correta: 2,
    comentario:
      'O pronome oblíquo "-los" é masculino plural e retoma o termo mais próximo compatível: "os dados". "Enviá-los" = enviar os dados.',
    dificuldade: 1,
  },
  {
    id: "q-pt-06",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Em qual alternativa a reescrita MANTÉM o sentido de "Caso o pagamento não seja confirmado, a inscrição será cancelada"?',
    alternativas: [
      "Como o pagamento não foi confirmado, a inscrição será cancelada.",
      "Se o pagamento não for confirmado, a inscrição será cancelada.",
      "Embora o pagamento não seja confirmado, a inscrição será cancelada.",
      "Assim que o pagamento for confirmado, a inscrição será cancelada.",
      "Portanto, o pagamento não confirmado cancela a inscrição.",
    ],
    correta: 1,
    comentario:
      '"Caso" tem valor condicional, equivalente a "se". "Como" (causa), "embora" (concessão) e "assim que" (tempo) mudam a relação lógica.',
    dificuldade: 2,
  },
  {
    id: "q-pt-07",
    disciplina: "Língua Portuguesa",
    enunciado:
      'A palavra "conquanto", em "Conquanto houvesse riscos, a operação prosseguiu", pode ser substituída, sem alteração de sentido, por',
    alternativas: ["porquanto", "portanto", "ainda que", "porque", "logo que"],
    correta: 2,
    comentario:
      '"Conquanto" é conjunção concessiva, sinônima de "ainda que" e "embora". Não confundir com "porquanto" (causal/explicativa).',
    dificuldade: 3,
  },
  {
    id: "q-pt-08",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Assinale a frase em que há ERRO de concordância verbal.',
    alternativas: [
      "A maioria dos servidores aprovou a proposta.",
      "Devem existir outras soluções para o problema.",
      "Houveram falhas no sistema de medição.",
      "Mais de um candidato se inscreveu no cargo.",
      "Cerca de vinte pessoas participaram do treinamento.",
    ],
    correta: 2,
    comentario:
      'O verbo "haver" no sentido de "existir" é impessoal: "Houve falhas". "Houveram" está errado. Em "devem existir", quem flexiona é o auxiliar, e "existir" é verbo pessoal - por isso o plural é correto ali.',
    dificuldade: 2,
  },
  {
    id: "q-pt-09",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Em "É necessário que todos os envolvidos ______ os procedimentos de segurança", a forma verbal que completa corretamente a lacuna é',
    alternativas: ["seguem", "sigam", "seguiram", "seguirão", "seguindo"],
    correta: 1,
    comentario:
      'A expressão "é necessário que" exige o modo subjuntivo: "que todos sigam". "Seguem" é indicativo; "seguiram/seguirão" mudam o tempo e não combinam com a certeza da recomendação.',
    dificuldade: 2,
  },
  {
    id: "q-pt-10",
    disciplina: "Língua Portuguesa",
    enunciado:
      'No período "O relatório, que foi entregue ontem, apontou inconsistências", a oração adjetiva destacada é',
    alternativas: [
      "restritiva, pois limita o sentido de relatório.",
      "explicativa, pois acrescenta informação a um termo já definido.",
      "reduzida de infinitivo.",
      "substantiva completiva nominal.",
      "coordenada sindética aditiva.",
    ],
    correta: 1,
    comentario:
      "A oração vem entre vírgulas e apenas acrescenta um dado sobre o relatório (que é único no contexto): é adjetiva explicativa. Sem as vírgulas e com sentido de seleção, seria restritiva.",
    dificuldade: 3,
  },
  {
    id: "q-pt-11",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Leia: "Os investimentos em manutenção preventiva reduzem paradas não programadas; ______, diminuem o custo total de operação."\n\nO conectivo que melhor preenche a lacuna, indicando conclusão, é',
    alternativas: ["no entanto", "por conseguinte", "por exemplo", "ou seja", "ainda assim"],
    correta: 1,
    comentario:
      '"Por conseguinte" introduz conclusão/consequência, encadeando o segundo fato como resultado do primeiro. "No entanto" e "ainda assim" marcam oposição; "ou seja" retifica; "por exemplo" exemplifica.',
    dificuldade: 2,
  },
  {
    id: "q-pt-12",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Assinale a opção corretamente acentuada segundo a norma vigente.',
    alternativas: [
      "ítem",
      "rúbrica",
      "gratúito",
      "sútil",
      "juízo",
    ],
    correta: 4,
    comentario:
      '"Juízo" é acentuado porque o "i" tônico forma hiato e está sozinho na sílaba (ju-í-zo). "Item", "rubrica", "gratuito" e "sutil" não são acentuados; "rubrica" e "gratuito" ainda têm tônica frequentemente pronunciada errada.',
    dificuldade: 3,
  },
  {
    id: "q-pt-13",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Em "Aspira-se a um cargo de chefia", o uso da preposição "a" após o verbo deve-se à',
    alternativas: [
      "regência do verbo aspirar no sentido de almejar.",
      "presença de sujeito preposicionado.",
      "indeterminação do sujeito, que exige preposição.",
      "ênclise obrigatória.",
      "formação de voz passiva analítica.",
    ],
    correta: 0,
    comentario:
      'No sentido de "almejar, desejar", o verbo "aspirar" é transitivo indireto e rege a preposição "a": aspirar A algo. (No sentido de "sorver o ar", é transitivo direto.)',
    dificuldade: 3,
  },
  {
    id: "q-pt-14",
    disciplina: "Língua Portuguesa",
    enunciado:
      'Considere o par: "Ele agiu de forma imprudente" / "Ele agiu de forma prudente".\n\nO prefixo "i(m)-" em "imprudente" expressa',
    alternativas: [
      "repetição",
      "negação ou privação",
      "movimento para dentro",
      "intensidade",
      "anterioridade",
    ],
    correta: 1,
    comentario:
      'O prefixo "in-" (que vira "im-" antes de p e b) indica negação: imprudente = não prudente, sem prudência.',
    dificuldade: 1,
  },
  // ------------------------------------------------------------------ Matemática
  {
    id: "q-mat-01",
    disciplina: "Matemática",
    enunciado:
      "Um tanque contém 12.000 litros de óleo. Uma bomba retira 450 litros por minuto. Após quanto tempo, em minutos, o tanque terá 3.000 litros?",
    alternativas: ["15", "18", "20", "24", "27"],
    correta: 2,
    comentario:
      "Precisa retirar 12.000 - 3.000 = 9.000 litros. A 450 L/min: 9.000 / 450 = 20 minutos.",
    dificuldade: 1,
  },
  {
    id: "q-mat-02",
    disciplina: "Matemática",
    enunciado:
      "Em uma equipe, 60% são técnicos e o restante, engenheiros. Se há 24 engenheiros, o total de pessoas na equipe é",
    alternativas: ["40", "48", "56", "60", "64"],
    correta: 3,
    comentario:
      "Engenheiros = 40% do total. 40% do total = 24, logo total = 24 / 0,4 = 60.",
    dificuldade: 2,
  },
  {
    id: "q-mat-03",
    disciplina: "Matemática",
    enunciado:
      "Três operadores fazem uma inspeção em 8 horas. Mantido o ritmo, quantas horas levarão 4 operadores para a mesma inspeção?",
    alternativas: ["4", "5", "6", "6,5", "10"],
    correta: 2,
    comentario:
      "Grandezas inversamente proporcionais: 3 x 8 = 4 x t, logo t = 24 / 4 = 6 horas.",
    dificuldade: 2,
  },
  {
    id: "q-mat-04",
    disciplina: "Matemática",
    enunciado:
      "Um equipamento custava R$ 2.000,00 e teve dois aumentos sucessivos de 10%. O preço final é",
    alternativas: ["R$ 2.200,00", "R$ 2.400,00", "R$ 2.420,00", "R$ 2.440,00", "R$ 2.640,00"],
    correta: 2,
    comentario:
      "Aumentos sucessivos multiplicam: 2.000 x 1,1 x 1,1 = 2.000 x 1,21 = R$ 2.420,00. Não é 20% direto (seria R$ 2.400).",
    dificuldade: 2,
  },
  {
    id: "q-mat-05",
    disciplina: "Matemática",
    enunciado:
      "A função f(x) = 3x - 12 representa o saldo (em milhares de reais) de um projeto após x meses. O projeto passa a ter saldo positivo a partir de qual mês?",
    alternativas: ["2º", "3º", "4º", "5º", "6º"],
    correta: 3,
    comentario:
      "3x - 12 > 0  =>  x > 4. O primeiro mês inteiro com saldo positivo é o 5º.",
    dificuldade: 2,
  },
  {
    id: "q-mat-06",
    disciplina: "Matemática",
    enunciado:
      "Uma bomba tem vazão de 1,5 m³/min. Quantos litros ela transfere em 40 minutos? (1 m³ = 1.000 L)",
    alternativas: ["6.000 L", "24.000 L", "40.000 L", "60.000 L", "600.000 L"],
    correta: 3,
    comentario:
      "1,5 m³/min x 40 min = 60 m³ = 60.000 litros.",
    dificuldade: 1,
  },
  {
    id: "q-mat-07",
    disciplina: "Matemática",
    enunciado:
      "Os números de ocorrências registradas em 5 meses foram: 4, 7, 5, 9 e 5. A mediana dessa série é",
    alternativas: ["4", "5", "6", "7", "9"],
    correta: 1,
    comentario:
      "Ordenando: 4, 5, 5, 7, 9. O valor central (3º de 5) é 5. A média seria 6, mas a pergunta é mediana.",
    dificuldade: 2,
  },
  {
    id: "q-mat-08",
    disciplina: "Matemática",
    enunciado:
      "Um mapa está na escala 1:50.000. Uma distância de 6 cm no mapa corresponde, no terreno, a",
    alternativas: ["300 m", "3 km", "30 km", "300 km", "3.000 m e 300 cm"],
    correta: 1,
    comentario:
      "6 cm x 50.000 = 300.000 cm = 3.000 m = 3 km.",
    dificuldade: 2,
  },
  {
    id: "q-mat-09",
    disciplina: "Matemática",
    enunciado:
      "Numa caixa há 5 peças boas e 3 defeituosas. Retirando-se uma peça ao acaso, a probabilidade de ela ser defeituosa é",
    alternativas: ["1/8", "3/8", "3/5", "5/8", "1/3"],
    correta: 1,
    comentario:
      "Total 8 peças, 3 defeituosas: P = 3/8.",
    dificuldade: 1,
  },
  {
    id: "q-mat-10",
    disciplina: "Matemática",
    enunciado:
      "Se 2/3 de um lote foram inspecionados e ainda restam 90 unidades, quantas unidades tem o lote?",
    alternativas: ["120", "180", "240", "270", "300"],
    correta: 3,
    comentario:
      "Restam 1/3 do lote = 90, logo o lote = 270.",
    dificuldade: 2,
  },
  {
    id: "q-mat-11",
    disciplina: "Matemática",
    enunciado:
      "Um reservatório cilíndrico tem base de área 3 m² e altura de água de 2,5 m. O volume de água armazenado é",
    alternativas: ["5,5 m³", "6 m³", "7,5 m³", "8 m³", "15 m³"],
    correta: 2,
    comentario:
      "Volume = área da base x altura = 3 x 2,5 = 7,5 m³.",
    dificuldade: 1,
  },
  {
    id: "q-mat-12",
    disciplina: "Matemática",
    enunciado:
      "A sequência 3, 7, 11, 15, ... é uma progressão aritmética. O 20º termo vale",
    alternativas: ["76", "79", "80", "83", "87"],
    correta: 1,
    comentario:
      "a1 = 3, razão r = 4. a20 = a1 + 19r = 3 + 19x4 = 3 + 76 = 79.",
    dificuldade: 2,
  },
  // ------------------------------------------------------------------ Inglês
  {
    id: "q-en-01",
    disciplina: "Língua Inglesa",
    enunciado:
      'Read the sentence: "Pipeline operators must monitor pressure continuously; otherwise, small leaks may go undetected for hours."\n\nThe word "otherwise" indicates',
    alternativas: [
      "an example of the previous idea.",
      "a consequence if the action is not taken.",
      "an addition of similar information.",
      "a conclusion that summarizes the text.",
      "a contrast with a past situation.",
    ],
    correta: 1,
    comentario:
      '"Otherwise" = "se não / caso contrário": apresenta o que aconteceria se a ação (monitorar a pressão) não fosse feita. É uma condição negativa com consequência.',
    dificuldade: 2,
  },
  {
    id: "q-en-02",
    disciplina: "Língua Inglesa",
    enunciado:
      'In "The maintenance team has already replaced the damaged valve", the verb tense is used to express',
    alternativas: [
      "a habit in the present.",
      "an action completed with relevance to the present.",
      "an action that will happen soon.",
      "an action in progress right now.",
      "a fact that was true only in the past.",
    ],
    correta: 1,
    comentario:
      'O present perfect ("has replaced") + "already" indica ação concluída cujo resultado importa agora: a válvula já está trocada.',
    dificuldade: 2,
  },
  {
    id: "q-en-03",
    disciplina: "Língua Inglesa",
    enunciado:
      'Read: "Although the terminal is highly automated, human supervision remains essential during loading operations."\n\nThe sentence states that human supervision is',
    alternativas: [
      "no longer necessary because of automation.",
      "still necessary despite the automation.",
      "required only when the system fails.",
      "less important than it used to be.",
      "the main cause of loading delays.",
    ],
    correta: 1,
    comentario:
      '"Although" introduz concessão: mesmo com a automação, a supervisão humana "remains essential" (continua essencial).',
    dificuldade: 2,
  },
  {
    id: "q-en-04",
    disciplina: "Língua Inglesa",
    enunciado:
      'The word "reliable", in "a reliable pump", is closest in meaning to',
    alternativas: ["expensive", "dependable", "portable", "outdated", "noisy"],
    correta: 1,
    comentario:
      '"Reliable" = confiável, que se pode depender; sinônimo de "dependable".',
    dificuldade: 1,
  },
  {
    id: "q-en-05",
    disciplina: "Língua Inglesa",
    enunciado:
      'Choose the option that correctly completes the sentence: "If the sensor ______ a fault, the system shuts down automatically."',
    alternativas: ["detect", "detects", "detected", "will detect", "has detect"],
    correta: 1,
    comentario:
      'First conditional: "If" + presente simples na condição (3ª pessoa: "detects") e presente/futuro no resultado.',
    dificuldade: 2,
  },
  {
    id: "q-en-06",
    disciplina: "Língua Inglesa",
    enunciado:
      'In "The report highlights the need for regular inspections", the word "highlights" means',
    alternativas: ["hides", "emphasizes", "delays", "questions", "replaces"],
    correta: 1,
    comentario:
      '"To highlight" = destacar, enfatizar. O relatório coloca em evidência a necessidade de inspeções.',
    dificuldade: 1,
  },
  {
    id: "q-en-07",
    disciplina: "Língua Inglesa",
    enunciado:
      'Read: "Crude oil is transported either by pipeline or by tanker, depending on distance and cost."\n\nAccording to the sentence, the choice of transport depends on',
    alternativas: [
      "the type of crude oil only.",
      "distance and cost.",
      "the weather conditions.",
      "the number of available workers.",
      "government regulations.",
    ],
    correta: 1,
    comentario:
      'A frase é explícita: "depending on distance and cost" - a distância e o custo determinam a escolha entre duto e navio.',
    dificuldade: 1,
  },
  {
    id: "q-en-08",
    disciplina: "Língua Inglesa",
    enunciado:
      'The prefix in the word "misalignment" (as in "shaft misalignment") conveys the idea of',
    alternativas: [
      "something done again",
      "something done wrongly or badly",
      "something done before",
      "something done together",
      "something done completely",
    ],
    correta: 1,
    comentario:
      'O prefixo "mis-" indica erro/algo feito de forma incorreta: "misalignment" = desalinhamento (alinhamento errado).',
    dificuldade: 2,
  },
  // -------------------------------------------------- Conhecimentos gerais / setor
  {
    id: "q-cg-01",
    disciplina: "Conhecimentos Gerais e Setor de Energia",
    enunciado:
      "A Transpetro é a subsidiária do Sistema Petrobras responsável, principalmente, por",
    alternativas: [
      "exploração e produção de petróleo em águas profundas.",
      "transporte e armazenamento de petróleo, derivados e gás natural.",
      "distribuição de combustíveis em postos de varejo.",
      "geração de energia eólica e solar.",
      "refino de petróleo e produção de lubrificantes.",
    ],
    correta: 1,
    comentario:
      "A Transpetro (Petrobras Transporte S.A.) opera dutos, terminais e navios: é a área de logística/transporte e estocagem do Sistema Petrobras.",
    dificuldade: 1,
  },
  {
    id: "q-cg-02",
    disciplina: "Conhecimentos Gerais e Setor de Energia",
    enunciado:
      "No setor de petróleo e gás natural no Brasil, a agência reguladora responsável por autorizar e fiscalizar as atividades da indústria é a",
    alternativas: ["ANEEL", "ANP", "ANATEL", "ANTT", "IBAMA"],
    correta: 1,
    comentario:
      "A ANP (Agência Nacional do Petróleo, Gás Natural e Biocombustíveis) regula e fiscaliza a indústria de petróleo e gás. A ANEEL cuida de energia elétrica; a ANTT, de transportes terrestres.",
    dificuldade: 1,
  },
  {
    id: "q-cg-03",
    disciplina: "Conhecimentos Gerais e Setor de Energia",
    enunciado:
      "A chamada 'transição energética' refere-se, de forma geral, ao processo de",
    alternativas: [
      "substituição gradual de fontes fósseis por fontes de menor emissão de carbono.",
      "privatização das empresas estatais de energia.",
      "unificação das tarifas de energia em todo o país.",
      "fim imediato do uso de petróleo em todos os setores.",
      "transferência da matriz elétrica para usinas a carvão.",
    ],
    correta: 0,
    comentario:
      "Transição energética é a mudança progressiva da matriz para fontes mais limpas (renováveis, gás natural como ponte, biocombustíveis, hidrogênio), reduzindo as emissões - sem significar o fim abrupto dos fósseis.",
    dificuldade: 2,
  },
  {
    id: "q-cg-04",
    disciplina: "Conhecimentos Gerais e Setor de Energia",
    enunciado:
      "Entre as opções, o produto que NÃO é um derivado obtido no refino do petróleo é o",
    alternativas: ["diesel", "querosene de aviação", "gasolina", "etanol de cana", "gás liquefeito de petróleo (GLP)"],
    correta: 3,
    comentario:
      "O etanol de cana é um biocombustível produzido a partir da biomassa, não do refino do petróleo. Diesel, QAV, gasolina e GLP são frações do refino.",
    dificuldade: 2,
  },
  // -------------------------------------------------- SMS / segurança
  {
    id: "q-sms-01",
    disciplina: "Segurança, Meio Ambiente e Saúde",
    enunciado:
      "A Norma Regulamentadora que trata especificamente de segurança e saúde no trabalho em espaços confinados é a",
    alternativas: ["NR-10", "NR-12", "NR-33", "NR-35", "NR-06"],
    correta: 2,
    comentario:
      "A NR-33 trata de espaços confinados. A NR-10 é eletricidade; NR-12, máquinas; NR-35, trabalho em altura; NR-06, EPI.",
    dificuldade: 2,
  },
  {
    id: "q-sms-02",
    disciplina: "Segurança, Meio Ambiente e Saúde",
    enunciado:
      "A Análise Preliminar de Risco (APR) tem como principal objetivo",
    alternativas: [
      "registrar acidentes já ocorridos para fins estatísticos.",
      "identificar perigos e avaliar riscos de uma tarefa antes de sua execução.",
      "substituir a emissão da Permissão de Trabalho.",
      "definir o valor do adicional de periculosidade.",
      "treinar a brigada de incêndio da unidade.",
    ],
    correta: 1,
    comentario:
      "A APR é uma ferramenta preventiva: antes de iniciar a atividade, levanta os perigos, avalia os riscos e define medidas de controle. Não substitui a Permissão de Trabalho, e sim a subsidia.",
    dificuldade: 2,
  },
  {
    id: "q-sms-03",
    disciplina: "Segurança, Meio Ambiente e Saúde",
    enunciado:
      "Na hierarquia de controle de riscos ocupacionais, a medida considerada MAIS eficaz é",
    alternativas: [
      "o fornecimento de EPI aos trabalhadores.",
      "a sinalização de advertência na área.",
      "a eliminação do perigo na fonte.",
      "o rodízio de trabalhadores expostos.",
      "o treinamento periódico das equipes.",
    ],
    correta: 2,
    comentario:
      "A hierarquia de controle prioriza, nesta ordem: eliminação, substituição, controles de engenharia, controles administrativos e, por último, EPI. Eliminar o perigo é a medida mais eficaz.",
    dificuldade: 2,
  },
];

interface SimuladoSeed {
  slug: string;
  titulo: string;
  descricao: string;
  disciplina?: string;
  duracaoMin: number;
  gratuito: boolean;
  questoes: string[];
}

const simulados: SimuladoSeed[] = [
  {
    slug: "diagnostico",
    titulo: "Simulado Diagnóstico",
    descricao:
      "20 questões de todas as disciplinas para medir seu ponto de partida. Aberto sem login e sem custo.",
    duracaoMin: 60,
    gratuito: true,
    questoes: [
      "q-pt-01", "q-pt-03", "q-pt-06", "q-pt-08", "q-pt-11", "q-pt-14",
      "q-mat-01", "q-mat-02", "q-mat-04", "q-mat-07", "q-mat-10", "q-mat-12",
      "q-en-01", "q-en-03", "q-en-05", "q-en-07",
      "q-cg-01", "q-cg-03",
      "q-sms-01", "q-sms-02",
    ],
  },
  {
    slug: "portugues",
    titulo: "Língua Portuguesa - completo",
    descricao:
      "14 questões de interpretação, coesão, crase, concordância e regência no estilo da banca.",
    disciplina: "Língua Portuguesa",
    duracaoMin: 45,
    gratuito: false,
    questoes: [
      "q-pt-01", "q-pt-02", "q-pt-03", "q-pt-04", "q-pt-05", "q-pt-06", "q-pt-07",
      "q-pt-08", "q-pt-09", "q-pt-10", "q-pt-11", "q-pt-12", "q-pt-13", "q-pt-14",
    ],
  },
  {
    slug: "matematica",
    titulo: "Matemática - completo",
    descricao:
      "12 questões de porcentagem, regra de três, funções, estatística e progressões aplicadas.",
    disciplina: "Matemática",
    duracaoMin: 50,
    gratuito: false,
    questoes: [
      "q-mat-01", "q-mat-02", "q-mat-03", "q-mat-04", "q-mat-05", "q-mat-06",
      "q-mat-07", "q-mat-08", "q-mat-09", "q-mat-10", "q-mat-11", "q-mat-12",
    ],
  },
  {
    slug: "ingles",
    titulo: "Língua Inglesa - leitura instrumental",
    descricao:
      "8 questões de compreensão de textos técnicos, vocabulário em contexto e conectivos.",
    disciplina: "Língua Inglesa",
    duracaoMin: 30,
    gratuito: false,
    questoes: [
      "q-en-01", "q-en-02", "q-en-03", "q-en-04",
      "q-en-05", "q-en-06", "q-en-07", "q-en-08",
    ],
  },
  {
    slug: "conhecimentos-gerais",
    titulo: "Setor de Energia e SMS",
    descricao:
      "7 questões sobre o Sistema Petrobras, regulação do setor, derivados e segurança do trabalho.",
    disciplina: "Conhecimentos Gerais e Setor de Energia",
    duracaoMin: 25,
    gratuito: false,
    questoes: [
      "q-cg-01", "q-cg-02", "q-cg-03", "q-cg-04",
      "q-sms-01", "q-sms-02", "q-sms-03",
    ],
  },
];

async function main() {
  for (const q of questoes) {
    const dados = {
      disciplina: q.disciplina,
      banca: "Cesgranrio",
      enunciado: q.enunciado,
      alternativas: q.alternativas,
      correta: q.correta,
      comentario: q.comentario,
      dificuldade: q.dificuldade ?? 3,
    };
    await prisma.questao.upsert({
      where: { id: q.id },
      create: { id: q.id, ...dados },
      update: dados,
    });
  }
  console.log(`Questões: ${questoes.length} sincronizadas.`);

  for (const s of simulados) {
    const sim = await prisma.simulado.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        titulo: s.titulo,
        descricao: s.descricao,
        disciplina: s.disciplina,
        duracaoMin: s.duracaoMin,
        gratuito: s.gratuito,
      },
      update: {
        titulo: s.titulo,
        descricao: s.descricao,
        disciplina: s.disciplina,
        duracaoMin: s.duracaoMin,
        gratuito: s.gratuito,
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
  }
  console.log(`Simulados: ${simulados.length} sincronizados.`);

  await seedConcursos(prisma);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
