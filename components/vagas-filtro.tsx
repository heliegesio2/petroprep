"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  areasDoConcurso,
  escolaridadeLabel,
  filtroVazio,
  filtrarVagas,
  gruposReservaPadrao,
  ufLabel,
  ufsDoConcurso,
  type Concurso,
  type Escolaridade,
  type FiltroVagas,
  type GrupoReservaId,
} from "@/lib/concursos";

const escolaridadeOpcoes: { valor: Escolaridade | "todas"; label: string }[] = [
  { valor: "todas", label: "Todas" },
  { valor: "medio", label: "Médio" },
  { valor: "tecnico", label: "Técnico" },
  { valor: "superior", label: "Superior" },
];

export function VagasFiltro({ concurso }: { concurso: Concurso }) {
  const temDados = Boolean(concurso.vagas?.length);

  return (
    <section id="vagas" className="border-b py-10 lg:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Quantas vagas são para você?
            </h2>
            <p className="mt-1 text-sm text-muted">
              {concurso.nome} · escolha seu perfil e veja o total e as vagas de cota
            </p>
          </div>
        </div>

        {temDados ? (
          <FiltroInterativo key={concurso.slug} concurso={concurso} />
        ) : (
          <Teaser concurso={concurso} />
        )}
      </div>
    </section>
  );
}

function Teaser({ concurso }: { concurso: Concurso }) {
  return (
    <div className="mt-6 grid gap-4 rounded-2xl border bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-semibold">
          Filtro detalhado de vagas e cotas: em breve para {concurso.nome}
        </p>
        <p className="mt-1 text-sm text-muted">
          {concurso.vagasTotais
            ? `São cerca de ${concurso.vagasTotais.toLocaleString("pt-BR")} vagas previstas. `
            : ""}
          O buscador por escolaridade, área, estado e cota já está no ar para a
          Transpetro; os outros concursos entram conforme os editais saem.
        </p>
      </div>
      <Link
        href="#planos"
        className="justify-self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        Assinar Plano Completo
      </Link>
    </div>
  );
}

function FiltroInterativo({ concurso }: { concurso: Concurso }) {
  const [filtro, setFiltro] = useState<FiltroVagas>(filtroVazio);

  const areas = useMemo(() => areasDoConcurso(concurso), [concurso]);
  const ufs = useMemo(() => ufsDoConcurso(concurso), [concurso]);
  const grupos = concurso.gruposReserva ?? gruposReservaPadrao;
  const resultado = useMemo(
    () => filtrarVagas(concurso, filtro),
    [concurso, filtro],
  );

  function toggleGrupo(id: GrupoReservaId) {
    setFiltro((f) => ({
      ...f,
      grupos: f.grupos.includes(id)
        ? f.grupos.filter((g) => g !== id)
        : [...f.grupos, id],
    }));
  }

  const notasVisiveis = grupos.filter(
    (g) => filtro.grupos.includes(g.id) && g.percentual === 0,
  );
  const temFiltroAtivo =
    filtro.escolaridade !== "todas" ||
    filtro.area !== "todas" ||
    filtro.uf !== "todas" ||
    filtro.grupos.length > 0;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* Painel de filtros */}
      <form className="grid content-start gap-5 rounded-2xl border bg-surface p-5">
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
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
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
            {ufs.map((uf) => (
              <option key={uf} value={uf}>{ufLabel[uf] ?? uf}</option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-semibold">Reserva de vagas (cotas)</legend>
          <p className="mt-1 text-xs text-muted">
            Cotistas também disputam a ampla concorrência.
          </p>
          <div className="mt-3 grid gap-2">
            {grupos.map((g) => (
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

        {temFiltroAtivo && (
          <button
            type="button"
            onClick={() => setFiltro(filtroVazio)}
            className="text-sm font-medium text-brand hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </form>

      {/* Resultado */}
      <div className="grid content-start gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-surface p-5">
            <p className="text-sm text-muted">Vagas imediatas nos filtros</p>
            <p className="mt-1 text-4xl font-black tabular-nums">
              {resultado.totalImediatas}
            </p>
            <p className="mt-1 text-xs text-muted">
              em {resultado.totalCargos} cargo{resultado.totalCargos === 1 ? "" : "s"} ·{" "}
              {resultado.linhas.length} localidade
              {resultado.linhas.length === 1 ? "" : "s"}
            </p>
          </div>
          <div
            className={`rounded-2xl border p-5 ${
              filtro.grupos.length ? "border-brand/40 bg-brand-soft" : "bg-surface"
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
              <p key={g.id} className="rounded-xl border border-accent/40 bg-accent/10 p-3 text-xs">
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
          Estimativas com base em concursos anteriores e no edital Transpetro 2026. Cotas:
          Lei 12.990/2014 (negros) e Decreto 9.508/2018 (PcD). Confirme tudo no edital
          oficial.
        </p>
      </div>
    </div>
  );
}
