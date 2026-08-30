import { NextResponse } from "next/server";
import { hasDatabase, prisma } from "@/lib/prisma";
import { planoValidoAte } from "@/lib/planos";
import {
  consultarPagamento,
  validarAssinaturaWebhook,
} from "@/lib/mercadopago";

export const runtime = "nodejs";

/**
 * Webhook do Mercado Pago. Recebe a notificação de pagamento, confere na API do
 * MP e, se aprovado, ativa o plano do usuário (external_reference = usuario.id).
 * Responde 200 sempre que possível para o MP não ficar reenviando.
 */
export async function POST(request: Request) {
  if (!hasDatabase) return NextResponse.json({ ok: true });

  const url = new URL(request.url);
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    // MP também manda notificações via query string.
  }

  const tipo =
    (payload.type as string | undefined) ??
    url.searchParams.get("type") ??
    url.searchParams.get("topic");
  const data = (payload.data ?? {}) as { id?: string };
  const dataId =
    data.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipo !== "payment" || !dataId) {
    return NextResponse.json({ ok: true, ignorado: true });
  }

  if (
    process.env.MP_WEBHOOK_SECRET &&
    !validarAssinaturaWebhook(xSignature, xRequestId, dataId)
  ) {
    console.warn("[webhook mp] assinatura inválida");
    return NextResponse.json({ message: "assinatura inválida" }, { status: 401 });
  }

  try {
    const pagamento = await consultarPagamento(dataId);
    if (!pagamento || !pagamento.externalReference) {
      return NextResponse.json({ ok: true, semReferencia: true });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: pagamento.externalReference },
    });
    if (!usuario) return NextResponse.json({ ok: true, semUsuario: true });

    const planoId = pagamento.plano ?? usuario.plano ?? "transpetro";

    if (pagamento.status === "approved") {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          plano: planoId,
          planoStatus: "ativo",
          planoAte: planoValidoAte(planoId),
          mpPaymentId: pagamento.id,
        },
      });
    } else if (pagamento.status === "pending" || pagamento.status === "in_process") {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { planoStatus: "pendente", mpPaymentId: pagamento.id },
      });
    } else if (
      pagamento.status === "rejected" ||
      pagamento.status === "cancelled"
    ) {
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          planoStatus: usuario.planoStatus === "ativo" ? "ativo" : "nenhum",
        },
      });
    }

    return NextResponse.json({ ok: true, status: pagamento.status });
  } catch (error) {
    console.error("[webhook mp] erro:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
