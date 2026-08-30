import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { provedoresConfigurados } from "@/lib/oauth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Cadastre-se" };

export default async function CadastroPage() {
  if (await usuarioAtual()) redirect("/minha-conta");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
      <p className="mt-1 text-sm text-muted">
        Grátis. Você já pode fazer o simulado diagnóstico; o resto do material libera com
        o plano.
      </p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <AuthForm modo="cadastro" provedores={provedoresConfigurados()} />
        </Suspense>
      </div>
    </div>
  );
}
