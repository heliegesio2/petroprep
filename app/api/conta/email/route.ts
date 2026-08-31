import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual, criarSessao, lerSessao } from "@/lib/auth";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ message: "Banco indisponível." }, { status: 503 });
  }

  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ message: "Faça login." }, { status: 401 });
  }

  let body: { email?: unknown };
  try {
    body = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 120) : "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 422 });
  }

  try {
    const atualizado = await prisma.usuario.update({
      where: { id: usuario.id },
      data: { email },
    });
    const sessao = await lerSessao();
    await criarSessao({
      id: atualizado.id,
      email: atualizado.email,
      nome: atualizado.nome,
      avatar: sessao?.avatar ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Esse e-mail já está em uso por outra conta." },
        { status: 409 },
      );
    }
    console.error("[conta/email] erro:", error);
    return NextResponse.json({ message: "Não foi possível salvar." }, { status: 500 });
  }
}
