import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";

export const runtime = "nodejs";

interface Payload {
  iniciadoEm?: unknown;
  finalizadoEm?: unknown;
  respostas?: unknown;
}

/**
 * Recebe uma tentativa feita offline (fila do IndexedDB) e a grava como
 * finalizada. Corrige no servidor - não confia na nota do cliente. Idempotente
 * pelo par (usuário, simulado, iniciadoEm).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasDatabase) {
    return NextResponse.json({ message: "Banco indisponível." }, { status: 503 });
  }

  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ message: "Faça login." }, { status: 401 });
  }

  const { slug } = await params;

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const iniciadoEm =
    typeof body.iniciadoEm === "string" ? new Date(body.iniciadoEm) : null;
  const finalizadoEm =
    typeof body.finalizadoEm === "string" ? new Date(body.finalizadoEm) : new Date();
  const marcadas: Record<string, number> =
    body.respostas && typeof body.respostas === "object"
      ? (body.respostas as Record<string, number>)
      : {};

  if (!iniciadoEm || Number.isNaN(iniciadoEm.getTime())) {
    return NextResponse.json({ message: "Data de início inválida." }, { status: 422 });
  }

  const simulado = await prisma.simulado.findUnique({
    where: { slug },
    include: { questoes: { include: { questao: true } } },
  });
  if (!simulado) {
    return NextResponse.json({ message: "Simulado não encontrado." }, { status: 404 });
  }

  const jaExiste = await prisma.tentativa.findFirst({
    where: { usuarioId: usuario.id, simuladoId: simulado.id, iniciadoEm },
    select: { id: true },
  });
  if (jaExiste) {
    return NextResponse.json({ ok: true, jaImportado: true, tentativaId: jaExiste.id });
  }

  const questoes = simulado.questoes.map((sq) => sq.questao);
  let acertos = 0;
  const linhas = questoes.map((q) => {
    const marcada = Number.isInteger(marcadas[q.id]) ? marcadas[q.id] : -1;
    const acertou = marcada === q.correta;
    if (acertou) acertos += 1;
    return { questaoId: q.id, marcada, correta: acertou };
  });
  const nota = questoes.length ? (acertos / questoes.length) * 100 : 0;

  const tentativa = await prisma.tentativa.create({
    data: {
      simuladoId: simulado.id,
      usuarioId: usuario.id,
      iniciadoEm,
      finalizadoEm:
        finalizadoEm && !Number.isNaN(finalizadoEm.getTime())
          ? finalizadoEm
          : new Date(),
      nota,
      respostas: { create: linhas },
    },
  });

  return NextResponse.json({
    ok: true,
    tentativaId: tentativa.id,
    nota: Math.round(nota),
  });
}
