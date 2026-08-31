"use client";

import {
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

/** Botões sociais em largura total, ícone da marca à esquerda. */
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
    <div className="grid gap-2">
      {lista.map(({ id, label, Icon, cor }) => (
        <a
          key={id}
          href={`/api/auth/${id}${qs}`}
          className="flex items-center justify-center gap-2.5 rounded-lg border bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-background"
        >
          <Icon size={18} weight="fill" className={cor} aria-hidden />
          Continuar com {label}
        </a>
      ))}
    </div>
  );
}
