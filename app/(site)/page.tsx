import Link from "next/link";
import { notFound } from "next/navigation";
import { hasDatabase, prisma } from "@/lib/prisma";
import { listarCargosDoConcurso } from "@/lib/concurso-guia";
import { GuiaIndex } from "@/components/guia-index";

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

  const atual = concursos.find((x) => x.slug === c)?.slug ?? concursos[0].slug;
  const concurso = await prisma.concurso.findUnique({ where: { slug: atual } });
  if (!concurso) notFound();

  const cargos = await listarCargosDoConcurso(concurso.id);
  const cargosView = cargos.map((cg) => ({
    slug: cg.slug,
    nome: cg.nome,
    area: cg.area,
    nivel: cg.nivel,
    cargaHoraria: cg.cargaHoraria,
    requisito: cg.requisito,
    salario: cg.salario ? cg.salario.toNumber() : null,
    imediatas: cg.vagasImediatas,
    reserva: cg.vagasReserva,
    localidades: (Array.isArray(cg.localidades) ? cg.localidades : []) as {
      cidade: string;
      vagas: number;
    }[],
    calloutCurso: cg.calloutCurso,
    vagasModalidade: (cg.vagasModalidade ?? null) as Record<
      string,
      { imediatas: number; reserva: number }
    > | null,
  }));

  return (
    <>
      <GuiaIndex
        concurso={{
          slug: concurso.slug,
          nome: concurso.nome,
          orgao: concurso.orgao,
          banca: concurso.banca,
          resumo: concurso.resumo,
          dataProva: concurso.dataProva
            ? concurso.dataProva.toISOString()
            : null,
          vagasOficial: concurso.vagasOficial,
          fonteOficial: concurso.fonteOficial,
        }}
        concursos={concursos}
        atual={atual}
        cargos={cargosView}
      />
      <div className="mx-auto max-w-5xl px-4 pb-10">
        <p className="border-t pt-4 text-xs leading-relaxed text-muted">
          Guia independente, sem vínculo com {concurso.orgao}
          {concurso.banca ? ` ou ${concurso.banca}` : ""}. Vagas, salários e
          datas vêm do edital e podem mudar - o documento oficial prevalece.{" "}
          <Link
            href={`/concurso/${concurso.slug}/estudo`}
            className="font-medium text-brand hover:underline"
          >
            O que cai na prova
          </Link>{" "}
          ·{" "}
          <Link href="/planos" className="font-medium text-brand hover:underline">
            Planos
          </Link>
        </p>
      </div>
    </>
  );
}
