import type { Metadata } from "next";
import Link from "next/link";
import { MedalIcon } from "@phosphor-icons/react/dist/ssr";
import { exigirLogin } from "@/lib/auth";
import { hasDatabase } from "@/lib/prisma";
import { rankingConcurso, type EntradaRanking } from "@/lib/ranking";

export const metadata: Metadata = { title: "Ranking", robots: { index: false } };

const MEDALHA = ["text-[#d4af37]", "text-[#9fa7b0]", "text-[#b87333]"];

function Linha({
  pos,
  entrada,
  eu,
}: {
  pos: number;
  entrada: EntradaRanking;
  eu: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
        eu ? "bg-brand-soft font-semibold" : ""
      }`}
    >
      <span className="w-8 flex-none text-center font-mono tabular-nums text-muted">
        {pos <= 3 ? (
          <MedalIcon
            size={18}
            weight="fill"
            className={`mx-auto ${MEDALHA[pos - 1]}`}
            aria-label={`${pos}º lugar`}
          />
        ) : (
          `${pos}º`
        )}
      </span>
      <span className="min-w-0 flex-1 truncate">
        {entrada.nome}
        {eu && <span className="ml-1.5 text-xs text-brand-strong">(você)</span>}
      </span>
      <span className="flex-none text-xs text-muted">
        {entrada.simulados} {entrada.simulados === 1 ? "simulado" : "simulados"}
      </span>
      <span className="w-16 flex-none text-right font-mono font-bold tabular-nums">
        {entrada.pontos}
        <span className="text-xs font-normal text-muted"> pts</span>
      </span>
    </li>
  );
}

export default async function RankingPage() {
  const usuario = await exigirLogin("/ranking");

  if (!hasDatabase) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-2xl font-bold tracking-tight">Ranking</h1>
        <p className="mt-3 text-sm text-muted">
          O banco de dados ainda não está disponível neste ambiente.
        </p>
      </div>
    );
  }

  const { concurso, entradas, total } = await rankingConcurso();
  const minhaPos = entradas.findIndex((e) => e.usuarioId === usuario.id);
  const top = entradas.slice(0, 20);
  const foraDoTop = minhaPos >= top.length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight">Ranking - {concurso}</h1>
      <p className="mt-1 text-sm text-muted">
        {minhaPos === -1 ? (
          <>
            Você ainda não pontuou.{" "}
            <Link href="/simulado" className="font-medium text-brand hover:underline">
              Faça um simulado
            </Link>{" "}
            para entrar no ranking.
          </>
        ) : (
          <>
            Você está em <strong className="text-foreground">{minhaPos + 1}º</strong> de{" "}
            {total} candidatos, com{" "}
            <strong className="text-foreground">{entradas[minhaPos].pontos} pontos</strong>.
          </>
        )}
      </p>

      {top.length > 0 ? (
        <>
          <ol className="mt-6 divide-y border-y">
            {top.map((e, i) => (
              <Linha
                key={e.usuarioId}
                pos={i + 1}
                entrada={e}
                eu={e.usuarioId === usuario.id}
              />
            ))}
          </ol>

          {foraDoTop && minhaPos !== -1 && (
            <ol className="mt-2 border-y border-dashed">
              <li className="px-3 py-1 text-center text-xs text-muted">. . .</li>
              <Linha pos={minhaPos + 1} entrada={entradas[minhaPos]} eu />
            </ol>
          )}
        </>
      ) : (
        <p className="mt-6 rounded-2xl border bg-surface p-4 text-sm text-muted">
          Ninguém pontuou ainda. Seja o primeiro.
        </p>
      )}

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Pontos = acertos da sua melhor tentativa em cada simulado (1 ponto por
        acerto). Refazer um simulado para estudar não tira pontos.
      </p>
    </div>
  );
}
