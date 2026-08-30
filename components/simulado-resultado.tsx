import Link from "next/link";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react/dist/ssr";

const LETRAS = ["A", "B", "C", "D", "E"];

export interface ItemResultado {
  ordem: number;
  disciplina: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
  comentario: string | null;
  marcada: number;
  acertou: boolean;
}

interface Props {
  titulo: string;
  slug: string;
  nota: number;
  total: number;
  itens: ItemResultado[];
  salvo: boolean;
}

export function SimuladoResultado({
  titulo,
  slug,
  nota,
  total,
  itens,
  salvo,
}: Props) {
  const acertos = itens.filter((i) => i.acertou).length;

  const porDisciplina = new Map<string, { acertos: number; total: number }>();
  for (const i of itens) {
    const d = porDisciplina.get(i.disciplina) ?? { acertos: 0, total: 0 };
    d.total += 1;
    if (i.acertou) d.acertos += 1;
    porDisciplina.set(i.disciplina, d);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Resultado
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{titulo}</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-surface p-5">
          <p className="text-sm text-muted">Nota</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums">
            {Math.round(nota)}
            <span className="text-base font-normal text-muted"> / 100</span>
          </p>
        </div>
        <div className="rounded-2xl border bg-surface p-5">
          <p className="text-sm text-muted">Acertos</p>
          <p className="mt-1 font-mono text-4xl font-bold tabular-nums">
            {acertos}
            <span className="text-base font-normal text-muted"> / {total}</span>
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2 rounded-2xl border bg-surface p-5">
          <Link
            href={`/simulado/${slug}`}
            className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-strong"
          >
            Refazer
          </Link>
          <Link
            href="/simulado"
            className="rounded-lg border px-4 py-2 text-center text-sm font-medium hover:bg-background"
          >
            Outros simulados
          </Link>
        </div>
      </div>

      {!salvo && (
        <p className="mt-4 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs leading-relaxed">
          Este resultado não foi salvo no seu histórico.{" "}
          <Link href="/cadastro" className="font-semibold underline">
            Crie uma conta
          </Link>{" "}
          para acompanhar sua evolução nos próximos simulados.
        </p>
      )}

      <section className="mt-8">
        <h2 className="font-semibold">Desempenho por disciplina</h2>
        <ul className="mt-3 grid gap-2">
          {[...porDisciplina.entries()].map(([disciplina, d]) => {
            const pct = Math.round((d.acertos / d.total) * 100);
            return (
              <li key={disciplina} className="rounded-lg border bg-surface p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{disciplina}</span>
                  <span className="font-mono tabular-nums text-muted">
                    {d.acertos}/{d.total}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-semibold">Correção comentada</h2>
        <ol className="mt-4 grid gap-4">
          {itens.map((i) => (
            <li key={i.ordem} className="rounded-2xl border bg-surface p-5">
              <div className="flex items-start gap-2">
                {i.acertou ? (
                  <CheckCircleIcon
                    size={20}
                    weight="fill"
                    className="mt-0.5 flex-none text-brand"
                    aria-hidden
                  />
                ) : (
                  <XCircleIcon
                    size={20}
                    weight="fill"
                    className="mt-0.5 flex-none text-red-600 dark:text-red-400"
                    aria-hidden
                  />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Questão {i.ordem} · {i.disciplina}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">
                    {i.enunciado}
                  </p>
                </div>
              </div>

              <ul className="mt-4 grid gap-1.5 text-sm">
                {i.alternativas.map((alt, idx) => {
                  const eCorreta = idx === i.correta;
                  const marcouEssa = idx === i.marcada;
                  return (
                    <li
                      key={idx}
                      className={`flex gap-2 rounded-lg border p-2.5 ${
                        eCorreta
                          ? "border-brand/50 bg-brand-soft"
                          : marcouEssa
                            ? "border-red-500/40 bg-red-500/10"
                            : "border-transparent"
                      }`}
                    >
                      <span className="font-bold text-muted">{LETRAS[idx]}</span>
                      <span>{alt}</span>
                      {eCorreta && (
                        <span className="ml-auto text-xs font-semibold text-brand-strong">
                          gabarito
                        </span>
                      )}
                      {marcouEssa && !eCorreta && (
                        <span className="ml-auto text-xs font-semibold text-red-700 dark:text-red-400">
                          sua resposta
                        </span>
                      )}
                    </li>
                  );
                })}
                {i.marcada === -1 && (
                  <li className="px-2.5 text-xs text-muted">
                    Você não respondeu esta questão.
                  </li>
                )}
              </ul>

              {i.comentario && (
                <div className="mt-4 rounded-lg bg-background p-3 text-sm leading-relaxed">
                  <p className="font-semibold">Por quê</p>
                  <p className="mt-1 text-foreground/90">{i.comentario}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
