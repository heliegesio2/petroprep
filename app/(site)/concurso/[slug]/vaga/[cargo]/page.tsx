import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  MapPinIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatBRL } from "@/lib/concursos";
import {
  carregarConcursoGuia,
  carregarCargoDoConcurso,
} from "@/lib/concurso-guia";

interface Params {
  params: Promise<{ slug: string; cargo: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, cargo } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  if (!c) return { title: "Cargo" };
  const dados = await carregarCargoDoConcurso(c.id, cargo).catch(() => null);
  return {
    title: dados ? `${dados.cargo.nome} - ${c.nome}` : "Cargo",
  };
}

export default async function CargoPage({ params }: Params) {
  const { slug, cargo } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const dados = await carregarCargoDoConcurso(concurso.id, cargo);
  if (!dados) notFound();

  const { cargo: c, materias, itensCargo } = dados;
  const localidades = (Array.isArray(c.localidades) ? c.localidades : []) as {
    cidade: string;
    vagas: number;
  }[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/concurso/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeftIcon size={15} aria-hidden />
        {concurso.nome}
      </Link>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-strong">
          {c.nivel}
        </span>
        <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
          {c.area}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">{c.nome}</h1>
      {c.cargaHoraria && (
        <p className="mt-1 text-sm text-muted">Carga horária: {c.cargaHoraria}</p>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-surface p-4">
          <p className="text-xs text-muted">Salário básico</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {c.salario ? formatBRL(c.salario.toNumber(), false) : "-"}
          </p>
        </div>
        <div className="rounded-2xl border bg-surface p-4">
          <p className="text-xs text-muted">Vagas imediatas</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {c.vagasImediatas}
          </p>
        </div>
        <div className="rounded-2xl border bg-surface p-4">
          <p className="text-xs text-muted">Cadastro de reserva</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {c.vagasReserva}
          </p>
        </div>
      </div>

      {c.finalidade && (
        <section className="mt-8">
          <h2 className="font-semibold">Finalidade do cargo</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {c.finalidade}
          </p>
        </section>
      )}

      {c.requisito && (
        <section className="mt-8">
          <h2 className="font-semibold">Requisito de investidura</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {c.requisito}
          </p>
        </section>
      )}

      {c.remuneracao && (
        <section className="mt-8">
          <h2 className="font-semibold">Remuneração</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {c.remuneracao}
          </p>
        </section>
      )}

      {c.atribuicoes && (
        <section className="mt-8">
          <h2 className="font-semibold">Síntese das atribuições</h2>
          <p className="mt-2 text-sm leading-relaxed text-foreground/90">
            {c.atribuicoes}
          </p>
        </section>
      )}

      {materias.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">Conhecimentos gerais (Módulo I)</h2>
          <ul className="mt-3 grid gap-2">
            {materias.map((m) => (
              <li key={m.slug}>
                <Link
                  href={`/concurso/${slug}/estudo/${m.slug}`}
                  className="flex items-center justify-between gap-3 rounded-lg border bg-surface p-3 text-sm hover:border-brand/50"
                >
                  <span className="font-medium">{m.nome}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-brand">
                    Estudar
                    <CaretRightIcon size={13} aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {itensCargo.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold">
            Conhecimentos específicos (Módulo II)
          </h2>
          <p className="mt-1 text-xs text-muted">
            {itensCargo.filter((i) => i.resumo).length} de {itensCargo.length}{" "}
            tópicos com resumo de estudo.
          </p>
          <ul className="mt-3 grid gap-1.5">
            {itensCargo.map((i) => (
              <li key={i.slug}>
                <Link
                  href={`/concurso/${slug}/vaga/${cargo}/${i.slug}`}
                  className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface"
                >
                  {i.resumo ? (
                    <CheckCircleIcon
                      size={16}
                      weight="fill"
                      className="mt-0.5 flex-none text-brand"
                      aria-hidden
                    />
                  ) : (
                    <span
                      className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-muted/50"
                      aria-hidden
                    />
                  )}
                  <span className={i.resumo ? "" : "text-muted"}>{i.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {localidades.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-semibold">
            <MapPinIcon size={18} weight="fill" className="text-brand" aria-hidden />
            Vagas por cidade
          </h2>
          <div className="mt-3 overflow-x-auto rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-2 font-medium">Cidade</th>
                  <th className="px-4 py-2 text-right font-medium">Vagas</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {localidades.map((l) => (
                  <tr key={l.cidade}>
                    <td className="px-4 py-2">{l.cidade}</td>
                    <td className="px-4 py-2 text-right font-mono tabular-nums">
                      {l.vagas}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-10 border-t pt-4 text-xs leading-relaxed text-muted">
        Dados do {concurso.fonteOficial ? "edital oficial" : "edital"}. A soma das
        vagas por cidade pode diferir do total do edital por arredondamento na
        extração; o documento oficial prevalece.
      </p>
    </div>
  );
}
