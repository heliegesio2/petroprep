"use client";

import { useMemo, useState } from "react";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import {
  areasDoConcurso,
  editaisDoConcurso,
  escolaridadeLabel,
  filtroVazio,
  filtrarVagas,
  gruposReservaPadrao,
  polosDoConcurso,
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

const LINHAS_VISIVEIS = 8;

export function VagasFiltro({ concurso }: { concurso: Concurso }) {
  const temDados = Boolean(concurso.vagas?.length);

  return (
    <section id="vagas" className="border-b py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Vagas por cargo, edital e cota
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {concurso.nome}: filtre por edital, escolaridade, área e reserva de vagas para
          ver as vagas imediatas, o cadastro de reserva e quantas são do seu perfil.
        </p>

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
    <div className="mt-8 grid gap-5 rounded-2xl border bg-surface p-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <p className="font-semibold">
          Filtro detalhado de vagas e cotas: em breve para {concurso.nome}
        </p>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
          {concurso.vagasTotais
            ? `São cerca de ${concurso.vagasTotais.toLocaleString("pt-BR")} vagas previstas. `
            : ""}
          O buscador por escolaridade, área, edital e cota já está no ar para a
          Transpetro. Os outros concursos entram conforme os editais saem.
        </p>
      </div>
      <a
        href="#planos"
        className="justify-self-start rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
      >
        Assinar
      </a>
    </div>
  );
}

function FiltroInterativo({ concurso }: { concurso: Concurso }) {
  const [filtro, setFiltro] = useState<FiltroVagas>(filtroVazio);
  const [expandido, setExpandido] = useState(false);

  const areas = useMemo(() => areasDoConcurso(concurso), [concurso]);
  const polos = useMemo(() => polosDoConcurso(concurso), [concurso]);
  const editais = useMemo(() => editaisDoConcurso(concurso), [concurso]);
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
    setExpandido(false);
  }

  const notasVisiveis = grupos.filter(
    (g) => filtro.grupos.includes(g.id) && g.percentual === 0,
  );
  const temFiltroAtivo =
    filtro.escolaridade !== "todas" ||
    filtro.area !== "todas" ||
    filtro.polo !== "todos" ||
    filtro.edital !== "todos" ||
    filtro.grupos.length > 0;
  const marcouCota = filtro.grupos.length > 0;
  const linhas = expandido
    ? resultado.linhas
    : resultado.linhas.slice(0, LINHAS_VISIVEIS);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Painel de filtros */}
      <form className="grid content-start gap-5 rounded-2xl border bg-surface p-5">
        {editais.length > 1 && (
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Edital</span>
            <select
              value={filtro.edital}
              onChange={(e) => setFiltro((f) => ({ ...f, edital: e.target.value }))}
              className="rounded-lg border bg-background px-3 py-2"
            >
              <option value="todos">Todos os editais</option>
              {editais.map((ed) => (
                <option key={ed.id} value={ed.id}>{ed.label}</option>
              ))}
            </select>
          </label>
        )}

        <fieldset>
          <legend className="text-sm font-semibold">Escolaridade</legend>
          <div className="mt-2 flex gap-1 rounded-lg border p-1">
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
          <span className="font-semibold">Polo / lotação</span>
          <select
            value={filtro.polo}
            onChange={(e) => setFiltro((f) => ({ ...f, polo: e.target.value }))}
            className="rounded-lg border bg-background px-3 py-2"
          >
            <option value="todos">Todos os polos</option>
            {polos.map((polo) => (
              <option key={polo} value={polo}>{polo}</option>
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
            onClick={() => {
              setFiltro(filtroVazio);
              setExpandido(false);
            }}
            className="text-sm font-medium text-brand hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </form>

      {/* Resultado */}
      <div className="grid content-start gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-surface p-5">
            <p className="text-sm text-muted">Vagas imediatas</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums">
              {resultado.totalImediatas}
            </p>
            <p className="mt-1 text-xs text-muted">
              {resultado.totalCargos} cargo{resultado.totalCargos === 1 ? "" : "s"}
            </p>
          </div>
          <div className="rounded-2xl border bg-surface p-5">
            <p className="text-sm text-muted">Cadastro de reserva</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums">
              {resultado.totalReserva}
            </p>
            <p className="mt-1 text-xs text-muted">convocação conforme necessidade</p>
          </div>
          <div
            className={`rounded-2xl border p-5 ${
              marcouCota ? "border-brand/40 bg-brand-soft" : "bg-surface"
            }`}
          >
            <p className="text-sm text-muted">Reservadas ao seu perfil</p>
            <p className="mt-1 font-mono text-4xl font-bold tabular-nums text-brand-strong">
              {marcouCota ? resultado.reservadasParaVoce : "-"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {marcouCota
                ? "sobre as vagas imediatas"
                : "marque uma cota para ver"}
            </p>
          </div>
        </div>

        {resultado.porGrupo.length > 0 && (
          <div className="rounded-2xl border bg-surface p-5">
            <p className="text-sm font-semibold">Por grupo</p>
            <ul className="mt-2 divide-y text-sm">
              {resultado.porGrupo.map(({ grupo, vagas }) => (
                <li
                  key={grupo.id}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <span>{grupo.label}</span>
                  <span className="font-mono font-semibold tabular-nums">
                    {grupo.percentual > 0 ? vagas : "sem reserva"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {notasVisiveis.map((g) => (
          <p
            key={g.id}
            className="flex gap-2 rounded-2xl border border-accent/40 bg-accent/10 p-3 text-xs leading-relaxed"
          >
            <WarningCircleIcon
              size={16}
              weight="fill"
              className="mt-px flex-none text-accent"
              aria-hidden
            />
            <span>
              <strong>{g.label}:</strong> {g.nota}
            </span>
          </p>
        ))}

        <div className="overflow-hidden rounded-2xl border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b text-left text-xs font-medium text-muted">
                <tr>
                  <th className="px-4 py-3">Cargo</th>
                  <th className="px-4 py-3">Edital / polo</th>
                  <th className="px-4 py-3 text-right">Imediatas</th>
                  <th className="px-4 py-3 text-right">Reserva</th>
                  <th className="px-4 py-3 text-right">Pro seu perfil</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {linhas.map((l) => (
                  <tr key={`${l.cargo.slug}-${l.polo}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium">{l.cargo.titulo}</div>
                      <div className="text-xs text-muted">
                        {escolaridadeLabel[l.cargo.escolaridade]}, {l.cargo.area}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {l.editalLabel}
                      <div className="text-xs">{l.polo}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {l.imediatas}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-muted">
                      {l.cadastroReserva}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-brand-strong">
                      {marcouCota ? l.reservadasParaVoce : "-"}
                    </td>
                  </tr>
                ))}
                {resultado.linhas.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted">
                      Nenhuma vaga com esses filtros nesta estimativa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {resultado.linhas.length > LINHAS_VISIVEIS && (
            <button
              type="button"
              onClick={() => setExpandido((v) => !v)}
              className="w-full border-t px-4 py-3 text-sm font-medium text-brand hover:bg-brand-soft/40"
            >
              {expandido
                ? "Mostrar menos"
                : `Ver todos os ${resultado.linhas.length} cargos`}
            </button>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted">
          São 4 editais independentes (Quadro de Mar - Guarnição e Oficiais; Quadro de
          Terra - médio/técnico e superior). O detalhamento de vagas por polo está no
          Anexo de Vagas de cada edital. Lista de cargos parcial. Cotas: Lei 12.990/2014
          (negros) e Decreto 9.508/2018 (PcD). Confirme tudo no edital oficial.
        </p>
      </div>
    </div>
  );
}
