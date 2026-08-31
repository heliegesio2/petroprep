"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CaretLeftIcon,
  CaretRightIcon,
  EnvelopeSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { SocialRows } from "@/components/social-buttons";

const inputBase =
  "rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

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

  const [comEmail, setComEmail] = useState(provedores.length === 0);
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
    <div className="w-full rounded-2xl border bg-surface p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <Link
          href="/"
          className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-sm font-black text-white"
          aria-label="PetroPrep"
        >
          P
        </Link>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          {cadastro ? "Criar conta" : "Entrar"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {comEmail
            ? cadastro
              ? "Preencha seus dados"
              : "Use seu e-mail e senha"
            : "Escolha como continuar no PetroPrep"}
        </p>
      </div>

      <div className="mt-6">
        {!comEmail ? (
          <div className="grid gap-1">
            {erro && (
              <p className="mb-2 text-sm text-red-700 dark:text-red-400">{erro}</p>
            )}

            <SocialRows provedores={provedores} next={next} />

            {provedores.length > 0 && <div className="my-1 h-px bg-border" />}

            <button
              type="button"
              onClick={() => {
                setComEmail(true);
                setErro("");
              }}
              className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-background"
            >
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full border bg-surface">
                <EnvelopeSimpleIcon size={20} className="text-muted" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {cadastro ? "Cadastrar com e-mail" : "Entrar com e-mail e senha"}
                </span>
                <span className="block text-xs text-muted">
                  {cadastro ? "Crie uma conta no site" : "Use o cadastro do site"}
                </span>
              </span>
              <CaretRightIcon size={16} className="flex-none text-muted" aria-hidden />
            </button>
          </div>
        ) : (
          <div>
            {provedores.length > 0 && (
              <button
                type="button"
                onClick={() => setComEmail(false)}
                className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
              >
                <CaretLeftIcon size={14} aria-hidden />
                Voltar
              </button>
            )}

            <form onSubmit={onSubmit} className="grid gap-3">
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

              {erro && (
                <p className="text-sm text-red-700 dark:text-red-400">{erro}</p>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-1 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
              >
                {carregando ? "Aguarde" : cadastro ? "Criar conta" : "Entrar"}
              </button>
            </form>
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm text-muted">
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
