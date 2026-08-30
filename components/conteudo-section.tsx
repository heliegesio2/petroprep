import { conteudoProgramatico, escolaridadeLabel } from "@/lib/concurso";

export function ConteudoSection() {
  return (
    <section id="conteudo" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          O que cai na prova
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Conteúdo programático consolidado a partir dos últimos editais da
          Petrobras e da Transpetro. Cada tópico terá material de estudo e
          questões na plataforma.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {conteudoProgramatico.map((t) => (
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
          <strong>Atenção:</strong> este é um conteúdo de referência. O programa
          definitivo, com o peso de cada disciplina, sai apenas no edital
          oficial. Quem está na lista recebe o comparativo assim que ele for
          publicado.
        </p>
      </div>
    </section>
  );
}
