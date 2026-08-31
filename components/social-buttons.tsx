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

export function SocialButtons({
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
    <div className="grid gap-2.5">
      {lista.map(({ id, label, Icon, cor }) => (
        <a
          key={id}
          href={`/api/auth/${id}${qs}`}
          className="flex items-center gap-3 rounded-lg border bg-surface px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/25 hover:bg-background"
        >
          <Icon size={20} weight="fill" className={`flex-none ${cor}`} aria-hidden />
          <span className="flex-1 text-center">Continuar com {label}</span>
          {/* espaço espelhando o ícone p/ o texto ficar centralizado */}
          <span className="w-5 flex-none" aria-hidden />
        </a>
      ))}
    </div>
  );
}
