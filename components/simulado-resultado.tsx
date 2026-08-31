import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";
import {
  ArrowClockwiseIcon,
  CheckCircleIcon,
  ListChecksIcon,
  MagnifyingGlassIcon,
  NotebookIcon,
  ScalesIcon,
  TargetIcon,
  TimerIcon,
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

const DICAS_GERAIS: { icon: Icon; texto: string }[] = [
  {
    icon: ArrowClockwiseIcon,
    texto:
      "Refaça as questões que errou 2 a 3 dias depois, sem olhar o gabarito. O que você acerta na revisão foi o que de fato fixou.",
  },
  {
    icon: TimerIcon,
    texto:
      "Cronometre todo simulado. A Cesgranrio cobra ritmo tanto quanto conteúdo. Mire de 2 a 3 minutos por questão.",
  },
  {
    icon: MagnifyingGlassIcon,
    texto:
      "Leia o enunciado inteiro antes das alternativas e marque palavras como 'exceto', 'incorreto' e 'sempre'.",
  },
  {
    icon: NotebookIcon,
    texto:
      "Mantenha um caderno de erros separado por disciplina e revise no fim de cada semana.",
  },
  {
    icon: ScalesIcon,
    texto:
      "Priorize as disciplinas com mais questões no edital. Peso conta mais do que preferência pessoal.",
  },
  {
    icon: ListChecksIcon,
    texto:
      "Estude por questões comentadas da própria banca, não só por resumo teórico.",
  },
];

function frasePorNota(nota: number): string {
  if (nota >= 80)
    return "Excelente aproveitamento. Foque em manter o ritmo e lapidar os detalhes.";
  if (nota >= 60)
    return "Bom começo. Com revisão dirigida das matérias mais fracas, a nota sobe rápido.";
  if (nota >= 40)
    return "Você já tem uma base. O próximo passo é atacar as matérias em vermelho abaixo.";
  return "Início de jornada. Use o plano abaixo para priorizar o que rende mais pontos agora.";
}

function orientacaoDisciplina(pct: number): string {
  if (pct < 40)
    return `Base ainda frágil (${pct}%). Comece pela teoria do assunto e resolva questões comentadas fáceis antes de partir para provas antigas.`;
  return `Você já tem noção do conteúdo (${pct}%). Refaça questões da Cesgranrio sobre o tema e revise cada erro, um a um, até entender o porquê.`;
}

function Donut({
  pct,
  size,
  fraca,
}: {
  pct: number;
  size: number;
  fraca?: boolean;
}) {
  const cor = fraca ? "#ef4444" : "var(--color-brand)";
  const trilho = fraca
    ? "color-mix(in srgb, #ef4444 22%, var(--color-surface))"
    : "var(--color-border)";
  const graus = Math.round((pct / 100) * 360);
  const furo = Math.round(size * 0.72);
  return (
    <div
      className="relative grid flex-none place-items-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${cor} ${graus}deg, ${trilho} ${graus}deg)`,
      }}
      role="img"
      aria-label={`${pct} por cento`}
    >
      <div
        className="grid place-items-center rounded-full bg-surface font-mono font-bold tabular-nums"
        style={{ width: furo, height: furo, fontSize: size > 100 ? 22 : 12 }}
      >
        {pct}%
      </div>
    </div>
  );
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
  const notaInt = Math.round(nota);

  const porDisciplina = new Map<string, { acertos: number; total: number }>();
  for (const i of itens) {
    const d = porDisciplina.get(i.disciplina) ?? { acertos: 0, total: 0 };
    d.total += 1;
    if (i.acertou) d.acertos += 1;
    porDisciplina.set(i.disciplina, d);
  }

  const disciplinas = [...porDisciplina.entries()]
    .map(([disciplina, d]) => ({
      disciplina,
      ...d,
      pct: Math.round((d.acertos / d.total) * 100),
    }))
    .sort((a, b) => a.pct - b.pct);

  const focar = disciplinas.filter((d) => d.pct < 70);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Resultado
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{titulo}</h1>

      <div className="mt-6 flex flex-col items-center gap-5 rounded-2xl border bg-surface p-6 text-center sm:flex-row sm:text-left">
        <Donut pct={notaInt} size={128} />
        <div className="flex-1">
          <p className="text-sm text-muted">Você acertou</p>
          <p className="font-mono text-3xl font-bold tabular-nums">
            {acertos}
            <span className="text-lg font-normal text-muted"> de {total} questões</span>
          </p>
          <p className="mt-1 text-sm text-muted">{frasePorNota(notaInt)}</p>
          {salvo && (
            <p className="mt-2 text-sm">
              <span className="font-mono font-semibold tabular-nums">{acertos} pontos</span>
              <span className="text-muted"> para o </span>
              <Link href="/ranking" className="font-medium text-brand hover:underline">
                ranking
              </Link>
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-40">
          <Link
            href={`/simulado/${slug}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
          >
            <ArrowClockwiseIcon size={16} weight="bold" aria-hidden />
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

      <section className="mt-10">
        <h2 className="font-semibold">Como você foi em cada matéria</h2>
        <p className="mt-1 text-sm text-muted">
          Quanto mais preenchido o círculo, melhor o aproveitamento. Vermelho marca
          onde você acertou menos de 40 por cento.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {disciplinas.map((d) => (
            <div
              key={d.disciplina}
              className="flex flex-col items-center gap-2 rounded-2xl border bg-surface p-4 text-center"
            >
              <Donut pct={d.pct} size={84} fraca={d.pct < 40} />
              <p className="text-sm font-medium leading-tight">{d.disciplina}</p>
              <p className="font-mono text-xs tabular-nums text-muted">
                {d.acertos}/{d.total} certas
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-semibold">
          <TargetIcon size={18} weight="fill" className="text-brand" aria-hidden />
          Onde focar seus estudos
        </h2>
        {focar.length === 0 ? (
          <p className="mt-3 rounded-2xl border bg-surface p-4 text-sm text-muted">
            Você foi bem em todas as matérias deste simulado. Siga para os simulados
            completos e mantenha a rotina de revisão para não perder o ritmo.
          </p>
        ) : (
          <ol className="mt-3 grid gap-3">
            {focar.map((d, idx) => (
              <li
                key={d.disciplina}
                className="rounded-2xl border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">
                    {idx + 1}. {d.disciplina}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-muted">
                    {d.acertos}/{d.total}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
                  {orientacaoDisciplina(d.pct)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Como melhorar sua performance</h2>
        <ul className="mt-3 grid gap-2.5">
          {DICAS_GERAIS.map(({ icon: IconDica, texto }) => (
            <li
              key={texto}
              className="flex gap-3 rounded-2xl border bg-surface p-4 text-sm leading-relaxed"
            >
              <IconDica
                size={18}
                className="mt-0.5 flex-none text-brand"
                aria-hidden
              />
              <span className="text-foreground/90">{texto}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
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
