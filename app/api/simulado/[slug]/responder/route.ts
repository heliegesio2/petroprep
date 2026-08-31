import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

export const runtime = "nodejs";

interface Payload {
  tentativaId?: unknown;
  questaoId?: unknown;
  marcada?: unknown;
}

/**
 * Corrige uma questão no ato (estilo Duolingo): grava a resposta e devolve o
 * gabarito + comentário só depois que a pessoa respondeu aquela questão.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase) {
    return NextResponse.json({ message: "Banco indisponível." }, { status: 503 });
  }

  const { slug } = await params;

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const tentativaId = typeof body.tentativaId === "string" ? body.tentativaId : "";
  const questaoId = typeof body.questaoId === "string" ? body.questaoId : "";
  const marcada = Number.isInteger(body.marcada) ? (body.marcada as number) : -1;

  if (!tentativaId || !questaoId) {
    return NextResponse.json({ message: "Dados incompletos." }, { status: 422 });
  }

  const tentativa = await prisma.tentativa.findUnique({
    where: { id: tentativaId },
    include: { simulado: { select: { slug: true } } },
  });

  if (!tentativa || tentativa.simulado.slug !== slug) {
    return NextResponse.json({ message: "Tentativa não encontrada." }, { status: 404 });
  }

  if (tentativa.usuarioId !== null) {
    const usuario = await usuarioAtual();
    if (!usuario || usuario.id !== tentativa.usuarioId) {
      return NextResponse.json({ message: "Sem permissão." }, { status: 403 });
    }
  }

  if (tentativa.finalizadoEm) {
    return NextResponse.json({ message: "Simulado já finalizado." }, { status: 409 });
  }

  const vinculo = await prisma.simuladoQuestao.findFirst({
    where: { simuladoId: tentativa.simuladoId, questaoId },
    include: { questao: true },
  });
  if (!vinculo) {
    return NextResponse.json({ message: "Questão não pertence ao simulado." }, { status: 404 });
  }

  const q = vinculo.questao;
  const acertou = marcada === q.correta;

  await prisma.$transaction([
    prisma.respostaSimulado.deleteMany({ where: { tentativaId, questaoId } }),
    prisma.respostaSimulado.create({
      data: { tentativaId, questaoId, marcada, correta: acertou },
    }),
  ]);

  return NextResponse.json({
    correta: acertou,
    gabarito: q.correta,
    comentario: q.comentario,
  });
}
