import { type Concurso } from "@/lib/concursos";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { ConteudoProgresso } from "@/components/conteudo-progresso";

export function ConteudoSection({ concurso }: { concurso: Concurso }) {
  const topicos = concurso.conteudo;

  return (
    <section id="conteudo" className="border-b py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          O que cai na prova: {concurso.nome}
        </h2>

        {topicos?.length ? (
          <>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Programa consolidado a partir do edital e de provas anteriores da banca.
              Abra cada disciplina para o resumo do que a Cesgranrio cobra e marque o
              que já estudou.
            </p>

            <ConteudoProgresso
              topicos={topicos}
              storageKey={`petroprep_estudo_${concurso.slug}`}
            />

            <p className="mt-8 flex max-w-2xl gap-2 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm leading-relaxed">
              <WarningCircleIcon
                size={18}
                weight="fill"
                className="mt-px flex-none text-accent"
                aria-hidden
              />
              <span>
                Conteúdo de referência. O programa definitivo, com o peso de cada
                disciplina, está no edital oficial da banca.
              </span>
            </p>
          </>
        ) : (
          <div className="mt-6 max-w-2xl rounded-2xl border bg-surface p-6">
            <p className="font-semibold">
              Conteúdo programático de {concurso.nome}: em breve
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Estamos montando o material deste concurso. Assine o Plano Completo para
              ter acesso assim que ele entrar no ar.
            </p>
            <a
              href="#planos"
              className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Assinar
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
