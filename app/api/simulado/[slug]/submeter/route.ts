import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { lembrarTentativaAnonima } from "@/lib/tentativas-anonimas";

export const runtime = "nodejs";

interface Payload {
  tentativaId?: unknown;
  respostas?: unknown; // { [questaoId]: number }
}

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

  const tentativaId =
    typeof body.tentativaId === "string" ? body.tentativaId : "";
  const marcadas: Record<string, number> =
    body.respostas && typeof body.respostas === "object"
      ? (body.respostas as Record<string, number>)
      : {};

  if (!tentativaId) {
    return NextResponse.json({ message: "Tentativa não informada." }, { status: 422 });
  }

  const tentativa = await prisma.tentativa.findUnique({
    where: { id: tentativaId },
    include: {
      simulado: {
        include: { questoes: { include: { questao: true } } },
      },
    },
  });

  if (!tentativa || tentativa.simulado.slug !== slug) {
    return NextResponse.json({ message: "Tentativa não encontrada." }, { status: 404 });
  }

  const usuario = await usuarioAtual();
  let donoId = tentativa.usuarioId;
  if (donoId !== null) {
    if (!usuario || usuario.id !== donoId) {
      return NextResponse.json({ message: "Sem permissão." }, { status: 403 });
    }
  } else if (usuario) {
    // Começou deslogado e entrou durante a prova: a tentativa passa a ser dele.
    donoId = usuario.id;
  }

  if (tentativa.finalizadoEm) {
    return NextResponse.json({ ok: true, tentativaId, jaFinalizado: true });
  }

  const questoes = tentativa.simulado.questoes.map((sq) => sq.questao);
  let acertos = 0;
  const linhas = questoes.map((q) => {
    const marcada = Number.isInteger(marcadas[q.id]) ? marcadas[q.id] : -1;
    const acertou = marcada === q.correta;
    if (acertou) acertos += 1;
    return { questaoId: q.id, marcada, correta: acertou };
  });

  const nota = questoes.length ? (acertos / questoes.length) * 100 : 0;

  await prisma.$transaction([
    prisma.respostaSimulado.deleteMany({ where: { tentativaId } }),
    prisma.respostaSimulado.createMany({
      data: linhas.map((l) => ({ ...l, tentativaId })),
    }),
    prisma.tentativa.update({
      where: { id: tentativaId },
      data: { finalizadoEm: new Date(), nota, usuarioId: donoId },
    }),
  ]);

  // Feito deslogado: guarda o id para vincular à conta no próximo login.
  if (donoId === null) {
    await lembrarTentativaAnonima(tentativaId);
  }

  return NextResponse.json({ ok: true, tentativaId, nota: Math.round(nota) });
}
