import "server-only";
import { prisma } from "@/lib/prisma";
import { concursoDestaque } from "@/lib/concursos";

/**
 * Ranking do concurso: pontos = acertos da MELHOR tentativa de cada simulado
 * (refazer para estudar não infla). Hoje todos os simulados são da Transpetro,
 * então o ranking é do concurso em destaque. Sem peso por disciplina - quando o
 * edital der pesos, a soma passa a considerar `pesosDisciplina` do concurso.
 */

export interface EntradaRanking {
  usuarioId: string;
  nome: string;
  pontos: number;
  simulados: number;
}

export interface RankingResultado {
  concurso: string;
  entradas: EntradaRanking[];
  total: number;
}

export interface PosicaoUsuario {
  concurso: string;
  posicao: number | null;
  total: number;
  pontos: number;
}

/** "Heliegesio Soares" -> "Heliegesio S." */
export function nomeCurto(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "Anônimo";
  if (partes.length === 1) return partes[0];
  const inicial = partes[partes.length - 1][0]?.toUpperCase() ?? "";
  return `${partes[0]} ${inicial}.`;
}

async function agregar(): Promise<EntradaRanking[]> {
  const tentativas = await prisma.tentativa.findMany({
    where: { finalizadoEm: { not: null }, usuarioId: { not: null } },
    select: {
      usuarioId: true,
      simuladoId: true,
      usuario: { select: { nome: true } },
      _count: { select: { respostas: { where: { correta: true } } } },
    },
  });

  // melhor tentativa (mais acertos) por usuário + simulado
  const melhor = new Map<string, { pontos: number; nome: string }>();
  for (const t of tentativas) {
    if (!t.usuarioId) continue;
    const chave = `${t.usuarioId}::${t.simuladoId}`;
    const pontos = t._count.respostas;
    const atual = melhor.get(chave);
    if (!atual || pontos > atual.pontos) {
      melhor.set(chave, { pontos, nome: t.usuario?.nome ?? "Anônimo" });
    }
  }

  const porUsuario = new Map<string, EntradaRanking>();
  for (const [chave, v] of melhor) {
    const usuarioId = chave.split("::")[0];
    const e =
      porUsuario.get(usuarioId) ??
      ({ usuarioId, nome: nomeCurto(v.nome), pontos: 0, simulados: 0 } as EntradaRanking);
    e.pontos += v.pontos;
    e.simulados += 1;
    porUsuario.set(usuarioId, e);
  }

  return [...porUsuario.values()].sort(
    (a, b) =>
      b.pontos - a.pontos ||
      b.simulados - a.simulados ||
      a.nome.localeCompare(b.nome),
  );
}

export async function rankingConcurso(): Promise<RankingResultado> {
  const entradas = await agregar();
  return { concurso: concursoDestaque.nome, entradas, total: entradas.length };
}

export async function posicaoDoUsuario(usuarioId: string): Promise<PosicaoUsuario> {
  const { entradas, total } = await rankingConcurso();
  const i = entradas.findIndex((e) => e.usuarioId === usuarioId);
  return {
    concurso: concursoDestaque.nome,
    posicao: i === -1 ? null : i + 1,
    total,
    pontos: i === -1 ? 0 : entradas[i].pontos,
  };
}
