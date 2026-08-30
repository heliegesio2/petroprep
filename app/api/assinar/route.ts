import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { getPlano } from "@/lib/planos";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Payload {
  email?: unknown;
  nome?: unknown;
  plano?: unknown;
  origem?: unknown;
}

function str(value: unknown, max = 120): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed.length ? trimmed : undefined;
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const email = str(body.email)?.toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 422 });
  }

  const planoId = str(body.plano, 20);
  const plano = planoId ? getPlano(planoId) : undefined;
  if (!plano) {
    return NextResponse.json({ message: "Plano inválido." }, { status: 422 });
  }

  const data = {
    email,
    nome: str(body.nome, 80) ?? null,
    plano: plano.id,
    concursoSlug:
      plano.concursos === "todos" ? "todos" : plano.concursos[0] ?? null,
    origem: str(body.origem, 80) ?? null,
  };

  if (!hasDatabase) {
    console.info("[assinar] reserva recebida (sem DATABASE_URL):", data.email, data.plano);
    return NextResponse.json({
      message:
        "Recebemos sua reserva! Assim que o checkout abrir, você é o primeiro a saber — com o preço atual garantido.",
    });
  }

  try {
    await prisma.lead.upsert({
      where: { email },
      create: data,
      update: {
        nome: data.nome ?? undefined,
        plano: data.plano,
        concursoSlug: data.concursoSlug ?? undefined,
      },
    });
  } catch (error) {
    console.error("[assinar] falha ao gravar reserva:", error);
    return NextResponse.json(
      { message: "Tivemos um problema ao salvar. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message:
      "Reserva registrada! Assim que o pagamento abrir, avisamos por e-mail e você entra com o preço atual.",
  });
}
