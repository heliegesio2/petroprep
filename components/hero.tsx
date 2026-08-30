import Link from "next/link";
import { concurso, formatBRL } from "@/lib/concurso";
import { Countdown } from "@/components/countdown";

const dataProvaLabel = new Date(concurso.dataProvaEstimada).toLocaleDateString(
  "pt-BR",
  { day: "2-digit", month: "long", year: "numeric" },
);

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Preparação antecipada · edital previsto para 2026/2027
          </span>

          <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
            Sua aprovação no próximo{" "}
            <span className="text-brand">concurso da Petrobras</span> começa
            antes do edital.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted">
            Simulados no estilo {concurso.bancaProvavel}, conteúdo programático já
            organizado por cargo e um buscador de vagas que mostra só as
            oportunidades para a sua escolaridade e área.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#lista"
              className="rounded-lg bg-brand px-5 py-3 font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Entrar na lista de espera
            </Link>
            <Link
              href="#conteudo"
              className="rounded-lg border px-5 py-3 font-semibold transition-colors hover:bg-surface"
            >
              Ver o que cai na prova
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-muted">Vagas imediatas*</dt>
              <dd className="text-2xl font-bold">
                ~{concurso.numeros.vagasImediatasEstimadas}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Cadastro de reserva*</dt>
              <dd className="text-2xl font-bold">
                ~{concurso.numeros.cadastroReservaEstimado.toLocaleString("pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Salário inicial até*</dt>
              <dd className="text-2xl font-bold">
                {formatBRL(concurso.numeros.salarioInicialMaximo)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted">
            *Estimativas com base em concursos anteriores e no concurso Transpetro
            2026. Serão revisadas quando o edital oficial for publicado.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-2xl border bg-surface p-6">
          <p className="text-sm font-semibold text-muted">
            Contagem regressiva estimada para a prova
          </p>
          <Countdown target={concurso.dataProvaEstimada} />
          <p className="text-sm text-muted">
            Data-alvo de estudo: <strong>{dataProvaLabel}</strong>. Ajustaremos
            assim que a banca divulgar o cronograma oficial.
          </p>
          <hr />
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <Check /> Plano de estudos a partir do dia que você entra
            </li>
            <li className="flex gap-2">
              <Check /> Resumo do edital no seu e-mail assim que sair
            </li>
            <li className="flex gap-2">
              <Check /> Acesso antecipado aos simulados
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 flex-none text-brand"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.79a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
