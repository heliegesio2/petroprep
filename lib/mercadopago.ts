import "server-only";
import crypto from "node:crypto";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const accessToken = process.env.MP_ACCESS_TOKEN ?? "";

/** true quando há credencial do Mercado Pago; sem ela o checkout degrada. */
export const mpConfigurado = Boolean(accessToken);

function client(): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken });
}

export interface PreferenciaInput {
  planoId: string;
  titulo: string;
  preco: number;
  usuarioId: string;
  /** Opcional: contas via TikTok podem não ter e-mail; o MP coleta no checkout. */
  email?: string | null;
  baseUrl: string;
}

/** Cria a preferência de pagamento e devolve o link do checkout. */
export async function criarPreferencia(
  input: PreferenciaInput,
): Promise<{ id: string; initPoint: string }> {
  const pref = new Preference(client());
  const res = await pref.create({
    body: {
      items: [
        {
          id: input.planoId,
          title: input.titulo,
          quantity: 1,
          unit_price: input.preco,
          currency_id: "BRL",
        },
      ],
      ...(input.email ? { payer: { email: input.email } } : {}),
      external_reference: input.usuarioId,
      back_urls: {
        success: `${input.baseUrl}/obrigado`,
        pending: `${input.baseUrl}/obrigado`,
        failure: `${input.baseUrl}/#planos`,
      },
      auto_return: "approved",
      notification_url: `${input.baseUrl}/api/webhook/mercadopago`,
      metadata: { plano: input.planoId, usuario_id: input.usuarioId },
    },
  });

  const initPoint = res.init_point ?? res.sandbox_init_point;
  if (!res.id || !initPoint) {
    throw new Error("Mercado Pago não retornou o link do checkout.");
  }
  return { id: String(res.id), initPoint };
}

export interface PagamentoInfo {
  id: string;
  status: string; // approved | pending | rejected | ...
  externalReference: string | null;
  plano: string | null;
}

/** Consulta um pagamento pelo id (usado no webhook). */
export async function consultarPagamento(
  paymentId: string,
): Promise<PagamentoInfo | null> {
  const pay = new Payment(client());
  const res = await pay.get({ id: paymentId });
  if (!res || !res.id) return null;
  const meta = (res.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(res.id),
    status: res.status ?? "unknown",
    externalReference: res.external_reference ?? null,
    plano: typeof meta.plano === "string" ? meta.plano : null,
  };
}

/**
 * Valida a assinatura do webhook (cabeçalho x-signature + x-request-id).
 * Sem MP_WEBHOOK_SECRET, não dá para validar: retorna false e o handler decide.
 * Ref.: manifest "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 */
export function validarAssinaturaWebhook(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | null,
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !xSignature || !dataId) return false;

  const partes = Object.fromEntries(
    xSignature.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = partes.ts;
  const hash = partes.v1;
  if (!ts || !hash) return false;

  const manifest = `id:${dataId};request-id:${xRequestId ?? ""};ts:${ts};`;
  const esperado = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(esperado),
      Buffer.from(hash),
    );
  } catch {
    return false;
  }
}
