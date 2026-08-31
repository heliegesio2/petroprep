import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { planoAtivo } from "@/lib/auth";

export interface QuestaoView {
  id: string;
  ordem: number;
  disciplina: string;
  enunciado: string;
  alternativas: string[];
}

export interface SimuladoView {
  id: string;
  slug: string;
  titulo: string;
  descricao: string | null;
  disciplina: string | null;
  duracaoMin: number;
  gratuito: boolean;
  questoes: QuestaoView[];
}

/** Carrega um simulado com as questões na ordem, sem revelar o gabarito. */
export async function carregarSimulado(slug: string): Promise<SimuladoView | null> {
  const simulado = await prisma.simulado.findUnique({
    where: { slug },
    include: {
      questoes: {
        orderBy: { ordem: "asc" },
        include: { questao: true },
      },
    },
  });
  if (!simulado) return null;

  return {
    id: simulado.id,
    slug: simulado.slug,
    titulo: simulado.titulo,
    descricao: simulado.descricao,
    disciplina: simulado.disciplina,
    duracaoMin: simulado.duracaoMin,
    gratuito: simulado.gratuito,
    questoes: simulado.questoes.map((sq) => ({
      id: sq.questao.id,
      ordem: sq.ordem,
      disciplina: sq.questao.disciplina,
      enunciado: sq.questao.enunciado,
      alternativas: sq.questao.alternativas as string[],
    })),
  };
}

type UsuarioPlano = { planoStatus: string; planoAte: Date | null } | null;

/** Regras de acesso: o "Diagnóstico" (gratuito) abre para qualquer um. */
export function podeAcessar(
  simulado: { gratuito: boolean },
  usuario: UsuarioPlano,
): boolean {
  return simulado.gratuito || planoAtivo(usuario);
}

// ---------------------------------------------------------------------------
// Pacote offline (Fase 2) - inclui o gabarito; a rota gate por plano ativo.
// ---------------------------------------------------------------------------

export interface PacoteQuestao {
  id: string;
  ordem: number;
  disciplina: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  comentario: string | null;
}

export interface PacoteSimulado {
  slug: string;
  simuladoId: string;
  titulo: string;
  descricao: string | null;
  duracaoMin: number;
  gratuito: boolean;
  /** Muda quando alguma questão do simulado muda. */
  versao: string;
  questoes: PacoteQuestao[];
}

export function versaoDeQuestoes(
  qs: { id: string; correta: number; enunciado: string }[],
): string {
  const base = qs
    .map((q) => `${q.id}:${q.correta}:${q.enunciado.length}`)
    .join("|");
  return createHash("sha1").update(base).digest("hex").slice(0, 12);
}

/** Simulado completo COM gabarito e comentários, para guardar no dispositivo. */
export async function carregarPacote(slug: string): Promise<PacoteSimulado | null> {
  const s = await prisma.simulado.findUnique({
    where: { slug },
    include: {
      questoes: { orderBy: { ordem: "asc" }, include: { questao: true } },
    },
  });
  if (!s) return null;

  const questoes: PacoteQuestao[] = s.questoes.map((sq) => ({
    id: sq.questao.id,
    ordem: sq.ordem,
    disciplina: sq.questao.disciplina,
    enunciado: sq.questao.enunciado,
    alternativas: sq.questao.alternativas as string[],
    correta: sq.questao.correta,
    comentario: sq.questao.comentario,
  }));

  return {
    slug: s.slug,
    simuladoId: s.id,
    titulo: s.titulo,
    descricao: s.descricao,
    duracaoMin: s.duracaoMin,
    gratuito: s.gratuito,
    versao: versaoDeQuestoes(questoes),
    questoes,
  };
}
