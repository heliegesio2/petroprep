import { faq } from "@/lib/concurso";

export function FaqSection() {
  return (
    <section id="faq" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-8 divide-y rounded-2xl border bg-surface">
          {faq.map((item) => (
            <details key={item.pergunta} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.pergunta}
                <span className="text-brand transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted">{item.resposta}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
