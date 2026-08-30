"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputBase =
  "rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

export function ContaEmailForm() {
  const router = useRouter();
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/conta/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = (await res.json()) as { message?: string };
      setErro(data.message ?? "Não foi possível salvar.");
    } catch {
      setErro("Falha de conexão. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-start gap-2">
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="voce@email.com"
        className={`${inputBase} flex-1`}
      />
      <button
        type="submit"
        disabled={carregando}
        className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
      >
        {carregando ? "Salvando" : "Salvar"}
      </button>
      {erro && (
        <p className="w-full text-sm text-red-700 dark:text-red-400">{erro}</p>
      )}
    </form>
  );
}
