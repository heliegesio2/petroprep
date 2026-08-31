import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PlayIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  carregarConcursoGuia,
  carregarMateriaDoConcurso,
} from "@/lib/concurso-guia";

interface Params {
  params: Promise<{ slug: string; materia: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, materia } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  if (!c) return { title: "Matéria" };
  const m = await carregarMateriaDoConcurso(c.id, materia).catch(() => null);
  return { title: m ? `${m.nome} - ${c.nome}` : "Matéria" };
}

export default async function MateriaPage({ params }: Params) {
  const { slug, materia } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const m = await carregarMateriaDoConcurso(concurso.id, materia);
  if (!m) notFound();

  const comConteudo = m.itens.filter((i) => i.resumo).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/concurso/${slug}/estudo`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeftIcon size={15} aria-hidden />
        O que cai na prova
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">{m.nome}</h1>
      <p className="mt-1 text-sm text-muted">
        {m.itens.length} tópicos do edital
        {comConteudo > 0 ? ` · ${comConteudo} com resumo de estudo` : ""}.
      </p>

      {m.simuladoSlug && (
        <Link
          href={`/simulado/${m.simuladoSlug}`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          <PlayIcon size={16} weight="fill" aria-hidden />
          Fazer teste de {m.nome}
        </Link>
      )}

      <ol className="mt-6 grid gap-1.5">
        {m.itens.map((i, idx) => (
          <li key={i.slug}>
            <Link
              href={`/concurso/${slug}/estudo/${materia}/${i.slug}`}
              className="flex items-start gap-3 rounded-lg p-2.5 text-sm hover:bg-surface"
            >
              <span className="w-6 flex-none text-right font-mono text-xs text-muted">
                {idx + 1}
              </span>
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
      </ol>
    </div>
  );
}
