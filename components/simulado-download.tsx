"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  DownloadSimpleIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  lerPacote,
  salvarPacote,
  removerPacote,
  pedirPersistencia,
  type PacoteOffline,
} from "@/lib/offline-db";

type Estado = "carregando" | "ausente" | "baixando" | "salvo" | "desatualizado";

export function SimuladoDownload({ slug }: { slug: string }) {
  const [estado, setEstado] = useState<Estado>("carregando");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let vivo = true;
    lerPacote(slug)
      .then(async (local) => {
        if (!vivo) return;
        if (!local) {
          setEstado("ausente");
          return;
        }
        setEstado("salvo");
        // Online: confere se a versão mudou.
        try {
          const res = await fetch(`/api/simulado/${slug}/pacote?so-versao=1`);
          if (res.ok) {
            const { versao } = (await res.json()) as { versao?: string };
            if (vivo && versao && versao !== local.versao) setEstado("desatualizado");
          }
        } catch {
          // offline: mantém "salvo"
        }
      })
      .catch(() => vivo && setEstado("ausente"));
    return () => {
      vivo = false;
    };
  }, [slug]);

  async function baixar() {
    setEstado("baixando");
    setErro("");
    try {
      const res = await fetch(`/api/simulado/${slug}/pacote`);
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setErro(data.message ?? "Não foi possível baixar.");
        setEstado("ausente");
        return;
      }
      const pacote = (await res.json()) as Omit<PacoteOffline, "baixadoEm">;
      await salvarPacote({ ...pacote, baixadoEm: Date.now() });
      await pedirPersistencia();
      // Aquece a rota offline para abrir sem internet depois.
      fetch("/estudar-offline").catch(() => {});
      setEstado("salvo");
    } catch {
      setErro("Falha de conexão ao baixar.");
      setEstado("ausente");
    }
  }

  async function remover() {
    await removerPacote(slug).catch(() => {});
    setEstado("ausente");
  }

  if (estado === "carregando") return null;

  if (estado === "salvo" || estado === "desatualizado") {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-3 text-xs">
        <span className="inline-flex items-center gap-1 font-medium text-brand-strong">
          <CheckCircleIcon size={14} weight="fill" aria-hidden />
          Disponível offline
        </span>
        <Link href="/estudar-offline" className="text-brand hover:underline">
          Abrir
        </Link>
        {estado === "desatualizado" && (
          <button
            type="button"
            onClick={baixar}
            className="inline-flex items-center gap-1 font-medium text-accent"
          >
            <ArrowClockwiseIcon size={12} weight="bold" aria-hidden />
            Atualizar
          </button>
        )}
        <button type="button" onClick={remover} className="text-muted hover:underline">
          Remover
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 border-t pt-3">
      <button
        type="button"
        onClick={baixar}
        disabled={estado === "baixando"}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline disabled:opacity-60"
      >
        <DownloadSimpleIcon size={14} weight="bold" aria-hidden />
        {estado === "baixando" ? "Baixando..." : "Baixar para estudar offline"}
      </button>
      {erro && <p className="mt-1 text-xs text-red-700 dark:text-red-400">{erro}</p>}
    </div>
  );
}
