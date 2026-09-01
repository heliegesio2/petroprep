import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  carregarConcursoGuia,
  carregarCargoDoConcurso,
  carregarItemEstudo,
  itemCargoChave,
} from "@/lib/concurso-guia";
import { ItemEstudoView } from "@/components/item-estudo-view";

interface Params {
  params: Promise<{ slug: string; cargo: string; item: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, cargo, item } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  if (!c) return { title: "Estudo" };
  const it = await carregarItemEstudo(itemCargoChave(c.id, cargo, item)).catch(
    () => null,
  );
  return { title: it ? `${it.titulo} - ${c.nome}` : "Estudo" };
}

export default async function ItemCargoPage({ params }: Params) {
  const { slug, cargo, item } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const [dados, it] = await Promise.all([
    carregarCargoDoConcurso(concurso.id, cargo),
    carregarItemEstudo(itemCargoChave(concurso.id, cargo, item)),
  ]);
  if (!dados || !it) notFound();

  return (
    <ItemEstudoView
      titulo={it.titulo}
      contexto={`${dados.cargo.nome} · conteúdo específico`}
      resumo={it.resumo}
      pontos={it.pontos}
      dica={it.dica}
      textoOficial={it.textoOficial}
      comoFunciona={it.comoFunciona}
      exemplos={it.exemplos}
      voltarHref={`/concurso/${slug}/vaga/${cargo}`}
      voltarLabel={dados.cargo.nome}
      testeHref={null}
    />
  );
}
