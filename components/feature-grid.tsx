const features = [
  {
    titulo: "Simulados no estilo da banca",
    descricao:
      "Provas objetivas com a mesma distribuição de disciplinas dos últimos editais, cronômetro e correção comentada questão a questão.",
    icon: "M4 6h16M4 12h16M4 18h10",
  },
  {
    titulo: "Conteúdo programático organizado",
    descricao:
      "Todo o edital dividido por cargo e disciplina, com material de estudo, prioridades e o que mais cai historicamente.",
    icon: "M5 4h14v16l-7-3-7 3z",
  },
  {
    titulo: "Buscador de vagas por filtro",
    descricao:
      "Filtre por escolaridade, área, estado e requisito e veja só as vagas em que você pode concorrer — e onde a concorrência é menor.",
    icon: "M10 4a6 6 0 1 0 3.5 10.9L19 20l1-1-5.1-5.5A6 6 0 0 0 10 4z",
  },
  {
    titulo: "Diagnóstico de desempenho",
    descricao:
      "Depois de cada simulado, veja sua nota projetada, os pontos fracos por disciplina e o que estudar na próxima semana.",
    icon: "M4 19V5m5 14V9m5 10V7m5 12V11",
  },
];

export function FeatureGrid() {
  return (
    <section id="plataforma" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Uma plataforma para as quatro perguntas de todo concurseiro
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          O que estudar, onde tenho chance, quanto já sei e o que fazer agora.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.titulo}
              className="rounded-2xl border bg-surface p-6 transition-colors hover:border-brand/40"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand-strong">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d={f.icon} />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.titulo}</h3>
              <p className="mt-2 text-sm text-muted">{f.descricao}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
