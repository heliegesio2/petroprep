"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TrashIcon,
  WifiHighIcon,
} from "@phosphor-icons/react/dist/ssr";
import {
  listarPacotes,
  removerPacote,
  salvarPendente,
  removerPendente,
  type PacoteOffline,
} from "@/lib/offline-db";
import { SimuladoPlayer } from "@/components/simulado-player";
import {
  SimuladoResultado,
  type ItemResultado,
} from "@/components/simulado-resultado";

function uuid(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
}

interface Resultado {
  nota: number;
  itens: ItemResultado[];
  enviado: boolean;
}

function Jogo({
  pacote,
  aoSair,
}: {
  pacote: PacoteOffline;
  aoSair: () => void;
}) {
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const inicioRef = useRef<string>(new Date().toISOString());

  const corrigir = useCallback(
    (questaoId: string, marcada: number) => {
      const q = pacote.questoes.find((x) => x.id === questaoId);
      const gabarito = q?.correta ?? -1;
      return {
        correta: marcada === gabarito,
        gabarito,
        comentario: q?.comentario ?? null,
      };
    },
    [pacote],
  );

  const finalizar = useCallback(
    async (respostas: Record<string, number>) => {
      const ordenadas = [...pacote.questoes].sort((a, b) => a.ordem - b.ordem);
      let acertos = 0;
      const itens: ItemResultado[] = ordenadas.map((q, i) => {
        const marcada = Number.isInteger(respostas[q.id]) ? respostas[q.id] : -1;
        const acertou = marcada === q.correta;
        if (acertou) acertos += 1;
        return {
          ordem: i + 1,
          disciplina: q.disciplina,
          enunciado: q.enunciado,
          alternativas: q.alternativas,
          correta: q.correta,
          comentario: q.comentario,
          marcada,
          acertou,
        };
      });
      const nota = ordenadas.length ? (acertos / ordenadas.length) * 100 : 0;

      const pendente = {
        id: uuid(),
        slug: pacote.slug,
        titulo: pacote.titulo,
        iniciadoEm: inicioRef.current,
        finalizadoEm: new Date().toISOString(),
        respostas,
        nota,
      };
      await salvarPendente(pendente).catch(() => {});

      let enviado = false;
      try {
        const res = await fetch(`/api/simulado/${pacote.slug}/importar`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            iniciadoEm: pendente.iniciadoEm,
            finalizadoEm: pendente.finalizadoEm,
            respostas,
          }),
        });
        if (res.ok) {
          enviado = true;
          await removerPendente(pendente.id).catch(() => {});
        }
      } catch {
        // offline: fica na fila
      }

      setResultado({ nota, itens, enviado });
    },
    [pacote],
  );

  if (resultado) {
    return (
      <div>
        {!resultado.enviado && (
          <div className="bg-[#062a1c] px-4 py-2 text-center text-xs text-white">
            Resultado salvo neste aparelho. Sobe para o seu histórico quando a
            internet voltar.
          </div>
        )}
        <SimuladoResultado
          titulo={pacote.titulo}
          slug={pacote.slug}
          nota={resultado.nota}
          total={resultado.itens.length}
          itens={resultado.itens}
          salvo={resultado.enviado}
          mostrarAvisoConta={false}
        />
        <div className="mx-auto max-w-3xl px-4 pb-10">
          <button
            type="button"
            onClick={aoSair}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-background"
          >
            Voltar aos baixados
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimuladoPlayer
      slug={pacote.slug}
      duracaoMin={pacote.duracaoMin}
      tentativaId="offline"
      questoes={pacote.questoes.map((q) => ({
        id: q.id,
        ordem: q.ordem,
        disciplina: q.disciplina,
        enunciado: q.enunciado,
        alternativas: q.alternativas,
      }))}
      respondidas={{}}
      corrigir={corrigir}
      aoFinalizar={finalizar}
      aoSair={aoSair}
    />
  );
}

export default function EstudarOfflinePage() {
  const [pacotes, setPacotes] = useState<PacoteOffline[] | null>(null);
  const [ativo, setAtivo] = useState<PacoteOffline | null>(null);

  useEffect(() => {
    listarPacotes()
      .then(setPacotes)
      .catch(() => setPacotes([]));
  }, []);

  async function remover(slug: string) {
    await removerPacote(slug).catch(() => {});
    setPacotes((p) => (p ? p.filter((x) => x.slug !== slug) : p));
  }

  if (ativo) {
    return <Jogo pacote={ativo} aoSair={() => setAtivo(null)} />;
  }

  return (
    <main className="flex-1">
      <div className="border-b bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2 text-sm font-semibold">
          <WifiHighIcon size={16} className="text-brand" aria-hidden />
          Modo offline
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href="/simulado"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
        >
          <ArrowLeftIcon size={15} aria-hidden />
          Simulados
        </Link>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Simulados baixados
        </h1>
        <p className="mt-1 text-sm text-muted">
          Estes simulados funcionam sem internet. As tentativas feitas offline
          sobem para o seu histórico assim que a conexão voltar.
        </p>

        {pacotes === null ? (
          <p className="mt-8 text-sm text-muted">Carregando...</p>
        ) : pacotes.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-surface p-6 text-sm text-muted">
            Você ainda não baixou nenhum simulado. Na página de{" "}
            <Link
              href="/simulado"
              className="font-medium text-brand hover:underline"
            >
              simulados
            </Link>
            , toque em &quot;Baixar para estudar offline&quot;.
          </div>
        ) : (
          <ul className="mt-6 grid gap-3">
            {pacotes.map((p) => (
              <li
                key={p.slug}
                className="flex flex-col gap-3 rounded-2xl border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{p.titulo}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.questoes.length} questões · baixado em{" "}
                    {new Date(p.baixadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-none gap-2">
                  <button
                    type="button"
                    onClick={() => setAtivo(p)}
                    className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
                  >
                    Estudar
                  </button>
                  <button
                    type="button"
                    onClick={() => remover(p.slug)}
                    aria-label={`Remover ${p.titulo}`}
                    className="rounded-lg border px-3 py-2 text-muted hover:bg-background"
                  >
                    <TrashIcon size={16} aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
