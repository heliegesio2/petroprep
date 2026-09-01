import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowSquareOutIcon, BookOpenIcon } from "@phosphor-icons/react/dist/ssr";
import {
  carregarConcursoGuia,
  listarCargosDoConcurso,
} from "@/lib/concurso-guia";
import { GuiaIndex } from "@/components/guia-index";

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
    <>
      <GuiaIndex
        concurso={{
          slug: concurso.slug,
          nome: concurso.nome,
          orgao: concurso.orgao,
          banca: concurso.banca,
          resumo: concurso.resumo,
          dataProva: concurso.dataProva ? concurso.dataProva.toISOString() : null,
          vagasOficial: concurso.vagasOficial,
        }}
        concursos={[{ slug: concurso.slug, nome: concurso.nome }]}
        atual={concurso.slug}
        cargos={cargosView}
      />

      <div className="mx-auto max-w-5xl px-4 pb-12">
        <div className="flex flex-wrap gap-3 border-t pt-4 text-sm">
          <Link
            href={`/concurso/${concurso.slug}/estudo`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-strong"
          >
            <BookOpenIcon size={16} weight="fill" aria-hidden />
            O que cai na prova
          </Link>
          {concurso.fonteOficial && (
            <a
              href={concurso.fonteOficial}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 font-medium hover:bg-surface"
            >
              Edital oficial
              <ArrowSquareOutIcon size={14} aria-hidden />
            </a>
          )}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          A PetroPrep não tem vínculo com {concurso.orgao}
          {concurso.banca ? ` nem com a ${concurso.banca}` : ""}. Vagas,
          salários e datas são do edital citado e podem mudar; o documento
          oficial prevalece.
        </p>
      </div>
    </>
  );
}
