"use client";

import { useMemo, useState } from "react";
import {
  areasDisponiveis,
  escolaridadeLabel,
  filtrarVagas,
  gruposReserva,
  ufLabel,
  ufsDisponiveis,
  type Escolaridade,
  type FiltroVagas,
  type GrupoReservaId,
} from "@/lib/concurso";

const escolaridadeOpcoes: { valor: Escolaridade | "todas"; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "medio", label: "Médio" },
  { valor: "tecnico", label: "Técnico" },
  { valor: "superior", label: "Superior" },
];

export function VagasSection() {
  const [filtro, setFiltro] = useState<FiltroVagas>({
    escolaridade: "todas",
    area: "todas",
    uf: "todas",
    grupos: [],
  });

  const resultado = useMemo(() => filtrarVagas(filtro), [filtro]);

  function toggleGrupo(id: GrupoReservaId) {
    setFiltro((f) => ({
      ...f,
      grupos: f.grupos.includes(id)
        ? f.grupos.filter((g) => g !== id)
        : [...f.grupos, id],
    }));
  }

  const notasVisiveis = gruposReserva.filter(
    (g) => filtro.grupos.includes(g.id) && (!g.federal || g.percentual === 0),
  );

  return (
    <section id="vagas" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Quantas vagas são para você?
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Diga sua escolaridade, área, estado e situação. O total e as vagas
          reservadas ao seu perfil (cotas) atualizam na hora.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* ---------- Painel de filtros ---------- */}
          <form className="grid content-start gap-6 rounded-2xl border bg-surface p-6">
            <fieldset>
              <legend className="text-sm font-semibold">Escolaridade</legend>
              <div className="mt-2 flex flex-wrap gap-1 rounded-lg border p-1">
                {escolaridadeOpcoes.map((o) => (
                  <button
                    key={o.valor}
                    type="button"
                    onClick={() => setFiltro((f) => ({ ...f, escolaridade: o.valor }))}
                    className={`flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                      filtro.escolaridade === o.valor
                        ? "bg-brand text-white"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Área</span>
              <select
                value={filtro.area}
                onChange={(e) => setFiltro((f) => ({ ...f, area: e.target.value }))}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="todas">Todas as áreas</option>
                {areasDisponiveis.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Estado</span>
              <select
                value={filtro.uf}
                onChange={(e) => setFiltro((f) => ({ ...f, uf: e.target.value }))}
                className="rounded-lg border bg-background px-3 py-2"
              >
                <option value="todas">Todos os estados</option>
                {ufsDisponiveis.map((uf) => (
                  <option key={uf} value={uf}>
                    {ufLabel[uf] ?? uf}
                  </option>
                ))}
              </select>
            </label>

            <fieldset>
              <legend className="text-sm font-semibold">
                Reserva de vagas (cotas)
              </legend>
              <p className="mt-1 text-xs text-muted">
                Marque o que se aplica a você. Cotistas também disputam a ampla
                concorrência.
              </p>
              <div className="mt-3 grid gap-2">
                {gruposReserva.map((g) => (
                  <label
                    key={g.id}
                    className="flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
                  >
                    <input
                      type="checkbox"
                      checked={filtro.grupos.includes(g.id)}
                      onChange={() => toggleGrupo(g.id)}
                      className="mt-0.5 h-4 w-4 accent-brand"
                    />
                    <span>
                      <span className="font-medium">{g.label}</span>
                      {g.federal && g.percentual > 0 && (
                        <span className="ml-1 text-xs text-muted">
                          ({Math.round(g.percentual * 100)}%)
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {(filtro.escolaridade !== "todas" ||
              filtro.area !== "todas" ||
              filtro.uf !== "todas" ||
              filtro.grupos.length > 0) && (
              <button
                type="button"
                onClick={() =>
                  setFiltro({ escolaridade: "todas", area: "todas", uf: "todas", grupos: [] })
                }
                className="text-sm font-medium text-brand hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </form>

          {/* ---------- Resultado ---------- */}
          <div className="grid content-start gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border bg-surface p-6">
                <p className="text-sm text-muted">Vagas imediatas nos filtros</p>
                <p className="mt-1 text-4xl font-black tabular-nums">
                  {resultado.totalImediatas}
                </p>
                <p className="mt-1 text-xs text-muted">
                  em {resultado.totalCargos} cargo
                  {resultado.totalCargos === 1 ? "" : "s"} · {resultado.linhas.length}{" "}
                  localidade{resultado.linhas.length === 1 ? "" : "s"}
                </p>
              </div>
              <div
                className={`rounded-2xl border p-6 ${
                  filtro.grupos.length
                    ? "border-brand/40 bg-brand-soft"
                    : "bg-surface"
                }`}
              >
                <p className="text-sm text-muted">Reservadas ao seu perfil</p>
                <p className="mt-1 text-4xl font-black tabular-nums text-brand-strong">
                  {filtro.grupos.length ? resultado.reservadasParaVoce : "—"}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {filtro.grupos.length
                    ? "concorrência tende a ser menor nessas vagas"
                    : "marque uma opção de cota para ver"}
                </p>
              </div>
            </div>

            {resultado.porGrupo.length > 0 && (
              <div className="rounded-2xl border bg-surface p-5">
                <p className="text-sm font-semibold">Por grupo</p>
                <ul className="mt-2 divide-y text-sm">
                  {resultado.porGrupo.map(({ grupo, vagas }) => (
                    <li key={grupo.id} className="flex items-center justify-between gap-4 py-2">
                      <span>{grupo.label}</span>
                      <span className="font-semibold tabular-nums">
                        {grupo.percentual > 0 ? vagas : "sem reserva"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notasVisiveis.length > 0 && (
              <div className="space-y-2">
                {notasVisiveis.map((g) => (
                  <p
                    key={g.id}
                    className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs"
                  >
                    <strong>{g.label}:</strong> {g.nota}
                  </p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border bg-surface">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="border-b text-left text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Cargo</th>
                    <th className="px-4 py-3 font-medium">Localidade</th>
                    <th className="px-4 py-3 text-right font-medium">Imediatas</th>
                    <th className="px-4 py-3 text-right font-medium">Pro seu perfil</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {resultado.linhas.map((l) => (
                    <tr key={`${l.cargo.slug}-${l.uf}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{l.cargo.titulo}</div>
                        <div className="text-xs text-muted">
                          {escolaridadeLabel[l.cargo.escolaridade]} · {l.cargo.area}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {l.unidade}
                        <div className="text-xs">{ufLabel[l.uf] ?? l.uf}</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{l.imediatas}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-brand-strong">
                        {filtro.grupos.length ? l.reservadasParaVoce : "—"}
                      </td>
                    </tr>
                  ))}
                  {resultado.linhas.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-muted">
                        Nenhuma vaga com esses filtros nesta estimativa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted">
              Estimativas com base em concursos anteriores e no concurso Transpetro
              2026. As cotas seguem a Lei 12.990/2014 (negros) e o Decreto
              9.508/2018 (PcD). Números e regras serão substituídos pelos do edital
              oficial assim que publicado.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
