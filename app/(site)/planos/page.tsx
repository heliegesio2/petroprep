import type { Metadata } from "next";
import { lerSessao } from "@/lib/auth";
import { FeatureGrid } from "@/components/feature-grid";
import { PlanosSection } from "@/components/planos-section";

export const metadata: Metadata = {
  title: "Planos",
  description:
    "Planos de pagamento único da PetroPrep: simulados, conteúdo e progresso salvos até o dia da prova.",
};

export default async function PlanosPage() {
  const logado = Boolean(await lerSessao());
  return (
    <>
      <div className="mx-auto max-w-3xl px-4 pt-12 text-center lg:pt-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Um pagamento, acesso até a prova
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Sem mensalidade e sem tier gratuito com pegadinha. Escolha o plano,
          pague uma vez e use tudo até o dia da sua prova.
        </p>
      </div>
      <FeatureGrid />
      <PlanosSection logado={logado} />
    </>
  );
}
