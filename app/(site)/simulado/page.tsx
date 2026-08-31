import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  ClockIcon,
  LockSimpleIcon,
  PlayIcon,
} from "@phosphor-icons/react/dist/ssr";
import { hasDatabase, prisma } from "@/lib/prisma";
import { usuarioAtual, planoAtivo } from "@/lib/auth";
import { idsTentativasAnonimas } from "@/lib/tentativas-anonimas";

export const metadata: Metadata = {
  title: "Simulados",
  description:
    "Simulados no estilo Cesgranrio para a Transpetro 2026, com cronômetro e correção comentada.",
};

export default async function SimuladoListaPage() {
  if (!hasDatabase) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">Simulados</h1>
        <p className="mt-3 text-sm text-muted">
          O banco de dados ainda não está configurado neste ambiente. Suba o Postgres
          (docker compose up) para ver os simulados.
        </p>
      </div>
    );
  }

  const usuario = await usuarioAtual();
  const liberado = planoAtivo(usuario);
  const anonIds = await idsTentativasAnonimas();

  const simulados = await prisma.simulado.findMany({
    orderBy: [{ gratuito: "desc" }, { createdAt: "asc" }],
    include: { _count: { select: { questoes: true } } },
  });

  // Última tentativa finalizada por simulado (conta logada + feitas deslogado).
  const donos: Prisma.TentativaWhereInput[] = [];
  if (usuario) donos.push({ usuarioId: usuario.id });
  if (anonIds.length) donos.push({ id: { in: anonIds } });

  const ultimaPorSimulado = new Map<
    string,
    { id: string; nota: number | null; finalizadoEm: Date | null }
  >();
  if (donos.length) {
    const tentativas = await prisma.tentativa.findMany({
      where: { finalizadoEm: { not: null }, OR: donos },
      orderBy: { finalizadoEm: "desc" },
      select: { id: true, simuladoId: true, nota: true, finalizadoEm: true },
    });
    for (const t of tentativas) {
      if (!ultimaPorSimulado.has(t.simuladoId)) {
        ultimaPorSimulado.set(t.simuladoId, {
          id: t.id,
          nota: t.nota,
          finalizadoEm: t.finalizadoEm,
        });
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Simulados</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Provas no estilo Cesgranrio, com cronômetro regressivo e correção comentada
        questão a questão. O <strong>Simulado Diagnóstico</strong> abre sem login. Os
        demais liberam com qualquer plano.
      </p>

      {!liberado && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand-soft/50 p-4 text-sm">
          <span>Assine para liberar todos os simulados e a correção completa.</span>
          <Link
            href="/#planos"
            className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-strong"
          >
            Ver planos
          </Link>
        </div>
      )}

      <ul className="mt-8 grid gap-4">
        {simulados.map((s) => {
          const acessivel = s.gratuito || liberado;
          const qtd = s._count.questoes;
          const feito = ultimaPorSimulado.get(s.id);

          return (
            <li
              key={s.id}
              className="flex flex-col gap-4 rounded-2xl border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{s.titulo}</h2>
                  {s.gratuito && (
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-strong">
                      Grátis
                    </span>
                  )}
                  {feito && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-strong">
                      <CheckCircleIcon size={12} weight="fill" aria-hidden />
                      Feito
                    </span>
                  )}
                </div>
                {s.descricao && (
                  <p className="mt-1 text-sm text-muted">{s.descricao}</p>
                )}
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                  <span>{qtd} questões</span>
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon size={13} aria-hidden />
                    {s.duracaoMin} min
                  </span>
                  {feito && (
                    <span className="font-medium text-foreground">
                      Seu último resultado:{" "}
                      <span className="font-mono tabular-nums">
                        {Math.round(feito.nota ?? 0)} / 100
                      </span>
                    </span>
                  )}
                </p>
              </div>

              {!acessivel ? (
                <Link
                  href="/#planos"
                  className="inline-flex flex-none items-center justify-center gap-1.5 rounded-lg border px-5 py-2.5 text-sm font-semibold text-muted hover:bg-background"
                >
                  <LockSimpleIcon size={16} aria-hidden />
                  Assine para liberar
                </Link>
              ) : feito ? (
                <div className="flex flex-none flex-wrap gap-2">
                  <Link
                    href={`/simulado/${s.slug}?r=${feito.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-background"
                  >
                    Ver resultado
                  </Link>
                  <Link
                    href={`/simulado/${s.slug}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
                  >
                    <ArrowClockwiseIcon size={16} weight="bold" aria-hidden />
                    Refazer
                  </Link>
                </div>
              ) : (
                <Link
                  href={`/simulado/${s.slug}`}
                  className="inline-flex flex-none items-center justify-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
                >
                  <PlayIcon size={16} weight="fill" aria-hidden />
                  Começar
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
