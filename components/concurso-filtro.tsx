"use client";

import { FunnelIcon } from "@phosphor-icons/react/dist/ssr";
import {
  formatBRL,
  opcoesSalarioMinimo,
  type Escolaridade,
  type FiltroConcursos,
  type FiltroSituacao,
  type ResumoConcursos,
} from "@/lib/concursos";

const escolaridades: { valor: Escolaridade | "todas"; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "medio", label: "Médio" },
  { valor: "tecnico", label: "Técnico" },
  { valor: "superior", label: "Superior" },
];

const situacoes: { valor: FiltroSituacao; label: string }[] = [
  { valor: "todas", label: "Abertos e previstos" },
  { valor: "inscricoes_abertas", label: "Só inscrições abertas" },
  { valor: "previsto", label: "Só previstos" },
];

interface Props {
  filtro: FiltroConcursos;
  onFiltroChange: (f: FiltroConcursos) => void;
  resumo: ResumoConcursos;
  ativo: boolean;
  onLimpar: () => void;
}

export function ConcursoFiltro({
  filtro,
  onFiltroChange,
  resumo,
  ativo,
  onLimpar,
}: Props) {
  const set = <K extends keyof FiltroConcursos>(k: K, v: FiltroConcursos[K]) =>
    onFiltroChange({ ...filtro, [k]: v });

  return (
    <section
      id="filtro"
      aria-label="Filtrar concursos pelo seu perfil"
      className="border-b bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <FunnelIcon size={16} weight="bold" className="text-brand" aria-hidden />
            Seu perfil
          </span>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Escolaridade</span>
            <div className="flex gap-1 rounded-lg border p-0.5">
              {escolaridades.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => set("escolaridade", o.valor)}
                  aria-pressed={filtro.escolaridade === o.valor}
                  className={`rounded-md px-2.5 py-1 text-sm font-medium transition-colors ${
                    filtro.escolaridade === o.valor
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Situação</span>
            <select
              value={filtro.situacao}
              onChange={(e) => set("situacao", e.target.value as FiltroSituacao)}
              className="rounded-lg border bg-background px-2.5 py-1.5 text-sm"
            >
              {situacoes.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">Salário</span>
            <select
              value={filtro.salarioMinimo}
              onChange={(e) => set("salarioMinimo", Number(e.target.value))}
              className="rounded-lg border bg-background px-2.5 py-1.5 text-sm"
            >
              {opcoesSalarioMinimo.map((o) => (
                <option key={o.valor} value={o.valor}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {ativo && (
            <button
              type="button"
              onClick={onLimpar}
              className="text-sm font-medium text-brand hover:underline"
            >
              Limpar
            </button>
          )}
        </div>

        <p className="mt-3 text-sm">
          {resumo.total === 0 ? (
            <span className="text-muted">
              Nenhum concurso com esse perfil. Ajuste os filtros acima.
            </span>
          ) : (
            <>
              <strong className="font-mono tabular-nums">{resumo.total}</strong>{" "}
              {resumo.total === 1 ? "concurso" : "concursos"} para o seu perfil
              {resumo.salarioMin !== null && resumo.salarioMax !== null && (
                <>
                  {" "}
                  <span className="text-muted">
                    salários de {formatBRL(resumo.salarioMin)} a{" "}
                    {formatBRL(resumo.salarioMax)}
                  </span>
                </>
              )}
              .
            </>
          )}
        </p>
      </div>
    </section>
  );
}
