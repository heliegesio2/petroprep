import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { getPlano } from "@/lib/planos";
import { mpConfigurado, criarPreferencia } from "@/lib/mercadopago";

export const runtime = "nodejs";

function baseUrl(request: Request): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

export async function POST(request: Request) {
  if (!hasDatabase) {
    return NextResponse.json({ message: "Banco indisponível." }, { status: 503 });
  }

  const usuario = await usuarioAtual();
  if (!usuario) {
    return NextResponse.json(
      { message: "Faça login para assinar.", precisaLogin: true },
      { status: 401 },
    );
  }

  let body: { plano?: unknown };
  try {
    body = (await request.json()) as { plano?: unknown };
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const planoId = typeof body.plano === "string" ? body.plano : "";
  const plano = getPlano(planoId);
  if (!plano) {
    return NextResponse.json({ message: "Plano inválido." }, { status: 422 });
  }

  // Sem credencial do Mercado Pago: registra a intenção e degrada com elegância.
  if (!mpConfigurado) {
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { plano: plano.id, planoStatus: "pendente" },
    });
    return NextResponse.json({
      configurando: true,
      message:
        "O checkout está em configuração. Registramos seu interesse no " +
        `${plano.nome} e avisamos assim que o pagamento abrir.`,
    });
  }

  try {
    const pref = await criarPreferencia({
      planoId: plano.id,
      titulo: `PetroPrep - ${plano.nome}`,
      preco: plano.preco,
      usuarioId: usuario.id,
      email: usuario.email,
      baseUrl: baseUrl(request),
    });

    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        plano: plano.id,
        planoStatus: "pendente",
        mpPreferenceId: pref.id,
      },
    });

    return NextResponse.json({ initPoint: pref.initPoint });
  } catch (error) {
    console.error("[checkout] falha ao criar preferência:", error);
    return NextResponse.json(
      { message: "Não foi possível abrir o checkout. Tente de novo em instantes." },
      { status: 502 },
    );
  }
}
