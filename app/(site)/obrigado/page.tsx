import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import { usuarioAtual, planoAtivo } from "@/lib/auth";
import { getPlano } from "@/lib/planos";

export const metadata: Metadata = { title: "Pagamento" };

interface Props {
  searchParams: Promise<{ status?: string; payment_id?: string }>;
}

export default async function ObrigadoPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const usuario = await usuarioAtual();
  const ativo = planoAtivo(usuario);
  const plano = usuario?.plano ? getPlano(usuario.plano) : undefined;

  const aprovado = ativo || status === "approved";

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      {aprovado ? (
        <>
          <CheckCircleIcon
            size={40}
            weight="fill"
            className="mx-auto text-brand"
            aria-hidden
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Pagamento confirmado
          </h1>
          <p className="mt-2 text-sm text-muted">
            {plano ? `O ${plano.nome} está ativo` : "Seu plano está ativo"}
            {usuario?.planoAte
              ? ` até ${usuario.planoAte.toLocaleDateString("pt-BR")}.`
              : "."}{" "}
            Todos os simulados e o material completo já liberaram.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/simulado"
              className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
            >
              Ir para os simulados
            </Link>
            <Link
              href="/minha-conta"
              className="rounded-lg border px-6 py-3 font-medium hover:bg-background"
            >
              Minha conta
            </Link>
          </div>
        </>
      ) : (
        <>
          <ClockIcon
            size={40}
            weight="fill"
            className="mx-auto text-accent"
            aria-hidden
          />
          <h1 className="mt-4 text-2xl font-bold tracking-tight">
            Aguardando a confirmação
          </h1>
          <p className="mt-2 text-sm text-muted">
            Se você pagou com Pix ou boleto, a compensação pode levar alguns minutos
            (boleto, até 2 dias úteis). Assim que o Mercado Pago confirmar, seu acesso
            libera automaticamente - você pode recarregar esta página ou a sua conta.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/minha-conta"
              className="rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
            >
              Ver status na minha conta
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
