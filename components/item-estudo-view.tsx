import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  LightbulbIcon,
  PlayIcon,
  SealWarningIcon,
} from "@phosphor-icons/react/dist/ssr";

interface Props {
  titulo: string;
  contexto: string;
  resumo: string | null;
  pontos: string[];
  dica: string | null;
  voltarHref: string;
  voltarLabel: string;
  testeHref?: string | null;
}

export function ItemEstudoView({
  titulo,
  contexto,
  resumo,
  pontos,
  dica,
  voltarHref,
  voltarLabel,
  testeHref,
}: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={voltarHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeftIcon size={15} aria-hidden />
        {voltarLabel}
      </Link>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
        {contexto}
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{titulo}</h1>

      {resumo ? (
        <>
          <p className="mt-5 text-[15px] leading-relaxed text-foreground/90">
            {resumo}
          </p>

          {pontos.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-semibold">Pontos-chave</h2>
              <ul className="mt-3 grid gap-2">
                {pontos.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-relaxed">
                    <CheckCircleIcon
                      size={16}
                      weight="fill"
                      className="mt-0.5 flex-none text-brand"
                      aria-hidden
                    />
                    <span className="text-foreground/90">{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dica && (
            <div className="mt-6 flex gap-3 rounded-2xl border border-accent/40 bg-accent/10 p-4">
              <LightbulbIcon
                size={18}
                weight="fill"
                className="mt-0.5 flex-none text-accent"
                aria-hidden
              />
              <div className="text-sm leading-relaxed">
                <p className="font-semibold">Dica de prova</p>
                <p className="mt-1 text-foreground/90">{dica}</p>
              </div>
            </div>
          )}

          <p className="mt-6 flex items-start gap-2 rounded-lg border bg-surface p-3 text-xs leading-relaxed text-muted">
            <SealWarningIcon size={14} className="mt-0.5 flex-none" aria-hidden />
            Resumo de apoio, escrito com auxílio de IA. Não substitui o edital
            nem bibliografia oficial; confira leis e normas na fonte.
          </p>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border bg-surface p-6 text-sm text-muted">
          O resumo de estudo deste tópico está em preparação. Enquanto isso, o
          tópico faz parte do conteúdo programático do edital e cai na prova.
        </div>
      )}

      {testeHref && (
        <Link
          href={testeHref}
          className="mt-8 inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          <PlayIcon size={16} weight="fill" aria-hidden />
          Fazer teste desta matéria
        </Link>
      )}
    </div>
  );
}
