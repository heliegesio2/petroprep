import Link from "next/link";
import { escolaridadeLabel, type Concurso } from "@/lib/concursos";

export function ConteudoSection({ concurso }: { concurso: Concurso }) {
  const topicos = concurso.conteudo;

  return (
    <section id="conteudo" className="border-b py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          O que cai na prova — {concurso.nome}
        </h2>

        {topicos?.length ? (
          <>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Conteúdo programático consolidado a partir do edital e de provas
              anteriores. Cada tópico terá material de estudo e questões na plataforma.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {topicos.map((t) => (
                <div key={t.disciplina} className="rounded-2xl border bg-surface p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{t.disciplina}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        t.natureza === "basico"
                          ? "bg-brand-soft text-brand-strong"
                          : "bg-accent/20 text-foreground"
                      }`}
                    >
                      {t.natureza === "basico" ? "Conhecimentos básicos" : "Específico por cargo"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Cobrada em: {t.escolaridades.map((e) => escolaridadeLabel[e]).join(" · ")}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted">
                    {t.itens.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 flex-none rounded-full bg-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p className="mt-6 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm">
              <strong>Atenção:</strong> conteúdo de referência. O programa definitivo, com o
              peso de cada disciplina, está no edital oficial da banca.
            </p>
          </>
        ) : (
          <div className="mt-6 rounded-2xl border bg-surface p-6">
            <p className="font-semibold">Conteúdo programático de {concurso.nome}: em breve</p>
            <p className="mt-1 text-sm text-muted">
              Estamos montando o material deste concurso. Assine o Plano Completo para ter
              acesso assim que ele entrar no ar.
            </p>
            <Link
              href="#planos"
              className="mt-4 inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
            >
              Ver planos
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
