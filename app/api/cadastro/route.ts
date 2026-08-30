import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/prisma";
import { criarSessao, hashSenha } from "@/lib/auth";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json(
      { message: "Cadastro indisponível: banco não configurado." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const nome = str(body.nome, 80);
  const email = str(body.email, 120).toLowerCase();
  const telefone = str(body.telefone, 20) || null;
  const senha = typeof body.senha === "string" ? body.senha : "";

  if (nome.length < 2) {
    return NextResponse.json({ message: "Informe seu nome." }, { status: 422 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 422 });
  }
  if (senha.length < 8) {
    return NextResponse.json(
      { message: "A senha precisa ter ao menos 8 caracteres." },
      { status: 422 },
    );
  }

  try {
    const usuario = await prisma.usuario.create({
      data: { nome, email, telefone, senhaHash: await hashSenha(senha) },
    });
    await criarSessao({ id: usuario.id, email: usuario.email, nome: usuario.nome });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { message: "Já existe uma conta com esse e-mail. Faça login." },
        { status: 409 },
      );
    }
    console.error("[cadastro] erro:", error);
    return NextResponse.json(
      { message: "Não foi possível concluir o cadastro. Tente de novo." },
      { status: 500 },
    );
  }
}
