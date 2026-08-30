"use client";

import { useState } from "react";
import { planos } from "@/lib/planos";
import { AssinarForm } from "@/components/assinar-form";

export function PlanosSection() {
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null);

  return (
    <section id="planos" className="border-b bg-brand-soft/40 py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Escolha seu plano
          </h2>
          <p className="mt-3 text-muted">
            Pagamento único, sem mensalidade. Acesso a todo o material, simulados e ao
            buscador de vagas.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`flex flex-col rounded-2xl border bg-surface p-6 ${
                plano.destaque ? "border-brand ring-1 ring-brand/30" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{plano.nome}</h3>
                {plano.destaque && (
                  <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand-strong">
                    Mais procurado
                  </span>
                )}
              </div>

              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-black">R$ {plano.preco}</span>
                <span className="text-sm text-muted">único</span>
              </p>
              <p className="mt-1 text-sm text-muted">{plano.periodo}</p>
              <p className="mt-3 text-sm">{plano.resumo}</p>

              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plano.beneficios.map((b) => (
                  <li key={b} className="flex gap-2">
                    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 flex-none text-brand" fill="currentColor" aria-hidden>
                      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.3 3.29 6.8-6.79a1 1 0 0 1 1.4 0Z" clipRule="evenodd" />
                    </svg>
                    {b}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setPlanoSelecionado(plano.id)}
                className={`mt-6 rounded-lg px-5 py-3 font-semibold transition-colors ${
                  plano.destaque
                    ? "bg-brand text-white hover:bg-brand-strong"
                    : "border hover:bg-background"
                }`}
              >
                Assinar {plano.nome}
              </button>
            </div>
          ))}
        </div>

        {planoSelecionado && (
          <div className="mt-6 max-w-xl">
            <AssinarForm
              planoId={planoSelecionado}
              onTrocarPlano={setPlanoSelecionado}
            />
          </div>
        )}
      </div>
    </section>
  );
}
