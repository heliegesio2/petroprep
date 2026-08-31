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
    <Suspense fallback={null}>
      <AuthForm modo="cadastro" provedores={provedoresConfigurados()} />
    </Suspense>
  );
}
