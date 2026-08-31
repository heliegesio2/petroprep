import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual, ehAdmin } from "@/lib/auth";
import { getPlano, planoValidoAte } from "@/lib/planos";

export const runtime = "nodejs";

const STATUS = ["nenhum", "pendente", "ativo"] as const;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!hasDatabase) {
    return NextResponse.json({ message: "Banco indisponível." }, { status: 503 });
  }

  const admin = await usuarioAtual();
  if (!ehAdmin(admin)) {
    return NextResponse.json({ message: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const planoId = str(body.plano, 20);
  const planoStatus = str(body.planoStatus, 12) || "nenhum";
  const planoAteRaw = str(body.planoAte, 40);

  if (!(STATUS as readonly string[]).includes(planoStatus)) {
    return NextResponse.json({ message: "Status de plano inválido." }, { status: 422 });
  }

  const plano = planoId ? getPlano(planoId) : undefined;
  if (planoId && !plano) {
    return NextResponse.json({ message: "Plano inválido." }, { status: 422 });
  }

  const alvo = await prisma.usuario.findUnique({ where: { id } });
  if (!alvo) {
    return NextResponse.json({ message: "Usuário não encontrado." }, { status: 404 });
  }

  let planoAte: Date | null = null;
  if (plano && planoStatus === "ativo") {
    const manual = planoAteRaw
      ? new Date(`${planoAteRaw.slice(0, 10)}T23:59:59`)
      : null;
    planoAte =
      manual && !Number.isNaN(manual.getTime())
        ? manual
        : planoValidoAte(plano.id);
  }

  const atualizado = await prisma.usuario.update({
    where: { id },
    data: {
      plano: plano?.id ?? null,
      planoStatus: plano ? planoStatus : "nenhum",
      planoAte,
    },
  });

  return NextResponse.json({
    ok: true,
    plano: atualizado.plano,
    planoStatus: atualizado.planoStatus,
    planoAte: atualizado.planoAte ? atualizado.planoAte.toISOString() : null,
  });
}
