import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LockSimpleIcon } from "@phosphor-icons/react/dist/ssr";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual } from "@/lib/auth";
import { carregarSimulado, podeAcessar } from "@/lib/simulado";
import { SimuladoPlayer } from "@/components/simulado-player";
import { SimuladoResultado } from "@/components/simulado-resultado";

interface Params {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ r?: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const s = await prisma.simulado.findUnique({ where: { slug } }).catch(() => null);
  return { title: s ? s.titulo : "Simulado" };
}

export default async function SimuladoPage({ params, searchParams }: Params) {
  if (!hasDatabase) notFound();

  const { slug } = await params;
  const { r } = await searchParams;

  const simulado = await carregarSimulado(slug);
  if (!simulado || simulado.questoes.length === 0) notFound();

  const usuario = await usuarioAtual();

  if (!simulado.gratuito && !usuario) {
    redirect(`/entrar?next=${encodeURIComponent(`/simulado/${slug}`)}`);
  }

  if (!podeAcessar(simulado, usuario)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <LockSimpleIcon size={32} className="mx-auto text-muted" aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{simulado.titulo}</h1>
        <p className="mt-2 text-sm text-muted">
          Este simulado faz parte dos planos. Assine para liberar todos os simulados e
          a correção comentada.
        </p>
        <Link
          href="/#planos"
          className="mt-6 inline-block rounded-lg bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
        >
          Ver planos
        </Link>
      </div>
    );
  }

  // --- Ver resultado de uma tentativa concluída ---------------------------------
  if (r) {
    const tentativa = await prisma.tentativa.findUnique({
      where: { id: r },
      include: {
        respostas: { include: { questao: true } },
        simulado: { select: { slug: true, titulo: true } },
      },
    });

    const proprio =
      tentativa &&
      tentativa.simulado.slug === slug &&
      tentativa.finalizadoEm &&
      (tentativa.usuarioId === null || tentativa.usuarioId === usuario?.id);

    if (!proprio) redirect(`/simulado/${slug}`);

    const ordemPorQuestao = new Map(
      simulado.questoes.map((q) => [q.id, q.ordem]),
    );
    const itens = tentativa.respostas
      .map((resp) => ({
        ordem: ordemPorQuestao.get(resp.questaoId) ?? 0,
        disciplina: resp.questao.disciplina,
        enunciado: resp.questao.enunciado,
        alternativas: resp.questao.alternativas as string[],
        correta: resp.questao.correta,
        comentario: resp.questao.comentario,
        marcada: resp.marcada,
        acertou: resp.correta,
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return (
      <SimuladoResultado
        titulo={simulado.titulo}
        slug={slug}
        nota={tentativa.nota ?? 0}
        total={itens.length}
        itens={itens}
        salvo={tentativa.usuarioId !== null}
      />
    );
  }

  // --- Iniciar / retomar tentativa e jogar -------------------------------------
  let tentativaId: string;
  const emAndamento = usuario
    ? await prisma.tentativa.findFirst({
        where: {
          usuarioId: usuario.id,
          simuladoId: simulado.id,
          finalizadoEm: null,
        },
        orderBy: { iniciadoEm: "desc" },
      })
    : null;

  if (emAndamento) {
    tentativaId = emAndamento.id;
  } else {
    const nova = await prisma.tentativa.create({
      data: { simuladoId: simulado.id, usuarioId: usuario?.id ?? null },
    });
    tentativaId = nova.id;
  }

  return (
    <SimuladoPlayer
      slug={slug}
      titulo={simulado.titulo}
      duracaoMin={simulado.duracaoMin}
      tentativaId={tentativaId}
      questoes={simulado.questoes}
    />
  );
}
