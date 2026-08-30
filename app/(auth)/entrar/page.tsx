import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { provedoresConfigurados } from "@/lib/oauth";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage() {
  if (await usuarioAtual()) redirect("/minha-conta");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Entrar</h1>
      <p className="mt-1 text-sm text-muted">Acesse seus simulados e seu progresso.</p>
      <div className="mt-6">
        <Suspense fallback={null}>
          <AuthForm modo="entrar" provedores={provedoresConfigurados()} />
        </Suspense>
      </div>
    </div>
  );
}
