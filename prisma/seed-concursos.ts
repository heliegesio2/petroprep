import { readFileSync } from "node:fs";
import type { PrismaClient } from "@prisma/client";
import { seedTestesSesTo } from "./seed-ses-to-testes";

/**
 * Seed dos guias de concurso (dados profundos por edital). Idempotente.
 * Fonte: prisma/dados/<slug>/. O conteúdo de estudo cobre só um piloto
 * (matérias superior + cargo Assistente Social); os demais itens entram sem
 * resumo (a rota mostra "em preparação").
 */

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Regra dura do projeto: nada de em-dash / en-dash em texto visível. */
function limpar(s: string | null | undefined): string | null {
  if (s == null) return null;
  return s.replace(/\s*[—–]\s*/g, " - ").replace(/\s+/g, " ").trim();
}

function moeda(s: string | undefined): number | null {
  if (!s) return null;
  const n = Number(s.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function ler<T>(caminho: string): T {
  return JSON.parse(readFileSync(caminho, "utf-8")) as T;
}

interface EnrichedCargo {
  nome: string;
  slug: string;
  area: string;
  nivel: string;
  carga_horaria?: string;
  salario_basico?: string;
  vagas: { imediatas: number; cadastro_reserva: number; total: number };
  localidades: { cidade: string; vagas: number }[];
  requisito_investidura?: string;
  conteudo_especifico?: { texto_bruto?: string; itens?: string[] };
  materias_modulo1?: { nome: string; slug: string }[];
}

interface Enriched {
  edital: {
    nome: string;
    orgao: string;
    banca?: string;
    fonte_oficial?: string;
    total_vagas_oficial?: number;
    data_prova?: string;
  };
  materias_modulo1: {
    medio: { nome: string; slug: string }[];
    superior: { nome: string; slug: string }[];
  };
  cargos: Record<string, EnrichedCargo>;
}

interface StudyItem {
  item: string;
  resumo?: string;
  pontos?: string[];
  dica?: string;
}
interface Study {
  materias: Record<string, StudyItem[]>;
  cargos: Record<string, StudyItem[]>;
}

/** "1. A; 2. B; 3. C" ou "1. A. 2. B." -> ["A", "B", "C"] */
function itensDeLista(texto: string): string[] {
  return texto
    .split(/\s*\d+\.\s+/)
    .map((s) => s.replace(/[;.]\s*$/, "").trim())
    .filter((s) => s.length > 2);
}

async function seedSesTo(prisma: PrismaClient) {
  const base = "prisma/dados/ses-to-2026";
  const enr = ler<Enriched>(`${base}/cargos_enriched.json`);
  const study = ler<Study>(`${base}/study_content.json`);
  const mod1 = ler<Record<"medio" | "superior", Record<string, string>>>(
    `${base}/modulo1_gerais.json`,
  );

  const concurso = await prisma.concurso.upsert({
    where: { slug: "ses-to-2026" },
    update: {
      nome: "Concurso Saúde Tocantins 2026",
      orgao: enr.edital.orgao,
      banca: enr.edital.banca ?? "FGV",
      categoria: "saude",
      status: "inscricoes_abertas",
      fonteOficial: enr.edital.fonte_oficial,
      vagasOficial: enr.edital.total_vagas_oficial ?? null,
      dataProva: enr.edital.data_prova ? new Date(enr.edital.data_prova) : null,
      resumo:
        "Maior concurso de saúde aberto: 5.124 vagas para todos os níveis em unidades de saúde do Tocantins. Banca FGV.",
    },
    create: {
      slug: "ses-to-2026",
      nome: "Concurso Saúde Tocantins 2026",
      orgao: enr.edital.orgao,
      banca: enr.edital.banca ?? "FGV",
      categoria: "saude",
      status: "inscricoes_abertas",
      publicado: true,
      fonteOficial: enr.edital.fonte_oficial,
      vagasOficial: enr.edital.total_vagas_oficial ?? null,
      dataProva: enr.edital.data_prova ? new Date(enr.edital.data_prova) : null,
      resumo:
        "Maior concurso de saúde aberto: 5.124 vagas para todos os níveis em unidades de saúde do Tocantins. Banca FGV.",
    },
  });

  // --- Matérias do Módulo I ------------------------------------------------
  const materiaId = new Map<string, string>();
  for (const nivel of ["medio", "superior"] as const) {
    for (const m of enr.materias_modulo1[nivel]) {
      const mat = await prisma.materiaConcurso.upsert({
        where: { concursoId_slug: { concursoId: concurso.id, slug: m.slug } },
        update: { nome: m.nome, nivel },
        create: { concursoId: concurso.id, slug: m.slug, nome: m.nome, nivel },
      });
      materiaId.set(m.slug, mat.id);
    }
  }

  // --- Itens de estudo das matérias --------------------------------------
  let itensCriados = 0;
  for (const nivel of ["medio", "superior"] as const) {
    for (const m of enr.materias_modulo1[nivel]) {
      const doStudy = study.materias[m.slug] ?? [];
      // superior: usa o piloto curado; medio: só títulos do modulo1_gerais.
      const titulos =
        doStudy.length > 0
          ? doStudy.map((s) => s.item)
          : itensDeLista(mod1[nivel]?.[m.nome] ?? "");

      for (let i = 0; i < titulos.length; i++) {
        const titulo = limpar(titulos[i]) ?? titulos[i];
        const conteudo = doStudy.find((s) => (limpar(s.item) ?? s.item) === titulo);
        const slug = slugify(titulo) || `item-${i + 1}`;
        await prisma.itemEstudo.upsert({
          where: { chave: `${concurso.id}:mat:${m.slug}:${slug}` },
          update: {
            titulo,
            ordem: i + 1,
            resumo: limpar(conteudo?.resumo),
            pontos: (conteudo?.pontos ?? []).map((x) => limpar(x) ?? x),
            dica: limpar(conteudo?.dica),
          },
          create: {
            chave: `${concurso.id}:mat:${m.slug}:${slug}`,
            concursoId: concurso.id,
            materiaId: materiaId.get(m.slug)!,
            ordem: i + 1,
            slug,
            titulo,
            resumo: limpar(conteudo?.resumo),
            pontos: (conteudo?.pontos ?? []).map((x) => limpar(x) ?? x),
            dica: limpar(conteudo?.dica),
          },
        });
        itensCriados += 1;
      }
    }
  }

  // --- Cargos + conteúdo específico (Módulo II) --------------------------
  for (const cg of Object.values(enr.cargos)) {
    const nivel = /superior/i.test(cg.nivel) ? "Superior" : "Médio/Técnico";
    await prisma.cargoConcurso.upsert({
      where: { concursoId_slug: { concursoId: concurso.id, slug: cg.slug } },
      update: {
        nome: cg.nome,
        area: cg.area,
        nivel,
        cargaHoraria: cg.carga_horaria ?? null,
        salario: moeda(cg.salario_basico),
        requisito: limpar(cg.requisito_investidura),
        conteudoItens: (cg.conteudo_especifico?.itens ?? []).map((x) => limpar(x) ?? x),
        vagasImediatas: cg.vagas.imediatas,
        vagasReserva: cg.vagas.cadastro_reserva,
        localidades: cg.localidades,
        materiasSlugs: (cg.materias_modulo1 ?? []).map((m) => m.slug),
      },
      create: {
        concursoId: concurso.id,
        slug: cg.slug,
        nome: cg.nome,
        area: cg.area,
        nivel,
        cargaHoraria: cg.carga_horaria ?? null,
        salario: moeda(cg.salario_basico),
        requisito: limpar(cg.requisito_investidura),
        conteudoItens: (cg.conteudo_especifico?.itens ?? []).map((x) => limpar(x) ?? x),
        vagasImediatas: cg.vagas.imediatas,
        vagasReserva: cg.vagas.cadastro_reserva,
        localidades: cg.localidades,
        materiasSlugs: (cg.materias_modulo1 ?? []).map((m) => m.slug),
      },
    });

    const doStudy = study.cargos[cg.slug] ?? [];
    const itens = cg.conteudo_especifico?.itens ?? [];
    for (let i = 0; i < itens.length; i++) {
      const titulo = limpar(itens[i]) ?? itens[i];
      const conteudo = doStudy.find((s) => (limpar(s.item) ?? s.item) === titulo);
      const slug = slugify(titulo) || `item-${i + 1}`;
      await prisma.itemEstudo.upsert({
        where: { chave: `${concurso.id}:cargo:${cg.slug}:${slug}` },
        update: {
          titulo: limpar(titulo) ?? titulo,
          ordem: i + 1,
          resumo: limpar(conteudo?.resumo),
          pontos: (conteudo?.pontos ?? []).map((x) => limpar(x) ?? x),
          dica: limpar(conteudo?.dica),
        },
        create: {
          chave: `${concurso.id}:cargo:${cg.slug}:${slug}`,
          concursoId: concurso.id,
          cargoSlug: cg.slug,
          ordem: i + 1,
          slug,
          titulo,
          resumo: limpar(conteudo?.resumo),
          pontos: (conteudo?.pontos ?? []).map((x) => limpar(x) ?? x),
          dica: limpar(conteudo?.dica),
        },
      });
      itensCriados += 1;
    }
  }

  // Faixa salarial a partir dos cargos.
  const salarios = Object.values(enr.cargos)
    .map((c) => moeda(c.salario_basico))
    .filter((n): n is number => n !== null);
  if (salarios.length > 0) {
    await prisma.concurso.update({
      where: { id: concurso.id },
      data: {
        salarioDe: Math.min(...salarios),
        salarioAte: Math.max(...salarios),
      },
    });
  }

  await seedTestesSesTo(prisma, concurso.id);

  console.log(
    `Concurso ${concurso.slug}: ${Object.keys(enr.cargos).length} cargos, ${itensCriados} itens de estudo.`,
  );
}

interface CargoTranspetro {
  slug: string;
  nome: string;
  edital: string;
  edital_label: string;
  nivel: string;
  salario_basico: string | null;
  vagas_imediatas: number;
  vagas_reserva: number;
}

interface CargoDetalhe {
  slug: string;
  requisito: string | null;
  finalidade: string | null;
  remuneracao: string | null;
  atribuicoes: string | null;
  conteudo_especifico: string[];
}

interface TopicoTranspetro {
  slug_file: string;
  edital: string;
  materia: string;
  titulo: string;
  oficial: string | null;
  oque: string | null;
  como: string | null;
  exemplos: string[];
}

/** Concurso Transpetro: metadados + os 61 cargos (extraídos de site/index.html). */
async function seedTranspetro(prisma: PrismaClient) {
  const cargos = ler<CargoTranspetro[]>(
    "prisma/dados/transpetro-2026/cargos.json",
  );
  const imed = cargos.reduce((s, c) => s + c.vagas_imediatas, 0);
  const cr = cargos.reduce((s, c) => s + c.vagas_reserva, 0);
  const sal = cargos
    .map((c) => moeda(c.salario_basico ?? undefined))
    .filter((n): n is number => n !== null);

  const c = await prisma.concurso.upsert({
    where: { slug: "transpetro-2026" },
    update: {
      vagasOficial: imed + cr,
      salarioDe: sal.length ? Math.min(...sal) : null,
      salarioAte: sal.length ? Math.max(...sal) : null,
      resumo:
        "Processo seletivo da Transpetro (banca Cesgranrio), 4 editais - Praças, Oficiais, Nível Médio e Nível Superior. Guia com todas as vagas, salário, requisitos e conteúdo programático.",
    },
    create: {
      slug: "transpetro-2026",
      nome: "Concurso Transpetro 2026",
      orgao: "Petrobras Transporte S.A. (Transpetro)",
      banca: "Cesgranrio",
      categoria: "petroleo",
      status: "inscricoes_abertas",
      publicado: true,
      destaque: true,
      ordem: -1,
      dataProva: new Date("2026-11-29"),
      inscricoesAte: new Date("2026-09-14"),
      fonteOficial: "https://www.cesgranrio.org.br",
    },
  });

  await prisma.simulado.updateMany({
    where: { concursoId: null },
    data: { concursoId: c.id },
  });

  const detalhe = new Map(
    ler<CargoDetalhe[]>("prisma/dados/transpetro-2026/cargos-detalhe.json").map(
      (d) => [d.slug, d] as const,
    ),
  );
  const topicos = ler<TopicoTranspetro[]>(
    "prisma/dados/transpetro-2026/topicos.json",
  );

  // --- Matérias do Módulo I (das páginas de tópico) ----------------------
  const materiasNomes = [
    ...new Set(
      topicos
        .map((t) => limpar(t.materia) ?? t.materia)
        .filter((m) => m && !/específic/i.test(m)),
    ),
  ];
  const SIMULADO_POR_MATERIA: Record<string, string> = {
    "Língua Portuguesa": "portugues",
    Matemática: "matematica",
  };
  const materiaId = new Map<string, string>();
  for (const nome of materiasNomes) {
    const slug = slugify(nome);
    const mat = await prisma.materiaConcurso.upsert({
      where: { concursoId_slug: { concursoId: c.id, slug } },
      update: { nome, simuladoSlug: SIMULADO_POR_MATERIA[nome] ?? null },
      create: {
        concursoId: c.id,
        slug,
        nome,
        nivel: "geral",
        simuladoSlug: SIMULADO_POR_MATERIA[nome] ?? null,
      },
    });
    materiaId.set(nome, mat.id);
  }

  // --- Itens de estudo das matérias (tópicos com conteúdo) --------------
  const conteudoPorTitulo = new Map<string, TopicoTranspetro>();
  let ordemMat = 0;
  for (const t of topicos) {
    const nomeMateria = limpar(t.materia) ?? t.materia;
    const mid = materiaId.get(nomeMateria);
    if (!mid) continue; // tópico de conteúdo específico
    const titulo = limpar(t.titulo) ?? t.titulo;
    const slug = slugify(titulo);
    conteudoPorTitulo.set(titulo.toLowerCase(), t);
    ordemMat += 1;
    await prisma.itemEstudo.upsert({
      where: { chave: `${c.id}:mat:${slugify(nomeMateria)}:${slug}` },
      update: {
        titulo,
        ordem: ordemMat,
        resumo: limpar(t.oque),
        comoFunciona: limpar(t.como),
        textoOficial: limpar(t.oficial),
        exemplos: (t.exemplos ?? []).map((x) => limpar(x) ?? x),
      },
      create: {
        chave: `${c.id}:mat:${slugify(nomeMateria)}:${slug}`,
        concursoId: c.id,
        materiaId: mid,
        ordem: ordemMat,
        slug,
        titulo,
        resumo: limpar(t.oque),
        comoFunciona: limpar(t.como),
        textoOficial: limpar(t.oficial),
        exemplos: (t.exemplos ?? []).map((x) => limpar(x) ?? x),
      },
    });
  }

  // --- Cargos (metadados + detalhe + conteúdo específico) --------------
  for (const cg of cargos) {
    const d = detalhe.get(cg.slug);
    const especItens = (d?.conteudo_especifico ?? []).flatMap((bloco) =>
      itensDeLista(bloco).map((x) => limpar(x) ?? x),
    );
    const dados = {
      nome: limpar(cg.nome) ?? cg.nome,
      area: limpar(cg.edital_label) ?? cg.edital_label,
      nivel: limpar(cg.nivel) ?? cg.nivel,
      salario: moeda(cg.salario_basico ?? undefined),
      vagasImediatas: cg.vagas_imediatas,
      vagasReserva: cg.vagas_reserva,
      requisito: limpar(d?.requisito),
      finalidade: limpar(d?.finalidade),
      atribuicoes: limpar(d?.atribuicoes),
      remuneracao: limpar(d?.remuneracao),
      conteudoItens: especItens,
      materiasSlugs: materiasNomes.map((m) => slugify(m)),
    };
    await prisma.cargoConcurso.upsert({
      where: { concursoId_slug: { concursoId: c.id, slug: cg.slug } },
      update: dados,
      create: { concursoId: c.id, slug: cg.slug, localidades: [], ...dados },
    });

    for (let i = 0; i < especItens.length; i++) {
      const titulo = especItens[i];
      const slug = slugify(titulo) || `item-${i + 1}`;
      const t = conteudoPorTitulo.get(titulo.toLowerCase());
      await prisma.itemEstudo.upsert({
        where: { chave: `${c.id}:cargo:${cg.slug}:${slug}` },
        update: {
          titulo,
          ordem: i + 1,
          resumo: limpar(t?.oque),
          comoFunciona: limpar(t?.como),
          textoOficial: limpar(t?.oficial),
          exemplos: (t?.exemplos ?? []).map((x) => limpar(x) ?? x),
        },
        create: {
          chave: `${c.id}:cargo:${cg.slug}:${slug}`,
          concursoId: c.id,
          cargoSlug: cg.slug,
          ordem: i + 1,
          slug,
          titulo,
          resumo: limpar(t?.oque),
          comoFunciona: limpar(t?.como),
          textoOficial: limpar(t?.oficial),
          exemplos: (t?.exemplos ?? []).map((x) => limpar(x) ?? x),
        },
      });
    }
  }
  console.log(
    `Concurso ${c.slug}: ${cargos.length} cargos, ${topicos.length} tópicos.`,
  );
}

export async function seedConcursos(prisma: PrismaClient) {
  await seedTranspetro(prisma);
  await seedSesTo(prisma);
}
