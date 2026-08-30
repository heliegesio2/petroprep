import { concursoDestaque, type Concurso } from "@/lib/concursos";

/** Nome de arquivo esperado → rótulo exibido. */
const DOCS_CATALOGO: { arquivo: string; titulo: string }[] = [
  { arquivo: "edital.pdf", titulo: "Edital de abertura" },
  { arquivo: "conteudo-programatico.pdf", titulo: "Conteúdo programático completo" },
  { arquivo: "cronograma.pdf", titulo: "Cronograma e datas" },
];

interface Props {
  concurso: Concurso;
  /** Arquivos que realmente existem em public/edital/<slug>/ (vem de app/page.tsx). */
  docs: string[];
}

export function EditalSection({ concurso, docs }: Props) {
  const itens = DOCS_CATALOGO.filter((d) => docs.includes(d.arquivo));
  const algumDisponivel = itens.length > 0;

  return (
    <section id="edital" className="border-b py-12 lg:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Edital e documentos — {concurso.nome}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          {algumDisponivel
            ? "Baixe os documentos abaixo. O resumo com o que muda em relação ao concurso anterior está no material dos assinantes."
            : concurso.status === "previsto"
              ? "O edital deste concurso ainda não foi publicado. Assine o Plano Completo para ser avisado assim que sair."
              : "Estamos organizando os PDFs deste concurso. Enquanto isso, use o link oficial abaixo."}
        </p>

        {algumDisponivel && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {itens.map((i) => (
              <div key={i.arquivo} className="flex flex-col rounded-2xl border bg-surface p-5">
                <FileIcon />
                <h3 className="mt-3 font-semibold">{i.titulo}</h3>
                <a
                  href={`/edital/${concurso.slug}/${i.arquivo}`}
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                  download
                >
                  Baixar PDF
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl border bg-surface p-6">
          <h3 className="font-semibold">Canais oficiais</h3>
          <p className="mt-1 text-sm text-muted">
            Inscrições e editais verdadeiros só saem nos sites oficiais. Esta plataforma
            não faz inscrição no seu lugar.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {concurso.linkOficial && (
              <li>
                <a
                  href={concurso.linkOficial}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  Edital / inscrição — {concurso.orgao} ↗
                </a>
              </li>
            )}
            <li>
              <a
                href="https://www.cesgranrio.org.br"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand hover:underline"
              >
                Fundação Cesgranrio ↗
              </a>
            </li>
            {concurso.slug !== concursoDestaque.slug && (
              <li className="text-muted">
                Não achou? Busque pelo nome do órgão + &quot;concurso {new Date().getFullYear()}&quot;.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

function FileIcon() {
  return (
    <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand-strong">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M14 3v5h5M7 3h8l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    </div>
  );
}
