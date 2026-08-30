import { Reveal, RevealItem } from "@/components/reveal";
import { ExamIcon, BookOpenTextIcon, MapPinAreaIcon, StackIcon } from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    titulo: "Simulados no estilo da banca",
    descricao:
      "Provas objetivas com a distribuição de disciplinas dos últimos editais, cronômetro e correção comentada questão a questão.",
    Icon: ExamIcon,
  },
  {
    titulo: "Conteúdo programático organizado",
    descricao:
      "O edital dividido por cargo e disciplina, com material de estudo, prioridades e o que mais cai historicamente.",
    Icon: BookOpenTextIcon,
  },
  {
    titulo: "Buscador de vagas e cotas",
    descricao:
      "Filtre por escolaridade, área, estado e reserva de vagas para ver quantas oportunidades são do seu perfil e onde a concorrência é menor.",
    Icon: MapPinAreaIcon,
  },
  {
    titulo: "Vários concursos num lugar só",
    descricao:
      "Transpetro em destaque e os próximos grandes concursos no mesmo painel. O Plano Completo libera todos, com material novo a cada edital.",
    Icon: StackIcon,
  },
];

export function FeatureGrid() {
  return (
    <section id="plataforma" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          O que estudar, onde tenho chance, quanto já sei, o que fazer agora
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          As quatro perguntas de todo concurseiro, respondidas no mesmo lugar.
        </p>

        <Reveal as="ul" className="mt-10 divide-y">
          {features.map((f) => (
            <RevealItem key={f.titulo} as="li">
              <div className="flex gap-5 py-6">
                <f.Icon
                  size={30}
                  weight="duotone"
                  className="mt-0.5 flex-none text-brand"
                  aria-hidden
                />
                <div>
                  <h3 className="text-lg font-semibold">{f.titulo}</h3>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
                    {f.descricao}
                  </p>
                </div>
              </div>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
