"use client";

import {
  FacebookLogoIcon,
  GoogleLogoIcon,
  TiktokLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

const PROVEDORES = [
  { id: "google", label: "Google", Icon: GoogleLogoIcon },
  { id: "facebook", label: "Facebook", Icon: FacebookLogoIcon },
  { id: "tiktok", label: "TikTok", Icon: TiktokLogoIcon },
] as const;

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
    <div className="grid gap-2">
      {lista.map(({ id, label, Icon }) => (
        <a
          key={id}
          href={`/api/auth/${id}${qs}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
        >
          <Icon size={18} weight="bold" aria-hidden />
          Continuar com {label}
        </a>
      ))}
    </div>
  );
}
