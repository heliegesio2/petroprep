import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowSquareOutIcon,
  BookOpenIcon,
  CalendarBlankIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatBRL, formatData } from "@/lib/concursos";
import {
  carregarConcursoGuia,
  listarCargosDoConcurso,
} from "@/lib/concurso-guia";
import { CargoLista } from "@/components/cargo-lista";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  return {
    title: c ? `${c.nome} - guia completo` : "Concurso",
    description: c?.resumo ?? undefined,
  };
}

export default async function ConcursoGuiaPage({ params }: Params) {
  const { slug } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const cargos = await listarCargosDoConcurso(concurso.id);
  const cargosView = cargos.map((c) => ({
    slug: c.slug,
    nome: c.nome,
    area: c.area,
    nivel: c.nivel,
    salario: c.salario ? c.salario.toNumber() : null,
    imediatas: c.vagasImediatas,
    reserva: c.vagasReserva,
    localidades: Array.isArray(c.localidades) ? c.localidades.length : 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="rounded-2xl border bg-[#062a1c] p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          {concurso.banca ? `Banca ${concurso.banca}` : "Guia do concurso"}
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {concurso.nome}
        </h1>
        <p className="mt-1 text-sm text-white/80">{concurso.orgao}</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-white/60">Vagas (edital)</p>
            <p className="font-mono text-2xl font-bold tabular-nums">
              {concurso.vagasOficial?.toLocaleString("pt-BR") ?? "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">Salários</p>
            <p className="text-sm font-semibold">
              {concurso.salarioDe
                ? `${formatBRL(concurso.salarioDe.toNumber())} a ${formatBRL(
                    concurso.salarioAte?.toNumber() ?? concurso.salarioDe.toNumber(),
                  )}`
                : "conforme o cargo"}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/60">Prova</p>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <CalendarBlankIcon size={14} aria-hidden />
              {concurso.dataProva ? formatData(concurso.dataProva.toISOString()) : "a definir"}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            href={`/concurso/${concurso.slug}/estudo`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 font-semibold text-[#062a1c] hover:bg-white/90"
          >
            <BookOpenIcon size={16} weight="fill" aria-hidden />
            O que cai na prova
          </Link>
          {concurso.fonteOficial && (
            <a
              href={concurso.fonteOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-4 py-2 font-medium hover:bg-white/10"
            >
              Edital oficial
              <ArrowSquareOutIcon size={14} aria-hidden />
            </a>
          )}
        </div>
      </section>

      {concurso.resumo && (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          {concurso.resumo}
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-tight">
          Cargos e vagas
          <span className="ml-2 font-mono text-sm font-normal text-muted">
            {cargosView.length}
          </span>
        </h2>
        <p className="mt-1 text-sm text-muted">
          Dados extraídos do edital. Confira sempre a fonte oficial.
        </p>
        <div className="mt-4">
          <CargoLista concursoSlug={concurso.slug} cargos={cargosView} />
        </div>
      </section>

      <p className="mt-10 border-t pt-4 text-xs leading-relaxed text-muted">
        A PetroPrep não tem vínculo com {concurso.orgao}
        {concurso.banca ? ` nem com a ${concurso.banca}` : ""}. Vagas, salários e
        datas são do edital citado e podem mudar; o documento oficial prevalece.
      </p>
    </div>
  );
}
