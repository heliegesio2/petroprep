"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CaretDownIcon,
  GearSixIcon,
  ListChecksIcon,
  ShieldCheckIcon,
  SignOutIcon,
} from "@phosphor-icons/react/dist/ssr";

const CORES = [
  "bg-[#0b8043]",
  "bg-[#1a73e8]",
  "bg-[#b8860b]",
  "bg-[#c2410c]",
  "bg-[#7c3aed]",
  "bg-[#0e7490]",
];

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] ?? "" : "";
  return (primeira + ultima).toUpperCase();
}

function corDeNome(nome: string): string {
  let h = 0;
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) | 0;
  return CORES[Math.abs(h) % CORES.length];
}

function Avatar({
  nome,
  avatar,
  tamanho,
}: {
  nome: string;
  avatar: string | null;
  tamanho: number;
}) {
  const [erro, setErro] = useState(false);
  const estilo = { width: tamanho, height: tamanho };

  if (avatar && !erro) {
    return (
      // next/image exigiria remotePatterns por provedor; <img> simples resolve.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt=""
        referrerPolicy="no-referrer"
        onError={() => setErro(true)}
        style={estilo}
        className="rounded-full object-cover"
      />
    );
  }

  return (
    <span
      style={estilo}
      className={`grid place-items-center rounded-full text-xs font-semibold text-white ${corDeNome(nome)}`}
      aria-hidden
    >
      {iniciais(nome)}
    </span>
  );
}

export function AccountMenu({
  nome,
  email,
  avatar,
  admin = false,
}: {
  nome: string;
  email: string | null;
  avatar: string | null;
  admin?: boolean;
}) {
  const router = useRouter();
  const [aberto, setAberto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    function fora(e: MouseEvent) {
      if (raiz.current && !raiz.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  async function sair() {
    setAberto(false);
    await fetch("/api/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  const primeiroNome = nome.split(" ")[0];

  return (
    <div ref={raiz} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={aberto}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-medium transition-colors hover:bg-surface"
      >
        <Avatar nome={nome} avatar={avatar} tamanho={32} />
        <span className="hidden max-w-[8rem] truncate sm:inline">{primeiroNome}</span>
        <CaretDownIcon
          size={14}
          className={`text-muted transition-transform ${aberto ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {aberto && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border bg-surface shadow-lg"
        >
          <div className="flex items-center gap-3 border-b p-4">
            <Avatar nome={nome} avatar={avatar} tamanho={40} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{nome}</p>
              {email && (
                <p className="truncate text-xs text-muted">{email}</p>
              )}
            </div>
          </div>

          <div className="p-1.5">
            <Link
              href="/minha-conta"
              role="menuitem"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-background"
            >
              <GearSixIcon size={18} className="flex-none text-muted" aria-hidden />
              Minha conta
            </Link>
            <Link
              href="/simulado"
              role="menuitem"
              onClick={() => setAberto(false)}
              className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-background"
            >
              <ListChecksIcon size={18} className="flex-none text-muted" aria-hidden />
              Meus simulados
            </Link>
            {admin && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => setAberto(false)}
                className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-background"
              >
                <ShieldCheckIcon size={18} className="flex-none text-muted" aria-hidden />
                Administração
              </Link>
            )}
          </div>

          <div className="border-t p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={sair}
              className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm hover:bg-background"
            >
              <SignOutIcon size={18} className="flex-none text-muted" aria-hidden />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
