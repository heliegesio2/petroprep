"use client";

import { useOffline } from "next/offline";
import { WifiSlashIcon } from "@phosphor-icons/react/dist/ssr";

export function OfflineBanner() {
  const offline = useOffline();
  if (!offline) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-[#062a1c] px-4 py-2 text-center text-xs text-white"
    >
      <WifiSlashIcon size={14} weight="bold" aria-hidden />
      Sem conexão. O que já carregou continua disponível; o resto volta quando a
      internet voltar.
    </div>
  );
}
