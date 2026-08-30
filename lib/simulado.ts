import "server-only";
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
