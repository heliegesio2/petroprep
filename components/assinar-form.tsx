"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowSquareOutIcon, InfoIcon } from "@phosphor-icons/react/dist/ssr";
import { planos } from "@/lib/planos";

type Status = "idle" | "loading" | "info" | "error";

interface Props {
  planoId: string;
  logado: boolean;
  onTrocarPlano: (id: string) => void;
}

const NEXT = encodeURIComponent("/planos");

export function AssinarForm({ planoId, logado, onTrocarPlano }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [mensagem, setMensagem] = useState("");

  const plano = planos.find((p) => p.id === planoId);

  async function irParaPagamento() {
    setStatus("loading");
    setMensagem("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plano: planoId }),
      });
      const data = (await res.json()) as {
        initPoint?: string;
        configurando?: boolean;
        message?: string;
      };

      if (res.ok && data.initPoint) {
        window.location.href = data.initPoint;
        return;
      }
      if (res.ok && data.configurando) {
        setStatus("info");
        setMensagem(data.message ?? "Checkout em configuração.");
        return;
      }
      setStatus("error");
      setMensagem(data.message ?? "Não foi possível abrir o checkout.");
    } catch {
      setStatus("error");
      setMensagem("Falha de conexão. Tente de novo.");
    }
  }

  if (!logado) {
    return (
      <div className="grid gap-3 rounded-2xl border bg-surface p-6">
        <p className="text-sm font-semibold">Assinar o {plano?.nome}</p>
        <p className="text-sm text-muted">
          Crie sua conta (leva 30 segundos) para assinar e ter seu progresso e
          histórico de simulados salvos.
        </p>
        <div className="mt-1 flex flex-wrap gap-3">
          <Link
            href={`/cadastro?next=${NEXT}`}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Criar conta e assinar
          </Link>
          <Link
            href={`/entrar?next=${NEXT}`}
            className="rounded-lg border px-5 py-2.5 text-sm font-medium hover:bg-background"
          >
            Já tenho conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-surface p-6">
      <p className="text-sm font-semibold">Assinar o {plano?.nome}</p>

      <div className="flex gap-1 rounded-lg border p-1 text-sm">
        {planos.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onTrocarPlano(p.id)}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
              p.id === planoId
                ? "bg-brand text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {p.nome}, R$ {p.preco}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={irParaPagamento}
        disabled={status === "loading"}
        className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {status === "loading" ? (
          "Abrindo o checkout"
        ) : (
          <>
            Ir para o pagamento
            <ArrowSquareOutIcon size={16} weight="bold" aria-hidden />
          </>
        )}
      </button>

      {status === "info" && (
        <p className="flex gap-2 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs leading-relaxed">
          <InfoIcon size={15} weight="fill" className="mt-px flex-none text-accent" aria-hidden />
          <span>{mensagem}</span>
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-700 dark:text-red-400">{mensagem}</p>
      )}

      <p className="text-xs leading-relaxed text-muted">
        Pagamento único pelo Mercado Pago (cartão, Pix ou boleto). O acesso libera
        assim que o pagamento é aprovado.
      </p>
    </div>
  );
}
