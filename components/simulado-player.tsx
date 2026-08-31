"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CaretRightIcon,
  ClockIcon,
  SmileySadIcon,
  StarIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { QuestaoView } from "@/lib/simulado";

const LETRAS = ["A", "B", "C", "D", "E"];

function formatarTempo(seg: number): string {
  const s = Math.max(0, seg);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

interface Feedback {
  correta: boolean;
  gabarito: number;
  comentario: string | null;
}

interface Props {
  slug: string;
  duracaoMin: number;
  tentativaId: string;
  questoes: QuestaoView[];
  respondidas: Record<string, { marcada: number; correta: boolean }>;
}

export function SimuladoPlayer({
  slug,
  duracaoMin,
  tentativaId,
  questoes,
  respondidas,
}: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const iniciais = useMemo(() => {
    const m: Record<string, number> = {};
    for (const [qid, r] of Object.entries(respondidas)) m[qid] = r.marcada;
    return m;
  }, [respondidas]);

  const primeiraPendente = useMemo(() => {
    const i = questoes.findIndex((q) => respondidas[q.id] === undefined);
    return i === -1 ? questoes.length - 1 : i;
  }, [questoes, respondidas]);

  const [respostas, setRespostas] = useState<Record<string, number>>(iniciais);
  const [indice, setIndice] = useState(primeiraPendente);
  const [selecionada, setSelecionada] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [restante, setRestante] = useState(duracaoMin * 60);
  const [saindo, setSaindo] = useState(false);

  const total = questoes.length;
  const q = questoes[indice];
  const ultima = indice >= total - 1;
  const feitas = Object.keys(respostas).length;
  const pct = Math.round((feitas / total) * 100);

  const finalizar = useCallback(
    async (mapa: Record<string, number>) => {
      setOcupado(true);
      setErro("");
      try {
        const res = await fetch(`/api/simulado/${slug}/submeter`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tentativaId, respostas: mapa }),
        });
        const data = (await res.json()) as { ok?: boolean; message?: string };
        if (res.ok && data.ok) {
          router.replace(`/simulado/${slug}?r=${tentativaId}`);
          router.refresh();
          return;
        }
        setErro(data.message ?? "Não foi possível enviar. Tente de novo.");
        setOcupado(false);
      } catch {
        setErro("Falha de conexão ao enviar. Tente de novo.");
        setOcupado(false);
      }
    },
    [slug, tentativaId, router],
  );

  const finalizarRef = useRef(finalizar);
  useEffect(() => {
    finalizarRef.current = finalizar;
  });
  const respostasRef = useRef(respostas);
  useEffect(() => {
    respostasRef.current = respostas;
  });

  const corpoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    corpoRef.current?.scrollTo({ top: 0 });
  }, [indice]);

  const deadlineRef = useRef<number | null>(null);
  useEffect(() => {
    deadlineRef.current = Date.now() + duracaoMin * 60 * 1000;
    const tick = () => {
      const seg = Math.round((deadlineRef.current! - Date.now()) / 1000);
      setRestante(seg);
      if (seg <= 0) {
        clearInterval(id);
        void finalizarRef.current(respostasRef.current);
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [duracaoMin]);

  // A prova cobre a tela inteira: trava o scroll do body enquanto está aberta.
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  async function verificar() {
    if (selecionada === null || feedback || ocupado) return;
    setOcupado(true);
    setErro("");
    try {
      const res = await fetch(`/api/simulado/${slug}/responder`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tentativaId,
          questaoId: q.id,
          marcada: selecionada,
        }),
      });
      const data = (await res.json()) as {
        correta?: boolean;
        gabarito?: number;
        comentario?: string | null;
        message?: string;
      };
      if (!res.ok || typeof data.gabarito !== "number") {
        setErro(data.message ?? "Não foi possível verificar. Tente de novo.");
        setOcupado(false);
        return;
      }
      setRespostas((r) => ({ ...r, [q.id]: selecionada }));
      setFeedback({
        correta: Boolean(data.correta),
        gabarito: data.gabarito,
        comentario: data.comentario ?? null,
      });
      setOcupado(false);
    } catch {
      setErro("Falha de conexão. Tente de novo.");
      setOcupado(false);
    }
  }

  function continuar() {
    if (ultima) {
      void finalizar(respostas);
      return;
    }
    setFeedback(null);
    setSelecionada(null);
    setErro("");
    setIndice((n) => n + 1);
  }

  const semTempo = restante <= 60;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex items-center gap-3 border-b bg-surface px-4 py-3">
        <button
          type="button"
          onClick={() => setSaindo(true)}
          aria-label="Sair do simulado"
          className="flex-none rounded-lg p-1.5 text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          <XIcon size={20} aria-hidden />
        </button>
        <div
          className="h-2.5 flex-1 overflow-hidden rounded-full bg-background"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progresso do simulado"
        >
          <div
            className="h-full rounded-full bg-brand transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`inline-flex flex-none items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${
            semTempo
              ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400"
              : "text-muted"
          }`}
        >
          <ClockIcon size={13} aria-hidden />
          {formatarTempo(restante)}
        </span>
      </header>

      <div ref={corpoRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Questão {indice + 1} de {total} · {q.disciplina}
          </p>
          <p className="mt-3 whitespace-pre-line text-lg leading-relaxed">
            {q.enunciado}
          </p>

          <div
            role="radiogroup"
            aria-label={`Alternativas da questão ${indice + 1}`}
            className="mt-6 grid gap-2.5"
          >
            {q.alternativas.map((alt, i) => {
              const escolhida = selecionada === i;
              const eGabarito = feedback && i === feedback.gabarito;
              const marcouErrado = feedback && escolhida && !feedback.correta;

              let cls =
                "border-border bg-surface hover:border-brand/50 hover:bg-brand-soft/40";
              if (eGabarito) cls = "border-brand bg-brand-soft";
              else if (marcouErrado)
                cls = "border-red-500/50 bg-red-500/10";
              else if (feedback) cls = "border-border bg-surface opacity-55";
              else if (escolhida) cls = "border-brand bg-brand-soft";

              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={escolhida}
                  disabled={!!feedback || ocupado}
                  onClick={() => setSelecionada(i)}
                  className={`flex items-start gap-3 rounded-lg border p-3.5 text-left text-sm transition-colors disabled:cursor-default ${cls}`}
                >
                  <span
                    className={`grid h-6 w-6 flex-none place-items-center rounded-full border text-xs font-bold ${
                      eGabarito
                        ? "border-brand bg-brand text-white"
                        : marcouErrado
                          ? "border-red-500 bg-red-500 text-white"
                          : escolhida
                            ? "border-brand bg-brand text-white"
                            : "text-muted"
                    }`}
                  >
                    {LETRAS[i]}
                  </span>
                  <span className="pt-0.5">{alt}</span>
                </button>
              );
            })}
          </div>

          {erro && (
            <p className="mt-4 text-sm text-red-700 dark:text-red-400">{erro}</p>
          )}
        </div>
      </div>

      <div className="border-t bg-surface">
        <AnimatePresence>
          {feedback && (
            <motion.div
              key={indice}
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={
                feedback.correta ? "bg-[#062a1c] text-white" : "bg-red-500/10"
              }
            >
              <div className="mx-auto flex max-w-2xl items-start gap-3 px-4 py-4">
                <motion.span
                  initial={reduce ? false : { scale: 0.3, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14 }}
                  className="flex-none"
                >
                  {feedback.correta ? (
                    <StarIcon
                      size={26}
                      weight="fill"
                      className="text-accent"
                      aria-hidden
                    />
                  ) : (
                    <SmileySadIcon
                      size={26}
                      weight="fill"
                      className="text-red-600 dark:text-red-400"
                      aria-hidden
                    />
                  )}
                </motion.span>
                <div className="min-w-0 text-sm leading-relaxed">
                  <p className="font-semibold">
                    {feedback.correta
                      ? "Boa! Resposta certa."
                      : `Não foi dessa vez. Resposta certa: ${LETRAS[feedback.gabarito]}.`}
                  </p>
                  {feedback.comentario && (
                    <p
                      className={`mt-1 ${
                        feedback.correta ? "text-white/85" : "text-foreground/80"
                      }`}
                    >
                      {feedback.comentario}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-4">
          <span className="text-xs text-muted">
            {feitas} de {total} respondidas
          </span>
          {feedback ? (
            <button
              type="button"
              onClick={continuar}
              disabled={ocupado}
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-60"
            >
              {ultima
                ? ocupado
                  ? "Enviando"
                  : "Ver resultado"
                : "Continuar"}
              {!ultima && <CaretRightIcon size={15} weight="bold" aria-hidden />}
            </button>
          ) : (
            <button
              type="button"
              onClick={verificar}
              disabled={selecionada === null || ocupado}
              className="rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-40"
            >
              {ocupado ? "Verificando" : "Verificar"}
            </button>
          )}
        </div>
      </div>

      {saindo && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border bg-surface p-6">
            <p className="text-sm font-semibold">Sair do simulado?</p>
            <p className="mt-1 text-sm text-muted">
              Suas respostas até aqui ficam salvas. Você pode retomar de onde parou.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/simulado")}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                Sair
              </button>
              <button
                type="button"
                onClick={() => setSaindo(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-background"
              >
                Continuar no simulado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
