import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ESCOLARIDADES = new Set(["medio", "tecnico", "superior"]);

interface Payload {
  email?: unknown;
  nome?: unknown;
  escolaridade?: unknown;
  areaInteresse?: unknown;
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
    return NextResponse.json(
      { message: "Informe um e-mail válido." },
      { status: 422 },
    );
  }

  const escolaridadeRaw = str(body.escolaridade, 20);
  const data = {
    email,
    nome: str(body.nome, 80) ?? null,
    escolaridade:
      escolaridadeRaw && ESCOLARIDADES.has(escolaridadeRaw)
        ? escolaridadeRaw
        : null,
    areaInteresse: str(body.areaInteresse, 80) ?? null,
    origem: str(body.origem, 80) ?? null,
  };

  // Sem banco configurado: a landing continua funcionando.
  if (!hasDatabase) {
    console.info("[waitlist] lead recebido (sem DATABASE_URL):", data.email);
    return NextResponse.json({
      message:
        "Recebemos seu contato! Estamos finalizando a configuração e você já está reservado na lista.",
    });
  }

  try {
    await prisma.lead.upsert({
      where: { email },
      create: data,
      update: {
        nome: data.nome ?? undefined,
        escolaridade: data.escolaridade ?? undefined,
        areaInteresse: data.areaInteresse ?? undefined,
      },
    });
  } catch (error) {
    console.error("[waitlist] falha ao gravar lead:", error);
    return NextResponse.json(
      { message: "Tivemos um problema ao salvar. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Você está na lista. Fique de olho no seu e-mail nas próximas semanas.",
  });
}
