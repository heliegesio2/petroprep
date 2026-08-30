"use client";

import { useState } from "react";
import { escolaridadeLabel } from "@/lib/concurso";

type Status = "idle" | "loading" | "ok" | "error";

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [mensagem, setMensagem] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMensagem("");

    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") ?? "").trim(),
      nome: String(form.get("nome") ?? "").trim() || undefined,
      escolaridade: String(form.get("escolaridade") ?? "") || undefined,
      areaInteresse: String(form.get("areaInteresse") ?? "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { message?: string };

      if (res.ok) {
        setStatus("ok");
        setMensagem(data.message ?? "Pronto! Você está na lista.");
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
      <div className="rounded-2xl border border-brand/40 bg-brand-soft p-6 text-brand-strong">
        <p className="font-semibold">Inscrição confirmada 🎉</p>
        <p className="mt-1 text-sm">{mensagem}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-2xl border bg-surface p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Nome</span>
          <input
            name="nome"
            type="text"
            autoComplete="name"
            className="rounded-lg border bg-background px-3 py-2"
            placeholder="Como te chamamos"
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
            className="rounded-lg border bg-background px-3 py-2"
            placeholder="voce@email.com"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Escolaridade</span>
          <select
            name="escolaridade"
            defaultValue=""
            className="rounded-lg border bg-background px-3 py-2"
          >
            <option value="">Prefiro não informar</option>
            {Object.entries(escolaridadeLabel).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Área de interesse</span>
          <input
            name="areaInteresse"
            type="text"
            className="rounded-lg border bg-background px-3 py-2"
            placeholder="Ex.: Operação, Engenharia, TI"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-1 rounded-lg bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
      >
        {status === "loading" ? "Enviando…" : "Quero entrar na lista"}
      </button>

      {status === "error" && (
        <p className="text-sm text-red-600 dark:text-red-400">{mensagem}</p>
      )}

      <p className="text-xs text-muted">
        Sem spam. Você recebe o material inicial, o resumo do edital quando sair e
        o acesso antecipado aos simulados. Pode sair da lista quando quiser.
      </p>
    </form>
  );
}
