"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  CaretDownIcon,
  CheckCircleIcon,
  CircleIcon,
} from "@phosphor-icons/react/dist/ssr";
import { escolaridadeLabel, type TopicoProva } from "@/lib/concursos";

type Marcados = Record<string, boolean>;

const EVENTO = "petroprep:estudo";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(EVENTO, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(EVENTO, callback);
  };
}

/** Lê/grava um mapa "disciplina -> estudada" no localStorage, com re-render. */
function useEstudo(storageKey: string) {
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(storageKey) ?? "{}";
      } catch {
        return "{}";
      }
    },
    () => "{}",
  );

  const marcados = useMemo<Marcados>(() => {
    try {
      return JSON.parse(raw) as Marcados;
    } catch {
      return {};
    }
  }, [raw]);

  const toggle = useCallback(
    (disciplina: string) => {
      const atual = { ...marcados, [disciplina]: !marcados[disciplina] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(atual));
      } catch {
        // sem persistência: mantém só em memória via o evento abaixo.
      }
      window.dispatchEvent(new Event(EVENTO));
    },
    [marcados, storageKey],
  );

  return { marcados, toggle };
}

function cobradaEm(escolaridades: TopicoProva["escolaridades"]): string {
  const nomes = escolaridades.map((e) =>
    escolaridadeLabel[e].replace("Ensino ", "").replace("Nível ", ""),
  );
  if (nomes.length <= 1) return nomes.join("");
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

const prioridadeLabel: Record<
  NonNullable<TopicoProva["prioridade"]>,
  { texto: string; classe: string }
> = {
  alta: { texto: "Cai muito", classe: "bg-brand text-white" },
  media: { texto: "Cai", classe: "bg-brand-soft text-brand-strong" },
  baixa: { texto: "Cai pouco", classe: "bg-surface text-muted" },
};

export function ConteudoProgresso({
  topicos,
  storageKey,
}: {
  topicos: TopicoProva[];
  storageKey: string;
}) {
  const { marcados, toggle } = useEstudo(storageKey);
  const [aberto, setAberto] = useState<string | null>(null);

  const feitos = topicos.filter((t) => marcados[t.disciplina]).length;
  const pct = topicos.length ? Math.round((feitos / topicos.length) * 100) : 0;

  return (
    <div className="mt-8">
      <div className="rounded-2xl border bg-surface p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">Seu progresso no conteúdo</p>
          <p className="font-mono text-sm tabular-nums text-muted">
            {feitos} de {topicos.length}
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-background"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          Marque cada disciplina conforme estuda. O progresso fica salvo neste
          navegador.
        </p>
      </div>

      <ul className="mt-6 grid gap-3">
        {topicos.map((t) => {
          const marcado = Boolean(marcados[t.disciplina]);
          const expandido = aberto === t.disciplina;
          const prio = t.prioridade ? prioridadeLabel[t.prioridade] : null;
          return (
            <li
              key={t.disciplina}
              className={`overflow-hidden rounded-2xl border transition-colors ${
                marcado ? "border-brand/40 bg-brand-soft/40" : "bg-surface"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <button
                  type="button"
                  onClick={() => toggle(t.disciplina)}
                  aria-pressed={marcado}
                  aria-label={
                    marcado
                      ? `Desmarcar ${t.disciplina} como estudada`
                      : `Marcar ${t.disciplina} como estudada`
                  }
                  className="mt-0.5 flex-none text-brand"
                >
                  {marcado ? (
                    <CheckCircleIcon size={24} weight="fill" />
                  ) : (
                    <CircleIcon size={24} className="text-muted" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAberto((a) => (a === t.disciplina ? null : t.disciplina))
                  }
                  aria-expanded={expandido}
                  className="flex flex-1 items-start justify-between gap-3 text-left"
                >
                  <span>
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{t.disciplina}</span>
                      {prio && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${prio.classe}`}
                        >
                          {prio.texto}
                        </span>
                      )}
                      <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                        {t.natureza === "basico" ? "Básico" : "Específico"}
                      </span>
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      Cobrada em {cobradaEm(t.escolaridades)}
                    </span>
                  </span>
                  <CaretDownIcon
                    size={18}
                    className={`mt-1 flex-none text-muted transition-transform ${
                      expandido ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </button>
              </div>

              {expandido && (
                <div className="border-t px-4 py-4 pl-[3.25rem]">
                  {t.resumo && (
                    <p className="text-sm leading-relaxed text-foreground/90">
                      {t.resumo}
                    </p>
                  )}
                  {t.editais && t.editais.length > 0 && (
                    <p className="mt-3 text-xs text-muted">
                      <span className="font-semibold text-foreground">Cobrada em:</span>{" "}
                      {t.editais.join(" · ")}
                    </p>
                  )}
                  <p className="mt-3 text-xs font-semibold text-muted">
                    Tópicos do programa
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted">
                    {t.itens.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span
                          className="mt-2 h-1 w-1 flex-none rounded-full bg-brand"
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
