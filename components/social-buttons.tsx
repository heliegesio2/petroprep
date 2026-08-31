"use client";

import {
  CaretRightIcon,
  FacebookLogoIcon,
  GoogleLogoIcon,
  TiktokLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

interface Provedor {
  id: string;
  label: string;
  Icon: typeof GoogleLogoIcon;
  /** Cor da marca aplicada só ao glifo do ícone. */
  cor: string;
}

const PROVEDORES: Provedor[] = [
  { id: "google", label: "Google", Icon: GoogleLogoIcon, cor: "text-[#4285F4]" },
  { id: "facebook", label: "Facebook", Icon: FacebookLogoIcon, cor: "text-[#1877F2]" },
  { id: "tiktok", label: "TikTok", Icon: TiktokLogoIcon, cor: "text-[#EE1D52]" },
];

/** Linhas de provedor social no estilo "escolha uma conta" do Google. */
export function SocialRows({
  provedores,
  next,
}: {
  provedores: string[];
  next: string;
}) {
  const lista = PROVEDORES.filter((p) => provedores.includes(p.id));
  if (lista.length === 0) return null;

  const qs = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <>
      {lista.map(({ id, label, Icon, cor }) => (
        <a
          key={id}
          href={`/api/auth/${id}${qs}`}
          className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-background"
        >
          <span className="grid h-10 w-10 flex-none place-items-center rounded-full border bg-surface">
            <Icon size={20} weight="fill" className={cor} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">Continuar com {label}</span>
            <span className="block text-xs text-muted">Login rápido, sem senha</span>
          </span>
          <CaretRightIcon size={16} className="flex-none text-muted" aria-hidden />
        </a>
      ))}
    </>
  );
}
