import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual, ehAdmin, hashSenha } from "@/lib/auth";
import { getPlano, planoValidoAte } from "@/lib/planos";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUS = ["nenhum", "pendente", "ativo"] as const;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ message: "Banco indisponível." }, { status: 503 });
  }

  const admin = await usuarioAtual();
  if (!ehAdmin(admin)) {
    return NextResponse.json({ message: "Sem permissão." }, { status: 403 });
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
  const planoId = str(body.plano, 20);
  const planoStatus = str(body.planoStatus, 12) || "nenhum";

  if (nome.length < 2) {
    return NextResponse.json({ message: "Informe o nome." }, { status: 422 });
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
  if (!(STATUS as readonly string[]).includes(planoStatus)) {
    return NextResponse.json({ message: "Status de plano inválido." }, { status: 422 });
  }

  const plano = planoId ? getPlano(planoId) : undefined;
  if (planoId && !plano) {
    return NextResponse.json({ message: "Plano inválido." }, { status: 422 });
  }

  try {
    const criado = await prisma.usuario.create({
      data: {
        nome,
        email,
        telefone,
        senhaHash: await hashSenha(senha),
        plano: plano?.id ?? null,
        planoStatus: plano ? planoStatus : "nenhum",
        planoAte:
          plano && planoStatus === "ativo" ? planoValidoAte(plano.id) : null,
      },
    });
    return NextResponse.json({ ok: true, id: criado.id });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "Já existe uma conta com esse e-mail." },
        { status: 409 },
      );
    }
    console.error("[admin/usuarios] criar:", error);
    return NextResponse.json(
      { message: "Não foi possível criar o usuário." },
      { status: 500 },
    );
  }
}
