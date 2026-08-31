import { NextResponse } from "next/server";
import { hasDatabase } from "@/lib/prisma";
import { usuarioAtual, planoAtivo } from "@/lib/auth";
import { carregarPacote } from "@/lib/simulado";

export const runtime = "nodejs";

/**
 * Baixa o simulado COM gabarito para estudo offline. Restrito a quem tem plano
 * ativo (as respostas ficam legíveis no dispositivo). O Diagnóstico gratuito
 * não é baixável.
 */
export async function GET(
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
  if (!planoAtivo(usuario)) {
    return NextResponse.json(
      { message: "Baixar simulados para offline é um recurso dos planos." },
      { status: 403 },
    );
  }

  const { slug } = await params;
  const pacote = await carregarPacote(slug);
  if (!pacote || pacote.questoes.length === 0) {
    return NextResponse.json({ message: "Simulado não encontrado." }, { status: 404 });
  }
  if (pacote.gratuito) {
    return NextResponse.json(
      { message: "O Simulado Diagnóstico funciona apenas online." },
      { status: 400 },
    );
  }

  const url = new URL(request.url);
  if (url.searchParams.get("so-versao")) {
    return NextResponse.json({ versao: pacote.versao });
  }

  return NextResponse.json(pacote, {
    headers: { "Cache-Control": "no-store" },
  });
}
