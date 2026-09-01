"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CoinsIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatBRL, formatData } from "@/lib/concursos";

export interface GuiaCargo {
  slug: string;
  nome: string;
  area: string;
  nivel: string;
  salario: number | null;
  imediatas: number;
  reserva: number;
  localidades: number;
}

interface GuiaConcurso {
  slug: string;
  nome: string;
  orgao: string;
  banca: string | null;
  resumo: string | null;
  dataProva: string | null;
  vagasOficial: number | null;
}

// Paleta por edital (Transpetro), no espírito do site/index.html.
const PALETA: Record<string, { barra: string; tag: string; texto: string }> = {
  "01": { barra: "#0f6e3f", tag: "#e6f3ec", texto: "#0a4c2b" },
  "02": { barra: "#0b5aa3", tag: "#e6eefb", texto: "#073d70" },
  "03": { barra: "#8a5a08", tag: "#fbf1e0", texto: "#5c3c05" },
  "04": { barra: "#7a1fa2", tag: "#f2e6f9", texto: "#521470" },
};
const PADRAO = { barra: "#0f6e3f", tag: "#e6f3ec", texto: "#0a4c2b" };

function paletaDe(area: string) {
  const m = area.match(/edital\s*0?(\d)/i);
  return (m && PALETA[`0${m[1]}`]) || PADRAO;
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

  const niveis = useMemo(
    () => [...new Set(cargos.map((c) => c.nivel).filter(Boolean))].sort(),
    [cargos],
  );

  const filtrados = useMemo(() => {
    const q = semAcento(busca.trim());
    return cargos.filter((c) => {
      if (nivel && c.nivel !== nivel) return false;
      if (q && !semAcento(`${c.nome} ${c.area} ${c.nivel}`).includes(q))
        return false;
      return true;
    });
  }, [cargos, busca, nivel]);

  const totalImediatas = cargos.reduce((s, c) => s + c.imediatas, 0);
  const totalReserva = cargos.reduce((s, c) => s + c.reserva, 0);

  return (
    <div>
      {/* HERO estilo site/ */}
      <section
        className="text-white"
        style={{
          background:
            "linear-gradient(135deg, #0a4c2b 0%, #0b5aa3 45%, #521470 100%)",
        }}
      >
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/75">
            Guia do candidato{concurso.banca ? ` · banca ${concurso.banca}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-[2.4rem] sm:leading-tight">
            {concurso.nome}
          </h1>
          <p className="mt-1 text-sm text-white/70">{concurso.orgao}</p>
          {concurso.resumo && (
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-white/90">
              {concurso.resumo}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
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
                b: concurso.dataProva
                  ? formatData(concurso.dataProva)
                  : "a definir",
                s: "prova",
              },
            ].map((x) => (
              <div
                key={x.s}
                className="min-w-[130px] rounded-xl border border-white/25 bg-white/10 px-4 py-2.5"
              >
                <span className="block font-mono text-xl font-bold tabular-nums">
                  {x.b}
                </span>
                <span className="text-xs text-white/75">{x.s}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="relative block w-full max-w-md">
              <MagnifyingGlassIcon
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden
              />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por cargo, edital ou nível"
                aria-label="Buscar cargo"
                className="w-full rounded-lg border-none bg-white py-3 pl-10 pr-4 text-sm text-foreground shadow-lg placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-white/60"
              />
            </label>

            {concursos.length > 1 && (
              <select
                value={atual}
                onChange={(e) => router.push(`/?c=${e.target.value}`)}
                aria-label="Trocar de concurso"
                className="rounded-lg border-none bg-white/15 px-3 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                {concursos.map((c) => (
                  <option key={c.slug} value={c.slug} className="text-foreground">
                    {c.nome}
                  </option>
                ))}
              </select>
            )}

            {niveis.length > 1 && (
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value)}
                aria-label="Filtrar por nível"
                className="rounded-lg border-none bg-white/15 px-3 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/60"
              >
                <option value="" className="text-foreground">
                  Todos os níveis
                </option>
                {niveis.map((n) => (
                  <option key={n} value={n} className="text-foreground">
                    {n}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </section>

      {/* GRADE DE CARGOS */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-sm text-muted">
          {filtrados.length} {filtrados.length === 1 ? "cargo" : "cargos"}
          {concurso.vagasOficial
            ? ` · ${concurso.vagasOficial.toLocaleString("pt-BR")} vagas no edital`
            : ""}
        </p>

        {filtrados.length === 0 ? (
          <p className="mt-6 rounded-2xl border bg-surface p-6 text-sm text-muted">
            Nenhum cargo encontrado para essa busca.
          </p>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((c) => {
              const p = paletaDe(c.area);
              return (
                <li key={c.slug}>
                  <Link
                    href={`/concurso/${atual}/vaga/${c.slug}`}
                    className="group flex h-full flex-col rounded-xl border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderLeft: `4px solid ${p.barra}` }}
                  >
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{ background: p.tag, color: p.texto }}
                      >
                        {c.area}
                      </span>
                      {c.nivel && (
                        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                          {c.nivel}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-semibold leading-snug">{c.nome}</h3>

                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-bold">
                      <CoinsIcon size={14} className="text-muted" aria-hidden />
                      {c.salario ? formatBRL(c.salario, false) : "conforme edital"}
                      <span className="text-xs font-normal text-muted">
                        salário básico
                      </span>
                    </p>

                    <div className="mt-2 flex flex-col gap-1.5">
                      <span
                        className="flex items-baseline gap-2 rounded-lg border px-3 py-2"
                        style={{ background: "#e6f3ec", borderColor: "#b7ddc7" }}
                      >
                        <b className="font-mono text-xl leading-none text-[#0f6e3f] tabular-nums">
                          {c.imediatas}
                        </b>
                        <span className="text-xs font-bold text-[#1f5138]">
                          vagas imediatas
                        </span>
                      </span>
                      <span className="flex items-baseline gap-2 px-3 opacity-80">
                        <b className="font-mono text-sm leading-none text-[#96650a] tabular-nums">
                          {c.reserva}
                        </b>
                        <span className="text-xs text-muted">
                          cadastro de reserva
                        </span>
                      </span>
                    </div>

                    <span className="flex-1" />

                    <span className="mt-3 rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white transition-colors group-hover:bg-brand-strong">
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
