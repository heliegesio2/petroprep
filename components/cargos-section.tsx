"use client";

import { useMemo, useState } from "react";
import {
  cargos,
  escolaridadeLabel,
  formatBRL,
  type Escolaridade,
} from "@/lib/concurso";

type Filtro = Escolaridade | "todos";

const filtros: { valor: Filtro; label: string }[] = [
  { valor: "todos", label: "Todos" },
  { valor: "medio", label: "Médio" },
  { valor: "tecnico", label: "Técnico" },
  { valor: "superior", label: "Superior" },
];

export function CargosSection() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [area, setArea] = useState<string>("todas");

  const areas = useMemo(
    () => ["todas", ...Array.from(new Set(cargos.map((c) => c.area))).sort()],
    [],
  );

  const lista = cargos.filter(
    (c) =>
      (filtro === "todos" || c.escolaridade === filtro) &&
      (area === "todas" || c.area === area),
  );

  return (
    <section id="cargos" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Cargos e vagas — filtre pelas que são para você
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Uma prévia do buscador de vagas. Na plataforma completa você também
          filtra por estado, unidade e concorrência estimada.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-1 rounded-lg border bg-surface p-1">
            {filtros.map((f) => (
              <button
                key={f.valor}
                type="button"
                onClick={() => setFiltro(f.valor)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  filtro === f.valor
                    ? "bg-brand text-white"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="rounded-lg border bg-surface px-3 py-2 text-sm"
            aria-label="Filtrar por área"
          >
            {areas.map((a) => (
              <option key={a} value={a}>
                {a === "todas" ? "Todas as áreas" : a}
              </option>
            ))}
          </select>

          <span className="text-sm text-muted">
            {lista.length} cargo{lista.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lista.map((c) => (
            <article key={c.slug} className="flex flex-col rounded-2xl border bg-surface p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-strong">
                  {escolaridadeLabel[c.escolaridade]}
                </span>
                <span className="text-xs text-muted">{c.area}</span>
              </div>
              <h3 className="mt-3 font-semibold leading-snug">{c.titulo}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{c.requisito}</p>
              <p className="mt-4 text-sm">
                A partir de{" "}
                <strong className="text-foreground">{formatBRL(c.salario)}</strong>
                <span className="text-muted"> /mês*</span>
              </p>
            </article>
          ))}
          {lista.length === 0 && (
            <p className="text-sm text-muted">
              Nenhum cargo com esses filtros nesta prévia.
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-muted">
          *Faixas salariais de referência de concursos anteriores. Números e
          cargos serão atualizados conforme o edital oficial.
        </p>
      </div>
    </section>
  );
}
