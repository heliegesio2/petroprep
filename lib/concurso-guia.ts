import "server-only";
import { prisma } from "@/lib/prisma";

export async function carregarConcursoGuia(slug: string) {
  return prisma.concurso.findFirst({ where: { slug, publicado: true } });
}

export async function listarCargosDoConcurso(concursoId: string) {
  return prisma.cargoConcurso.findMany({
    where: { concursoId },
    orderBy: [{ nome: "asc" }],
    select: {
      slug: true,
      nome: true,
      area: true,
      nivel: true,
      cargaHoraria: true,
      salario: true,
      vagasImediatas: true,
      vagasReserva: true,
      localidades: true,
      materiasSlugs: true,
    },
  });
}

export async function carregarCargoDoConcurso(concursoId: string, cargoSlug: string) {
  const cargo = await prisma.cargoConcurso.findUnique({
    where: { concursoId_slug: { concursoId, slug: cargoSlug } },
  });
  if (!cargo) return null;

  const [materias, itensCargo] = await Promise.all([
    prisma.materiaConcurso.findMany({
      where: { concursoId, slug: { in: cargo.materiasSlugs } },
      orderBy: { nome: "asc" },
    }),
    prisma.itemEstudo.findMany({
      where: { concursoId, cargoSlug },
      orderBy: { ordem: "asc" },
      select: { slug: true, titulo: true, resumo: true },
    }),
  ]);

  return { cargo, materias, itensCargo };
}

export async function carregarMateriaDoConcurso(
  concursoId: string,
  materiaSlug: string,
) {
  return prisma.materiaConcurso.findUnique({
    where: { concursoId_slug: { concursoId, slug: materiaSlug } },
    include: {
      itens: {
        orderBy: { ordem: "asc" },
        select: { slug: true, titulo: true, resumo: true },
      },
    },
  });
}

export function itemMateriaChave(
  concursoId: string,
  materiaSlug: string,
  itemSlug: string,
) {
  return `${concursoId}:mat:${materiaSlug}:${itemSlug}`;
}

export function itemCargoChave(
  concursoId: string,
  cargoSlug: string,
  itemSlug: string,
) {
  return `${concursoId}:cargo:${cargoSlug}:${itemSlug}`;
}

export async function carregarItemEstudo(chave: string) {
  return prisma.itemEstudo.findUnique({ where: { chave } });
}

/** Matérias do concurso agrupadas por nível, com contagem de itens. */
export async function listarMateriasDoConcurso(concursoId: string) {
  const materias = await prisma.materiaConcurso.findMany({
    where: { concursoId },
    orderBy: [{ nivel: "asc" }, { nome: "asc" }],
    include: {
      _count: { select: { itens: true } },
      itens: { where: { resumo: { not: null } }, select: { id: true } },
    },
  });
  return materias.map((m) => ({
    slug: m.slug,
    nome: m.nome,
    nivel: m.nivel,
    simuladoSlug: m.simuladoSlug,
    total: m._count.itens,
    comConteudo: m.itens.length,
  }));
}
