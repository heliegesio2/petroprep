"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CaretRightIcon, MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { formatBRL } from "@/lib/concursos";

export interface CargoView {
  slug: string;
  nome: string;
  area: string;
  nivel: string;
  salario: number | null;
  imediatas: number;
  reserva: number;
  localidades: number;
}

const inputBase =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25";

export function CargoLista({
  concursoSlug,
  cargos,
}: {
  concursoSlug: string;
  cargos: CargoView[];
}) {
  const [busca, setBusca] = useState("");
  const [nivel, setNivel] = useState("");
  const [area, setArea] = useState("");

  const niveis = useMemo(
    () => [...new Set(cargos.map((c) => c.nivel))].sort(),
    [cargos],
  );
  const areas = useMemo(
    () => [...new Set(cargos.map((c) => c.area))].sort(),
    [cargos],
  );

  const filtrados = useMemo(() => {
    const q = busca
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
    return cargos.filter((c) => {
      if (nivel && c.nivel !== nivel) return false;
      if (area && c.area !== area) return false;
      if (
        q &&
        !`${c.nome} ${c.area}`
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [cargos, busca, nivel, area]);

  return (
    <div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <label className="relative">
          <MagnifyingGlassIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cargo"
            className={`${inputBase} pl-9`}
            aria-label="Buscar cargo"
          />
        </label>
        <select
          value={nivel}
          onChange={(e) => setNivel(e.target.value)}
          className={inputBase}
          aria-label="Nível"
        >
          <option value="">Todos os níveis</option>
          {niveis.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className={inputBase}
          aria-label="Área"
        >
          <option value="">Todas as áreas</option>
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <p className="mt-3 text-xs text-muted">
        {filtrados.length} {filtrados.length === 1 ? "cargo" : "cargos"}
      </p>

      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {filtrados.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/concurso/${concursoSlug}/vaga/${c.slug}`}
              className="flex h-full flex-col rounded-2xl border bg-surface p-4 transition-colors hover:border-brand/50"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-strong">
                    {c.nivel}
                  </span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                    {c.area}
                  </span>
                </span>
                <CaretRightIcon size={16} className="flex-none text-muted" aria-hidden />
              </div>
              <p className="mt-2 font-semibold leading-tight">{c.nome}</p>
              <p className="mt-1 text-xs text-muted">
                {c.localidades} {c.localidades === 1 ? "cidade" : "cidades"}
              </p>
              <div className="mt-3 flex items-end justify-between border-t pt-3">
                <span>
                  <span className="block text-xs text-muted">salário básico</span>
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {c.salario ? formatBRL(c.salario, false) : "-"}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-xs text-muted">vagas</span>
                  <span className="font-mono text-sm font-bold tabular-nums">
                    {c.imediatas}
                    <span className="font-normal text-muted"> + {c.reserva} CR</span>
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
