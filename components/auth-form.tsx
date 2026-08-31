"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SocialRows } from "@/components/social-buttons";

const inputBase =
  "rounded-lg border bg-background px-3 py-2.5 text-sm placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

const ERROS_OAUTH: Record<string, string> = {
  indisponivel: "Esse login social ainda não está disponível. Use e-mail e senha.",
  state: "A sessão de login expirou. Tente de novo.",
  provedor: "Não foi possível entrar pelo provedor. Tente de novo.",
};

export function AuthForm({
  modo,
  provedores = [],
}: {
  modo: "cadastro" | "entrar";
  provedores?: string[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/minha-conta";
  const cadastro = modo === "cadastro";

  const [erro, setErro] = useState(ERROS_OAUTH[params.get("erro") ?? ""] ?? "");
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    const fd = new FormData(e.currentTarget);
    const rota = cadastro ? "/api/cadastro" : "/api/login";
    const payload = cadastro
      ? {
          nome: fd.get("nome"),
          email: fd.get("email"),
          telefone: fd.get("telefone"),
          senha: fd.get("senha"),
        }
      : { email: fd.get("email"), senha: fd.get("senha") };

    try {
      const res = await fetch(rota, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.replace(next);
        router.refresh();
        return;
      }
      const data = (await res.json()) as { message?: string };
      setErro(data.message ?? "Não foi possível concluir. Tente de novo.");
    } catch {
      setErro("Falha de conexão. Tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div>
      <Link
        href="/"
        className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-black text-white lg:hidden"
        aria-label="PetroPrep"
      >
        P
      </Link>

      <h1 className="mt-5 text-2xl font-bold tracking-tight lg:mt-0">
        {cadastro ? "Criar conta" : "Entrar na conta"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {cadastro
          ? "Leva 30 segundos. Seu progresso fica salvo."
          : "Bem-vindo de volta ao PetroPrep."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-3">
        {cadastro && (
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Nome</span>
            <input
              name="nome"
              type="text"
              required
              autoComplete="name"
              className={inputBase}
              placeholder="Seu nome"
            />
          </label>
        )}

        <label className="grid gap-1 text-sm">
          <span className="font-medium">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputBase}
            placeholder="voce@email.com"
          />
        </label>

        {cadastro && (
          <label className="grid gap-1 text-sm">
            <span className="font-medium">
              Telefone <span className="text-muted">(opcional)</span>
            </span>
            <input
              name="telefone"
              type="tel"
              autoComplete="tel"
              className={inputBase}
              placeholder="(00) 00000-0000"
            />
          </label>
        )}

        <label className="grid gap-1 text-sm">
          <span className="font-medium">Senha</span>
          <input
            name="senha"
            type="password"
            required
            minLength={8}
            autoComplete={cadastro ? "new-password" : "current-password"}
            className={inputBase}
            placeholder={cadastro ? "mínimo 8 caracteres" : "sua senha"}
          />
        </label>

        {erro && <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="mt-1 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
        >
          {carregando ? "Aguarde" : cadastro ? "Criar conta" : "Entrar"}
        </button>
      </form>

      {provedores.length > 0 && (
        <>
          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>
          <SocialRows provedores={provedores} next={next} />
        </>
      )}

      <p className="mt-6 text-sm text-muted">
        {cadastro ? (
          <>
            Já tem conta?{" "}
            <Link href="/entrar" className="font-medium text-brand hover:underline">
              Entrar
            </Link>
          </>
        ) : (
          <>
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-medium text-brand hover:underline">
              Criar conta
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
