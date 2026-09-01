"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeftIcon, CaretRightIcon, GraduationCapIcon, ArrowUpRightIcon, IdentificationCardIcon, BookOpenIcon } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";
import {
  formatBRL,
  formatData,
  imagemDoConcurso,
  linkInscricaoDoConcurso,
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
  const reduce = useReducedMotion();

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
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 opacity-60"
        style={{
          background:
            "radial-gradient(60% 100% at 50% 0%, rgba(43,182,115,0.22), transparent 70%)",
        }}
        aria-hidden
      />

      <div className="mx-auto flex max-w-6xl items-stretch gap-2 px-2 pt-6 sm:gap-4 sm:px-4 sm:pt-10">
        <Seta direcao="anterior" onClick={() => ir(-1)} />

        <div className="min-w-0 flex-1">
          <motion.div
            key={concurso.slug}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <Slide concurso={concurso} />
          </motion.div>
        </div>

        <Seta direcao="proximo" onClick={() => ir(1)} />
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-4 py-5">
        <span className="font-mono text-xs text-white/50">
          {atual + 1} / {total}
        </span>
        <label className="flex items-center gap-2 text-xs text-white/60">
          <span className="hidden sm:inline">Ir para</span>
          <select
            value={atual}
            onChange={(e) => onAtualChange(Number(e.target.value))}
            className="max-w-[16rem] rounded-lg border border-white/15 bg-[#0a3a27] px-2.5 py-1.5 text-sm text-white"
            aria-label="Escolher concurso"
          >
            <optgroup label="Inscrições abertas">
              {concursos.map((c, i) =>
                c.status === "inscricoes_abertas" ? (
                  <option key={c.slug} value={i}>
                    {c.tituloCompleto}
                  </option>
                ) : null,
              )}
            </optgroup>
            <optgroup label="Previstos (sem edital)">
              {concursos.map((c, i) =>
                c.status === "previsto" ? (
                  <option key={c.slug} value={i}>
                    {c.tituloCompleto}
                  </option>
                ) : null,
              )}
            </optgroup>
          </select>
        </label>
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
  const Icon = direcao === "anterior" ? CaretLeftIcon : CaretRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direcao === "anterior" ? "Concurso anterior" : "Próximo concurso"}
      className="grid w-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white active:scale-[0.97] sm:w-12"
    >
      <Icon size={22} weight="bold" aria-hidden />
    </button>
  );
}

function Slide({ concurso }: { concurso: Concurso }) {
  const temPainel = Boolean(concurso.dataProva);
  const linkInscricao = linkInscricaoDoConcurso(concurso);
  const salario = concurso.salarioAte
    ? concurso.salarioDe
      ? `${formatBRL(concurso.salarioDe)} a ${formatBRL(concurso.salarioAte)}`
      : `até ${formatBRL(concurso.salarioAte)}`
    : null;

  return (
    <div className="grid gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7 lg:grid-cols-[1.25fr_1fr]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {concurso.destaque && (
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

        <h1 className="mt-3 text-3xl font-black leading-[1.1] tracking-tight sm:text-4xl">
          {concurso.tituloCompleto}
        </h1>
        <p className="mt-1 text-sm text-white/60">{concurso.orgao}</p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
          {concurso.resumo}
        </p>

        {!temPainel && (
          <p className="mt-3 max-w-xl text-sm text-white/70">
            {concurso.status === "previsto"
              ? "Edital ainda não publicado. Quem assina o Plano Completo é avisado assim que sair."
              : concurso.inscricoesAte
                ? `Inscrições abertas até ${formatData(concurso.inscricoesAte)}. Datas da prova no edital oficial.`
                : "Inscrições abertas. Confira as datas no edital oficial."}
          </p>
        )}

        <dl className="mt-5 grid max-w-lg grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          {concurso.vagasTotais && (
            <div>
              <dt className="text-white/50">Vagas</dt>
              <dd className="text-lg font-bold tabular-nums">
                {concurso.vagasTotais.toLocaleString("pt-BR")}
              </dd>
            </div>
          )}
          {salario && (
            <div>
              <dt className="text-white/50">Salário</dt>
              <dd className="text-lg font-bold">{salario}</dd>
            </div>
          )}
          {concurso.inscricoesAte && (
            <div>
              <dt className="text-white/50">Inscrições até</dt>
              <dd className="text-lg font-bold tabular-nums">
                {formatData(concurso.inscricoesAte)}
              </dd>
            </div>
          )}
          <div className="col-span-2 flex items-start gap-1.5 sm:col-span-3">
            <GraduationCapIcon
              size={16}
              weight="fill"
              className="mt-0.5 flex-none text-accent"
              aria-hidden
            />
            <span className="text-white/75">{concurso.escolaridadeTexto}</span>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          {concurso.linkGuia ? (
            <Link
              href={concurso.linkGuia}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#062a1c] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <BookOpenIcon size={16} weight="fill" aria-hidden />
              Ver guia completo
            </Link>
          ) : (
            <a
              href="#planos"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#062a1c] transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Assinar
            </a>
          )}
          {linkInscricao && (
            <a
              href={linkInscricao}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/15"
            >
              <IdentificationCardIcon size={16} weight="bold" aria-hidden />
              Inscrição e taxa
              <ArrowUpRightIcon size={13} weight="bold" aria-hidden />
            </a>
          )}
        </div>
        <p className="mt-2 text-xs text-white/50">
          {linkInscricao
            ? "O cadastro e o pagamento da taxa são feitos no site oficial do concurso."
            : "O cadastro e o pagamento da taxa são feitos no site do órgão organizador."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={imagemDoConcurso(concurso)}
            alt={`Imagem ilustrativa: ${concurso.orgao}`}
            fill
            priority
            sizes="(min-width: 1024px) 380px, 100vw"
            className="object-cover"
          />
        </div>
        {temPainel && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-xs font-semibold text-white/60">
              Contagem regressiva para a prova
            </p>
            <div className="mt-2">
              <Countdown target={concurso.dataProva!} />
            </div>
            <p className="mt-2 text-xs text-white/60">
              Prova em {formatData(concurso.dataProva!)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
