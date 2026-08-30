import { WaitlistForm } from "@/components/waitlist-form";

export function WaitlistSection() {
  return (
    <section id="lista" className="border-b bg-brand-soft/40 py-16 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Entre na lista e saia na frente
          </h2>
          <p className="mt-3 text-muted">
            Quem entra agora começa a estudar com plano definido, recebe o resumo
            do edital em primeira mão e testa os simulados antes de todo mundo.
          </p>
          <ul className="mt-6 space-y-2 text-sm">
            <li>✅ Plano de estudos inicial por escolaridade</li>
            <li>✅ Comparativo do edital novo x anterior, assim que sair</li>
            <li>✅ Primeiro simulado diagnóstico gratuito</li>
          </ul>
        </div>
        <div id="lista-form">
          <WaitlistForm />
        </div>
      </div>
    </section>
  );
}
