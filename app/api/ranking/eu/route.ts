import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { posicaoDoUsuario } from "@/lib/ranking";

export const runtime = "nodejs";

export async function GET() {
  if (!hasDatabase) {
    return NextResponse.json({ posicao: null, total: 0, pontos: 0, concurso: "" });
  }
  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json({ message: "Faça login." }, { status: 401 });
  }
  return NextResponse.json(await posicaoDoUsuario(usuario.id));
}
