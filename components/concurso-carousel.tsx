"use client";

import Link from "next/link";
import {
  formatBRL,
  formatData,
  statusLabel,
  type Concurso,
} from "@/lib/concursos";
import { Countdown } from "@/components/countdown";

interface Props {
  concursos: Concurso[];
  atual: number;
  onAtualChange: (indice: number) => void;
}

export function ConcursoCarousel({ concursos, atual, onAtualChange }: Props) {
  const concurso = concursos[atual];
  const total = concursos.length;

  function ir(delta: number) {
    onAtualChange((atual + delta + total) % total);
  }

  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[#062a1c] text-white"
      aria-roledescription="carrossel de concursos"
    >
      <div
        className="absolute inset-0 -z-10 opacity-[0.10] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
        aria-hidden
      />

      <div className="mx-auto flex max-w-6xl items-stretch gap-2 px-2 py-6 sm:gap-4 sm:px-4 sm:py-8">
        <Seta direcao="anterior" onClick={() => ir(-1)} />

        <div className="min-w-0 flex-1">
          <Slide concurso={concurso} />
        </div>

        <Seta direcao="proximo" onClick={() => ir(1)} />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5 px-4 pb-5">
        {concursos.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => onAtualChange(i)}
            aria-label={`Ver ${c.nome}`}
            aria-current={i === atual}
            className={`h-1.5 rounded-full transition-all ${
              i === atual ? "w-6 bg-accent" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

function Seta({
  direcao,
  onClick,
}: {
  direcao: "anterior" | "proximo";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direcao === "anterior" ? "Concurso anterior" : "Próximo concurso"}
      className="grid w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white sm:w-12"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {direcao === "anterior" ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

function Slide({ concurso }: { concurso: Concurso }) {
  const destaque = concurso.destaque;
  const temPainel = Boolean(concurso.dataProva);

  return (
    <div
      className={`grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 ${
        temPainel ? "lg:grid-cols-[1.3fr_1fr]" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {destaque && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[#062a1c]">
              Destaque
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              concurso.status === "inscricoes_abertas"
                ? "bg-white/15 text-white"
                : "border border-white/20 text-white/70"
            }`}
          >
            {statusLabel[concurso.status]}
          </span>
          {concurso.banca && (
            <span className="text-white/50">Banca {concurso.banca}</span>
          )}
        </div>

        <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight sm:text-3xl lg:text-4xl">
          {concurso.tituloCompleto}
        </h1>
        <p className="mt-1 text-sm text-white/60">{concurso.orgao}</p>
        <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
          {concurso.resumo}
        </p>

        {!temPainel && (
          <p className="mt-3 text-sm text-white/70">
            {concurso.status === "previsto"
              ? "Edital ainda não publicado — quem assina o Plano Completo é avisado assim que sair."
              : concurso.inscricoesAte
                ? `Inscrições abertas até ${formatData(concurso.inscricoesAte)}. Datas da prova no edital oficial.`
                : "Inscrições abertas — confira as datas no edital oficial."}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {concurso.vagasTotais && (
            <div>
              <dt className="text-white/50">Vagas</dt>
              <dd className="text-lg font-bold">
                {concurso.vagasTotais.toLocaleString("pt-BR")}
              </dd>
            </div>
          )}
          {concurso.salarioAte && (
            <div>
              <dt className="text-white/50">Salário até</dt>
              <dd className="text-lg font-bold">
                {formatBRL(concurso.salarioAte)}
              </dd>
            </div>
          )}
          {concurso.inscricoesAte && (
            <div>
              <dt className="text-white/50">Inscrições até</dt>
              <dd className="text-lg font-bold">
                {formatData(concurso.inscricoesAte)}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href="#planos"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#062a1c] transition-transform hover:-translate-y-0.5"
          >
            Assinar e estudar
          </Link>
          {concurso.linkOficial && (
            <a
              href={concurso.linkOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              Edital oficial ↗
            </a>
          )}
        </div>
      </div>

      {temPainel && (
        <div className="flex flex-col justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-xs font-semibold text-white/60">
            Contagem regressiva para a prova
          </p>
          <Countdown target={concurso.dataProva!} />
          <p className="text-xs text-white/60">
            Prova em {formatData(concurso.dataProva!)}
          </p>
        </div>
      )}
    </div>
  );
}
