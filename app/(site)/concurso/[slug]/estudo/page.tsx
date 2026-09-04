import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";
import {
  carregarConcursoGuia,
  listarMateriasDoConcurso,
} from "@/lib/concurso-guia";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  return { title: c ? `O que cai na prova - ${c.nome}` : "Conteúdo" };
}

const NIVEL_LABEL: Record<string, string> = {
  geral: "Conhecimentos gerais (todos os níveis)",
  medio: "Nível Médio / Técnico",
  superior: "Nível Superior",
};

// Ordem de exibição dos grupos de nível; níveis fora da lista vão para o fim.
const NIVEL_ORDEM = ["superior", "medio", "geral"];

export default async function EstudoIndexPage({ params }: Params) {
  const { slug } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const materias = await listarMateriasDoConcurso(concurso.id);
  const porNivel = new Map<string, typeof materias>();
  for (const m of materias) {
    const arr = porNivel.get(m.nivel) ?? [];
    arr.push(m);
    porNivel.set(m.nivel, arr);
  }
  const niveis = [...porNivel.keys()].sort((a, b) => {
    const ia = NIVEL_ORDEM.indexOf(a);
    const ib = NIVEL_ORDEM.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/concurso/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeftIcon size={15} aria-hidden />
        {concurso.nome}
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight">O que cai na prova</h1>
      <p className="mt-1 text-sm text-muted">
        Conhecimentos gerais (Módulo I) por nível. O conteúdo específico de cada
        cargo (Módulo II) fica na página do cargo.
      </p>

      {niveis.map((nivel) => {
        const lista = porNivel.get(nivel);
        if (!lista || lista.length === 0) return null;
        return (
          <section key={nivel} className="mt-8">
            <h2 className="text-sm font-semibold text-muted">
              {NIVEL_LABEL[nivel] ?? nivel}
            </h2>
            <ul className="mt-3 grid gap-2">
              {lista.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={`/concurso/${slug}/estudo/${m.slug}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-surface p-4 hover:border-brand/50"
                  >
                    <span>
                      <span className="block font-medium">{m.nome}</span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {m.total} tópicos
                        {m.comConteudo > 0
                          ? ` · ${m.comConteudo} com resumo`
                          : " · resumos em preparação"}
                      </span>
                    </span>
                    <CaretRightIcon size={16} className="flex-none text-muted" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
