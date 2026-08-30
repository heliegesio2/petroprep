import Link from "next/link";
import { concurso, formatBRL } from "@/lib/concurso";
import { Countdown } from "@/components/countdown";

const dataProvaLabel = new Date(concurso.dataProvaEstimada).toLocaleDateString(
  "pt-BR",
  { day: "2-digit", month: "long", year: "numeric" },
);

export function Hero() {
  return (
    <section
      id="top"
      className="relative isolate overflow-hidden bg-[#062a1c] text-white"
    >
      {/* camadas do banner */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(115deg, #04211610 0%, #062a1c 42%, #0a3a27 100%)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.12] mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
          backgroundSize: "26px 26px",
        }}
        aria-hidden
      />
      <Refinery />

      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Preparação antecipada · edital previsto para 2026/2027
          </span>

          <h1 className="mt-5 text-4xl font-black leading-[1.1] tracking-tight sm:text-5xl">
            Sua aprovação no próximo{" "}
            <span className="text-accent">concurso da Petrobras</span> começa
            antes do edital.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/80">
            Simulados no estilo {concurso.bancaProvavel}, conteúdo programático já
            organizado por cargo e um buscador de vagas que mostra quantas
            oportunidades — e quantas cotas — são para o seu perfil.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="#lista"
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-[#062a1c] transition-transform hover:-translate-y-0.5"
            >
              Entrar na lista de espera
            </Link>
            <Link
              href="#vagas"
              className="rounded-lg border border-white/25 bg-white/5 px-5 py-3 font-semibold backdrop-blur transition-colors hover:bg-white/10"
            >
              Ver vagas para o meu perfil
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-sm">
            <div>
              <dt className="text-white/60">Vagas imediatas*</dt>
              <dd className="text-2xl font-bold">
                ~{concurso.numeros.vagasImediatasEstimadas}
              </dd>
            </div>
            <div>
              <dt className="text-white/60">Cadastro de reserva*</dt>
              <dd className="text-2xl font-bold">
                ~{concurso.numeros.cadastroReservaEstimado.toLocaleString("pt-BR")}
              </dd>
            </div>
            <div>
              <dt className="text-white/60">Salário inicial até*</dt>
              <dd className="text-2xl font-bold">
                {formatBRL(concurso.numeros.salarioInicialMaximo)}
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-white/50">
            *Estimativas com base em concursos anteriores e no concurso Transpetro
            2026. Serão revisadas quando o edital oficial for publicado.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
          <p className="text-sm font-semibold text-white/70">
            Contagem regressiva estimada para a prova
          </p>
          <Countdown target={concurso.dataProvaEstimada} />
          <p className="text-sm text-white/70">
            Data-alvo de estudo: <strong>{dataProvaLabel}</strong>. Ajustaremos
            assim que a banca divulgar o cronograma oficial.
          </p>
          <hr className="border-white/15" />
          <ul className="space-y-2 text-sm text-white/85">
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
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-none text-accent" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.79a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/** Silhueta de refinaria/dutos no rodapé do banner. */
function Refinery() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 w-full text-white/[0.06]"
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      fill="currentColor"
      aria-hidden
    >
      <path d="M0 160V96h40v-24h20v24h40V64h16v96H0Z" />
      <path d="M150 160V72h60v20h20v-40h14v108h-94Z" />
      <path d="M280 160V40h10v20h24V44h10v116h-44Z" />
      <rect x="360" y="70" width="120" height="90" />
      <path d="M360 70l60-34 60 34" />
      <rect x="520" y="96" width="26" height="64" />
      <rect x="556" y="80" width="26" height="80" />
      <rect x="592" y="104" width="26" height="56" />
      <path d="M660 160V56h12v18h30V40h12v120h-54Z" />
      <rect x="760" y="60" width="90" height="100" />
      <circle cx="805" cy="52" r="16" />
      <path d="M900 160V88h30v-24h16v24h30v-14h14v86H900Z" />
      <path d="M1040 160V48h10v24h30V52h10v108h-50Z" />
      <rect x="1130" y="84" width="24" height="76" />
      <rect x="1160" y="70" width="24" height="90" />
    </svg>
  );
}
