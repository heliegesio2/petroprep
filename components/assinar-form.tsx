"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { planos } from "@/lib/planos";

type Status = "idle" | "loading" | "ok" | "error";

interface Props {
  planoId: string;
  onTrocarPlano: (id: string) => void;
}

const inputBase =
  "rounded-lg border bg-background px-3 py-2 placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

export function AssinarForm({ planoId, onTrocarPlano }: Props) {
  const [status, setStatus] = useState<Status>("idle");
  const [mensagem, setMensagem] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMensagem("");

    const form = new FormData(event.currentTarget);
    const payload = {
      nome: String(form.get("nome") ?? "").trim() || undefined,
      email: String(form.get("email") ?? "").trim(),
      plano: planoId,
    };

    try {
      const res = await fetch("/api/assinar", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { message?: string };
      if (res.ok) {
        setStatus("ok");
        setMensagem(data.message ?? "Recebemos sua reserva.");
      } else {
        setStatus("error");
        setMensagem(data.message ?? "Não foi possível concluir. Tente de novo.");
      }
    } catch {
      setStatus("error");
      setMensagem("Falha de conexão. Verifique sua internet e tente de novo.");
    }
  }

  if (status === "ok") {
    return (
      <div className="flex gap-3 rounded-2xl border border-brand/40 bg-brand-soft p-6 text-brand-strong">
        <CheckCircleIcon size={22} weight="fill" className="mt-0.5 flex-none" aria-hidden />
        <div>
          <p className="font-semibold">Reserva registrada</p>
          <p className="mt-1 text-sm leading-relaxed">{mensagem}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border bg-surface p-6">
      <p className="text-sm font-semibold">
        Reservar o {planos.find((p) => p.id === planoId)?.nome}
      </p>

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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Nome</span>
          <input
            name="nome"
            type="text"
            autoComplete="name"
            className={inputBase}
            placeholder="Seu nome"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">
            E-mail <span className="text-brand">*</span>
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputBase}
            placeholder="voce@email.com"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 rounded-lg bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {status === "loading" ? "Enviando" : "Reservar com o preço atual"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-700 dark:text-red-400">{mensagem}</p>
      )}

      <p className="text-xs leading-relaxed text-muted">
        Ainda não é cobrança. O checkout está sendo finalizado. Quem reserva agora trava
        o preço atual e entra antes do reajuste.
      </p>
    </form>
  );
}
