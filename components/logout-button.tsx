"use client";

import { useRouter } from "next/navigation";
import { SignOutIcon } from "@phosphor-icons/react/dist/ssr";

export function LogoutButton({
  className = "text-sm font-medium text-muted hover:text-foreground",
}: {
  className?: string;
}) {
  const router = useRouter();

  async function sair() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={sair} className={className}>
      <span className="inline-flex items-center gap-1.5">
        <SignOutIcon size={15} weight="bold" aria-hidden />
        Sair
      </span>
    </button>
  );
}
