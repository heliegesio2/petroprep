"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CaretLeftIcon,
  CaretRightIcon,
  ClockIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { QuestaoView } from "@/lib/simulado";

const LETRAS = ["A", "B", "C", "D", "E"];

function formatarTempo(seg: number): string {
  const s = Math.max(0, seg);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

interface Props {
  slug: string;
  titulo: string;
  duracaoMin: number;
  tentativaId: string;
  questoes: QuestaoView[];
}

export function SimuladoPlayer({
  slug,
  titulo,
  duracaoMin,
  tentativaId,
  questoes,
}: Props) {
  const router = useRouter();
  const deadlineRef = useRef<number | null>(null);
  const [restante, setRestante] = useState(duracaoMin * 60);
  const [indice, setIndice] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState("");

  const enviar = useCallback(async () => {
    setEnviando(true);
    setErro("");
    try {
      const res = await fetch(`/api/simulado/${slug}/submeter`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tentativaId, respostas }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        router.replace(`/simulado/${slug}?r=${tentativaId}`);
        router.refresh();
        return;
      }
      setErro(data.message ?? "Não foi possível enviar. Tente de novo.");
      setEnviando(false);
    } catch {
      setErro("Falha de conexão ao enviar. Tente de novo.");
      setEnviando(false);
    }
  }, [slug, tentativaId, respostas, router]);

  const enviarRef = useRef(enviar);
  useEffect(() => {
    enviarRef.current = enviar;
  });

  useEffect(() => {
    deadlineRef.current = Date.now() + duracaoMin * 60 * 1000;
    const tick = () => {
      const seg = Math.round((deadlineRef.current! - Date.now()) / 1000);
      setRestante(seg);
      if (seg <= 0) {
        clearInterval(id);
        void enviarRef.current();
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [duracaoMin]);

  const q = questoes[indice];
  const respondidas = Object.keys(respostas).length;
  const total = questoes.length;
  const ultima = indice === total - 1;

  function marcar(alt: number) {
    setRespostas((r) => ({ ...r, [q.id]: alt }));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">{titulo}</h1>
          <p className="text-xs text-muted">
            {respondidas} de {total} respondidas
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
            restante <= 60
              ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
              : "bg-surface"
          }`}
        >
          <ClockIcon size={15} aria-hidden />
          {formatarTempo(restante)}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-brand transition-[width]"
          style={{ width: `${(respondidas / total) * 100}%` }}
        />
      </div>

      <div className="mt-6 rounded-2xl border bg-surface p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Questão {indice + 1} · {q.disciplina}
        </p>
        <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">
          {q.enunciado}
        </p>

        <div
          role="radiogroup"
          aria-label={`Alternativas da questão ${indice + 1}`}
          className="mt-5 grid gap-2"
        >
          {q.alternativas.map((alt, i) => {
            const marcada = respostas[q.id] === i;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={marcada}
                onClick={() => marcar(i)}
                className={`flex gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${
                  marcada
                    ? "border-brand bg-brand-soft"
                    : "hover:bg-background"
                }`}
              >
                <span
                  className={`grid h-6 w-6 flex-none place-items-center rounded-full border text-xs font-bold ${
                    marcada ? "border-brand bg-brand text-white" : "text-muted"
                  }`}
                >
                  {LETRAS[i]}
                </span>
                <span className="pt-0.5">{alt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndice((n) => Math.max(0, n - 1))}
          disabled={indice === 0}
          className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          <CaretLeftIcon size={15} aria-hidden />
          Anterior
        </button>

        {ultima ? (
          <button
            type="button"
            onClick={() => setConfirmando(true)}
            disabled={enviando}
            className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
          >
            Finalizar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIndice((n) => Math.min(total - 1, n + 1))}
            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-background"
          >
            Próxima
            <CaretRightIcon size={15} aria-hidden />
          </button>
        )}
      </div>

      {/* Grade de navegação rápida */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {questoes.map((qq, i) => {
          const feita = respostas[qq.id] !== undefined;
          const atual = i === indice;
          return (
            <button
              key={qq.id}
              type="button"
              onClick={() => setIndice(i)}
              aria-label={`Ir para a questão ${i + 1}${feita ? " (respondida)" : ""}`}
              className={`h-8 w-8 rounded-md border text-xs font-semibold tabular-nums ${
                atual
                  ? "border-brand bg-brand text-white"
                  : feita
                    ? "border-brand/40 bg-brand-soft text-brand-strong"
                    : "text-muted hover:bg-surface"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {erro && (
        <p className="mt-4 text-sm text-red-700 dark:text-red-400">{erro}</p>
      )}

      {confirmando && (
        <div className="mt-6 rounded-2xl border border-brand/30 bg-brand-soft/50 p-5">
          <p className="text-sm font-semibold">Finalizar o simulado?</p>
          <p className="mt-1 text-sm text-muted">
            Você respondeu {respondidas} de {total} questões. As não respondidas contam
            como erro. Não dá para voltar depois de enviar.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={enviar}
              disabled={enviando}
              className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-strong disabled:opacity-60"
            >
              {enviando ? "Enviando" : "Enviar e ver o resultado"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(false)}
              disabled={enviando}
              className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-background"
            >
              Continuar respondendo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
