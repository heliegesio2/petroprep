"use client";

import { useEffect } from "react";
import { listarPendentes, removerPendente } from "@/lib/offline-db";

async function sincronizar() {
  let pendentes;
  try {
    pendentes = await listarPendentes();
  } catch {
    return;
  }
  for (const t of pendentes) {
    try {
      const res = await fetch(`/api/simulado/${t.slug}/importar`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          iniciadoEm: t.iniciadoEm,
          finalizadoEm: t.finalizadoEm,
          respostas: t.respostas,
        }),
      });
      if (res.ok || res.status === 422) {
        await removerPendente(t.id).catch(() => {});
      }
    } catch {
      // ainda offline: tenta de novo depois
      return;
    }
  }
}

/** Sobe as tentativas feitas offline quando a conexão volta. */
export function SyncOffline() {
  useEffect(() => {
    void sincronizar();
    const aoVoltar = () => void sincronizar();
    window.addEventListener("online", aoVoltar);
    return () => window.removeEventListener("online", aoVoltar);
  }, []);
  return null;
}
