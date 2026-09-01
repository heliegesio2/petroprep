import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarBlankIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { hasDatabase, prisma } from "@/lib/prisma";
import { formatData } from "@/lib/concursos";
import { listarCargosDoConcurso } from "@/lib/concurso-guia";
import { CargoLista } from "@/components/cargo-lista";
import { ConcursoSeletor } from "@/components/concurso-seletor";

interface Props {
  searchParams: Promise<{ c?: string }>;
}

export default async function Home({ searchParams }: Props) {
  if (!hasDatabase) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold tracking-tight">PetroPrep</h1>
        <p className="mt-3 text-sm text-muted">
          Banco de dados não configurado neste ambiente.
        </p>
      </div>
    );
  }

  const { c } = await searchParams;

  const concursos = await prisma.concurso.findMany({
    where: { publicado: true },
    orderBy: [{ destaque: "desc" }, { ordem: "asc" }, { nome: "asc" }],
    select: { slug: true, nome: true },
  });
  if (concursos.length === 0) notFound();

  const atual =
    concursos.find((x) => x.slug === c)?.slug ?? concursos[0].slug;
  const concurso = await prisma.concurso.findUnique({
    where: { slug: atual },
  });
  if (!concurso) notFound();

  const cargos = await listarCargosDoConcurso(concurso.id);
  const cargosView = cargos.map((cg) => ({
    slug: cg.slug,
    nome: cg.nome,
    area: cg.area,
    nivel: cg.nivel,
    salario: cg.salario ? cg.salario.toNumber() : null,
    imediatas: cg.vagasImediatas,
    reserva: cg.vagasReserva,
    localidades: Array.isArray(cg.localidades) ? cg.localidades.length : 0,
  }));

  const totalImediatas = cargosView.reduce((s, x) => s + x.imediatas, 0);
  const totalReserva = cargosView.reduce((s, x) => s + x.reserva, 0);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:py-14">
      <section>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand">
          Guia do candidato
          {concurso.banca ? ` · banca ${concurso.banca}` : ""}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {concurso.nome}
        </h1>
        <p className="mt-1 text-sm text-muted">{concurso.orgao}</p>
        {concurso.resumo && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-foreground/90">
            {concurso.resumo}
          </p>
        )}

        <dl className="mt-6 grid max-w-xl grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Cargos</dt>
            <dd className="font-mono text-2xl font-bold tabular-nums">
              {cargosView.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Vagas imediatas</dt>
            <dd className="font-mono text-2xl font-bold tabular-nums">
              {totalImediatas.toLocaleString("pt-BR")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Cadastro de reserva</dt>
            <dd className="font-mono text-2xl font-bold tabular-nums">
              {totalReserva.toLocaleString("pt-BR")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Prova</dt>
            <dd className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <CalendarBlankIcon size={13} aria-hidden />
              {concurso.dataProva
                ? formatData(concurso.dataProva.toISOString())
                : "a definir"}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <ConcursoSeletor concursos={concursos} atual={atual} />
          <Link
            href={`/concurso/${concurso.slug}/estudo`}
            className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-1.5 text-sm font-medium hover:bg-surface"
          >
            <MagnifyingGlassIcon size={14} aria-hidden />
            O que cai na prova
          </Link>
        </div>
      </section>

      <section className="mt-8">
        {cargosView.length > 0 ? (
          <CargoLista concursoSlug={concurso.slug} cargos={cargosView} />
        ) : (
          <p className="rounded-2xl border bg-surface p-6 text-sm text-muted">
            Os cargos deste concurso ainda estão sendo carregados.
          </p>
        )}
      </section>

      <p className="mt-10 border-t pt-4 text-xs leading-relaxed text-muted">
        Guia independente, sem vínculo com {concurso.orgao}
        {concurso.banca ? ` ou ${concurso.banca}` : ""}. Vagas, salários e datas
        vêm do edital e podem mudar - o documento oficial prevalece.{" "}
        <Link href="/planos" className="font-medium text-brand hover:underline">
          Ver planos
        </Link>{" "}
        ·{" "}
        <Link href="/duvidas" className="font-medium text-brand hover:underline">
          Dúvidas
        </Link>
      </p>
    </div>
  );
}
