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
    <Suspense fallback={null}>
      <AuthForm modo="entrar" provedores={provedoresConfigurados()} />
    </Suspense>
  );
}
