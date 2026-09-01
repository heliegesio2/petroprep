import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircleIcon, ClockIcon } from "@phosphor-icons/react/dist/ssr";
import { exigirLogin, planoAtivo } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPlano } from "@/lib/planos";
import { rotuloProvedor, type Provedor } from "@/lib/oauth";
import { LogoutButton } from "@/components/logout-button";
import { ContaEmailForm } from "@/components/conta-email-form";

export const metadata: Metadata = { title: "Minha conta" };

export default async function MinhaContaPage() {
  const usuario = await exigirLogin("/minha-conta");
  const ativo = planoAtivo(usuario);
  const plano = usuario.plano ? getPlano(usuario.plano) : undefined;

  const [tentativas, contasOAuth] = await Promise.all([
    prisma.tentativa.findMany({
      where: { usuarioId: usuario.id, finalizadoEm: { not: null } },
      orderBy: { finalizadoEm: "desc" },
      take: 20,
      include: { simulado: { select: { titulo: true, slug: true } } },
    }),
    prisma.contaOAuth.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { criadoEm: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minha conta</h1>
          <p className="mt-1 text-sm text-muted">
            {usuario.nome}
            {usuario.email ? ` · ${usuario.email}` : ""}
          </p>
        </div>
        <LogoutButton />
      </div>

      <section className="mt-8 rounded-2xl border bg-surface p-6">
        <h2 className="font-semibold">Formas de acesso</h2>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted">
          {usuario.senhaHash && <li>E-mail e senha</li>}
          {contasOAuth.map((c) => (
            <li key={c.id}>
              {rotuloProvedor[c.provedor as Provedor] ?? c.provedor}
              <span className="text-xs">
                {" "}
                (desde {c.criadoEm.toLocaleDateString("pt-BR")})
              </span>
            </li>
          ))}
        </ul>

        {!usuario.email && (
          <div className="mt-4 border-t pt-4">
            <p className="text-sm font-medium">Adicione um e-mail</p>
            <p className="mt-1 text-sm text-muted">
              Sua conta entrou pelo TikTok, que não informa e-mail. Cadastre um para
              receber o recibo do pagamento e poder recuperar o acesso.
            </p>
            <div className="mt-3">
              <ContaEmailForm />
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border bg-surface p-6">
        <h2 className="font-semibold">Seu plano</h2>
        {ativo ? (
          <p className="mt-2 flex items-center gap-2 text-sm">
            <CheckCircleIcon size={18} weight="fill" className="text-brand" aria-hidden />
            {plano?.nome ?? "Plano ativo"}
            {usuario.planoAte && (
              <span className="text-muted">
                até {usuario.planoAte.toLocaleDateString("pt-BR")}
              </span>
            )}
          </p>
        ) : usuario.planoStatus === "pendente" ? (
          <p className="mt-2 flex items-center gap-2 text-sm text-muted">
            <ClockIcon size={18} weight="fill" className="text-accent" aria-hidden />
            Pagamento em processamento. Assim que compensar, o acesso libera.
          </p>
        ) : (
          <div className="mt-2">
            <p className="text-sm text-muted">
              Você ainda não assinou. Com o plano, todos os simulados e o material
              completo liberam.
            </p>
            <Link
              href="/planos"
              className="mt-3 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
            >
              Ver planos
            </Link>
          </div>
        )}
      </section>

      <section className="mt-6">
        <h2 className="font-semibold">Seus simulados</h2>
        {tentativas.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Você ainda não finalizou nenhum simulado.{" "}
            <Link href="/simulado" className="font-medium text-brand hover:underline">
              Fazer o primeiro
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 divide-y border-y">
            {tentativas.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{t.simulado.titulo}</p>
                  <p className="text-xs text-muted">
                    {t.finalizadoEm?.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {Math.round(t.nota ?? 0)}
                  <span className="text-xs font-normal text-muted"> / 100</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
