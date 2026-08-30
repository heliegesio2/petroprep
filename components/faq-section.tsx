import { faq } from "@/lib/concursos";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

export function FaqSection() {
  return (
    <section id="faq" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h2>
        <div className="mt-8 divide-y border-y">
          {faq.map((item) => (
            <details key={item.pergunta} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.pergunta}
                <PlusIcon
                  size={18}
                  weight="bold"
                  className="flex-none text-brand transition-transform group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
                {item.resposta}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
