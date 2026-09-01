import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  carregarConcursoGuia,
  carregarMateriaDoConcurso,
  carregarItemEstudo,
  itemMateriaChave,
} from "@/lib/concurso-guia";
import { ItemEstudoView } from "@/components/item-estudo-view";

interface Params {
  params: Promise<{ slug: string; materia: string; item: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, materia, item } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  if (!c) return { title: "Estudo" };
  const it = await carregarItemEstudo(itemMateriaChave(c.id, materia, item)).catch(
    () => null,
  );
  return { title: it ? `${it.titulo} - ${c.nome}` : "Estudo" };
}

export default async function ItemMateriaPage({ params }: Params) {
  const { slug, materia, item } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const [m, it] = await Promise.all([
    carregarMateriaDoConcurso(concurso.id, materia),
    carregarItemEstudo(itemMateriaChave(concurso.id, materia, item)),
  ]);
  if (!m || !it) notFound();

  return (
    <ItemEstudoView
      titulo={it.titulo}
      contexto={m.nome}
      resumo={it.resumo}
      pontos={it.pontos}
      dica={it.dica}
      textoOficial={it.textoOficial}
      comoFunciona={it.comoFunciona}
      exemplos={it.exemplos}
      voltarHref={`/concurso/${slug}/estudo/${materia}`}
      voltarLabel={m.nome}
      testeHref={m.simuladoSlug ? `/simulado/${m.simuladoSlug}` : null}
    />
  );
}
