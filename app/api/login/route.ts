import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { criarSessao, verificarSenha } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json(
      { message: "Login indisponível: banco não configurado." },
      { status: 503 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const senha = typeof body.senha === "string" ? body.senha : "";

  const generico = { message: "E-mail ou senha incorretos." };

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.senhaHash) {
    return NextResponse.json(generico, { status: 401 });
  }
  if (!(await verificarSenha(senha, usuario.senhaHash))) {
    return NextResponse.json(generico, { status: 401 });
  }

  await criarSessao({ id: usuario.id, email: usuario.email, nome: usuario.nome });
  return NextResponse.json({ ok: true });
}
