"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowSquareOutIcon,
  CoinsIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatBRL, formatData } from "@/lib/concursos";
import { HeroParticles } from "@/components/hero-particles";

interface Localidade {
  cidade: string;
  vagas: number;
}

export interface GuiaCargo {
  slug: string;
  nome: string;
  area: string;
  nivel: string;
  cargaHoraria: string | null;
  salario: number | null;
  imediatas: number;
  reserva: number;
  localidades: Localidade[];
}

interface GuiaConcurso {
  slug: string;
  nome: string;
  orgao: string;
  banca: string | null;
  resumo: string | null;
  dataProva: string | null;
  vagasOficial: number | null;
  fonteOficial: string | null;
}

function semAcento(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function GuiaIndex({
  concurso,
  concursos,
  atual,
  cargos,
}: {
  concurso: GuiaConcurso;
  concursos: { slug: string; nome: string }[];
  atual: string;
  cargos: GuiaCargo[];
}) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [nivel, setNivel] = useState("");
  const [area, setArea] = useState("");
  const [cidade, setCidade] = useState("");

  const niveis = useMemo(
    () => [...new Set(cargos.map((c) => c.nivel).filter(Boolean))].sort(),
    [cargos],
  );
  const areas = useMemo(
    () => [...new Set(cargos.map((c) => c.area).filter(Boolean))].sort(),
    [cargos],
  );
  const cidades = useMemo(
    () =>
      [
        ...new Set(cargos.flatMap((c) => c.localidades.map((l) => l.cidade))),
      ].sort(),
    [cargos],
  );

  const filtrados = useMemo(() => {
    const q = semAcento(busca.trim());
    return cargos.filter((c) => {
      if (nivel && c.nivel !== nivel) return false;
      if (area && c.area !== area) return false;
      if (cidade && !c.localidades.some((l) => l.cidade === cidade)) return false;
      if (q && !semAcento(`${c.nome} ${c.area} ${c.nivel}`).includes(q))
        return false;
      return true;
    });
  }, [cargos, busca, nivel, area, cidade]);

  const totalImediatas = cargos.reduce((s, c) => s + c.imediatas, 0);
  const totalReserva = cargos.reduce((s, c) => s + c.reserva, 0);

  const campo =
    "w-full rounded-lg border bg-surface px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";
  const rotulo =
    "mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted";

  return (
    <div>
      {/* HERO - centralizado, com o "banner" (skyline) do sitetocantins */}
      <section className="relative overflow-hidden px-4 py-14 text-center text-white sm:py-16">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMax slice"
          aria-hidden
        >
          <defs>
            <linearGradient id="gi-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#052624" />
              <stop offset="45%" stopColor="#083f3c" />
              <stop offset="78%" stopColor="#0b5e59" />
              <stop offset="100%" stopColor="#12716a" />
            </linearGradient>
            <radialGradient id="gi-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a7e8d8" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#3fb89a" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3fb89a" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="gi-shade" cx="50%" cy="34%" r="62%">
              <stop offset="0%" stopColor="#052624" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#052624" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width="1600" height="900" fill="url(#gi-sky)" />
          <circle cx="1230" cy="290" r="260" fill="url(#gi-sun)" />
          <g fill="#052624" opacity="0.9">
            <circle cx="220" cy="470" r="130" />
            <rect x="180" y="470" width="80" height="190" />
            <rect x="330" y="560" width="18" height="100" />
            <circle cx="339" cy="556" r="9" />
            <rect x="1000" y="500" width="16" height="160" />
            <circle cx="1008" cy="496" r="8" />
            <path d="M960,660 h120 v-70 a60,60 0 0 1 60,0 v70 h40 v20 h-220 z" />
            <rect x="90" y="620" width="70" height="40" rx="4" />
            <rect x="115" y="600" width="20" height="24" />
          </g>
          <rect x="0" y="660" width="1600" height="240" fill="#052624" opacity="0.55" />
          <path
            d="M0,672 Q80,662 160,672 T320,672 T480,672 T640,672 T800,672 T960,672 T1120,672 T1280,672 T1440,672 T1600,672"
            stroke="#12716a"
            strokeWidth="2"
            fill="none"
            opacity="0.5"
          />
          <g fill="#fff" opacity="0.85">
            <path
              d="M760,610 v-14 h6 v14 M757,600 h12"
              stroke="#fff"
              strokeWidth="2"
            />
            <rect x="748" y="612" width="30" height="20" rx="3" />
          </g>
          <ellipse cx="800" cy="330" rx="760" ry="270" fill="url(#gi-shade)" />
        </svg>

        <HeroParticles />

        <div className="relative z-10 mx-auto max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5be08a]" aria-hidden />
            Guia do candidato
            {concurso.banca ? ` · banca ${concurso.banca}` : ""}
          </span>
          <h1 className="mx-auto mt-4 max-w-2xl text-[clamp(1.7rem,4vw,2.6rem)] font-black leading-tight">
            {concurso.nome}
          </h1>
          {concurso.resumo && (
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/85">
              {concurso.resumo}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-x-9 gap-y-4 text-sm text-white/75">
            {[
              { b: cargos.length.toLocaleString("pt-BR"), s: "cargos" },
              {
                b: totalImediatas.toLocaleString("pt-BR"),
                s: "vagas imediatas",
              },
              {
                b: totalReserva.toLocaleString("pt-BR"),
                s: "cadastro de reserva",
              },
              {
                b: concurso.dataProva ? formatData(concurso.dataProva) : "a definir",
                s: "data da prova",
              },
            ].map((x) => (
              <span key={x.s}>
                <b className="block font-mono text-xl font-bold text-white tabular-nums">
                  {x.b}
                </b>
                {x.s}
              </span>
            ))}
          </div>

          {concurso.fonteOficial && (
            <div className="mt-8">
              <a
                href={concurso.fonteOficial}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold hover:bg-white/20"
              >
                Edital oficial
                <ArrowSquareOutIcon size={14} aria-hidden />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* FAIXA DE FILTRO (fundo claro) */}
      <section id="filtro" className="border-b bg-surface">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {concursos.length > 1 && (
                <label className="mb-3 block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted">
                    Concursos ({concursos.length})
                  </span>
                  <select
                    value={atual}
                    onChange={(e) => router.push(`/?c=${e.target.value}`)}
                    className="rounded-lg border bg-brand-soft/60 px-3 py-2 text-sm font-semibold text-brand-strong focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
                    aria-label="Trocar de concurso"
                  >
                    {concursos.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <MagnifyingGlassIcon size={15} className="text-brand" aria-hidden />
                Encontre seu cargo
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Filtre por nível, área
                {cidades.length > 0 ? ", cidade de lotação" : ""} ou busque pelo
                nome do cargo.
              </p>
            </div>

            <div className="flex gap-3">
              {[
                {
                  n: (concurso.vagasOficial ?? totalImediatas + totalReserva).toLocaleString(
                    "pt-BR",
                  ),
                  l: "vagas no edital",
                },
                { n: String(cargos.length), l: "cargos" },
                ...(cidades.length
                  ? [{ n: String(cidades.length), l: "cidades de lotação" }]
                  : []),
              ].map((x) => (
                <div
                  key={x.l}
                  className="rounded-xl border bg-background px-4 py-2 text-center"
                >
                  <div className="font-mono text-lg font-bold tabular-nums">
                    {x.n}
                  </div>
                  <div className="text-xs text-muted">{x.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border bg-surface p-4 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label>
                <span className={rotulo}>Nível</span>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className={campo}
                >
                  <option value="">Todos os níveis</option>
                  {niveis.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={rotulo}>Área</span>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className={campo}
                >
                  <option value="">Todas as áreas</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              {cidades.length > 0 && (
                <label>
                  <span className={rotulo}>Cidade de lotação</span>
                  <select
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className={campo}
                  >
                    <option value="">Todas as cidades</option>
                    {cidades.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className={cidades.length === 0 ? "lg:col-span-2" : ""}>
                <span className={rotulo}>Buscar</span>
                <input
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Nome do cargo"
                  className={campo}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* GRADE */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-muted">
          {filtrados.length} {filtrados.length === 1 ? "cargo" : "cargos"}
        </p>

        {filtrados.length === 0 ? (
          <p className="mt-6 rounded-2xl border bg-surface p-6 text-sm text-muted">
            Nenhum cargo encontrado para essa busca.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((c) => {
              const chips = c.localidades
                .slice()
                .sort((a, b) => b.vagas - a.vagas);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/concurso/${atual}/vaga/${c.slug}`}
                    className="flex h-full flex-col rounded-2xl border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-brand-strong">
                        {c.area}
                      </span>
                      {c.nivel && (
                        <span className="rounded-full border bg-background px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wide text-muted">
                          {c.nivel}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-3 font-semibold leading-snug">{c.nome}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {[
                        c.cargaHoraria,
                        `${c.localidades.length || "-"} ${
                          c.localidades.length === 1 ? "localidade" : "localidades"
                        }`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>

                    <p className="mt-3 flex items-center gap-1.5 border-b pb-3 text-sm font-bold">
                      <CoinsIcon size={14} className="text-muted" aria-hidden />
                      {c.salario ? formatBRL(c.salario, false) : "conforme edital"}
                      <span className="text-[0.68rem] font-normal uppercase tracking-wide text-muted">
                        salário básico
                      </span>
                    </p>

                    <div className="mt-3 flex gap-2.5">
                      <div className="flex-1 rounded-xl bg-brand-soft px-3 py-2 text-center">
                        <span className="block font-mono text-lg font-bold text-brand-strong tabular-nums">
                          {c.imediatas}
                        </span>
                        <span className="text-[0.62rem] font-bold uppercase tracking-wide text-brand">
                          vagas imediatas
                        </span>
                      </div>
                      <div className="flex-1 rounded-xl bg-background px-3 py-2 text-center">
                        <span className="block font-mono text-lg font-bold tabular-nums">
                          {c.reserva}
                        </span>
                        <span className="text-[0.62rem] font-bold uppercase tracking-wide text-muted">
                          cadastro de reserva
                        </span>
                      </div>
                    </div>

                    {chips.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {chips.slice(0, 4).map((l) => (
                          <span
                            key={l.cidade}
                            className="rounded-full bg-background px-2 py-0.5 text-[0.68rem] text-muted"
                          >
                            {l.cidade} ({l.vagas})
                          </span>
                        ))}
                        {chips.length > 4 && (
                          <span className="rounded-full bg-background px-2 py-0.5 text-[0.68rem] font-medium text-brand">
                            +{chips.length - 4} cidades
                          </span>
                        )}
                      </div>
                    )}

                    <span className="flex-1" />
                    <span className="mt-4 rounded-lg border-[1.5px] border-brand px-4 py-2 text-center text-sm font-bold text-brand transition-colors hover:bg-brand-soft">
                      Saiba mais →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
