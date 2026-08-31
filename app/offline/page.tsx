import type { Metadata } from "next";
import Link from "next/link";
import { WifiSlashIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = { title: "Sem conexão", robots: { index: false } };

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <WifiSlashIcon size={40} className="text-muted" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Você está sem conexão</h1>
      <p className="mt-2 text-sm text-muted">
        Esta página ainda não tinha sido carregada neste aparelho. As páginas que
        você já abriu continuam funcionando offline. Assim que a internet voltar,
        tudo se atualiza sozinho.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
      >
        Ir para o início
      </Link>
    </div>
  );
}
