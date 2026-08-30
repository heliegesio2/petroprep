import {
  concursoDestaque,
  linkInscricaoDoConcurso,
  type Concurso,
} from "@/lib/concursos";
import { FileArrowDownIcon, FilePdfIcon, ArrowUpRightIcon } from "@phosphor-icons/react/dist/ssr";

const DOCS_CATALOGO: { arquivo: string; titulo: string }[] = [
  { arquivo: "edital.pdf", titulo: "Edital de abertura" },
  { arquivo: "conteudo-programatico.pdf", titulo: "Conteúdo programático completo" },
  { arquivo: "cronograma.pdf", titulo: "Cronograma e datas" },
];

interface Props {
  concurso: Concurso;
  /** Arquivos que existem em public/edital/<slug>/ (calculado em app/page.tsx). */
  docs: string[];
}

export function EditalSection({ concurso, docs }: Props) {
  const itens = DOCS_CATALOGO.filter((d) => docs.includes(d.arquivo));
  const algumDisponivel = itens.length > 0;

  return (
    <section id="edital" className="border-b py-14 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Edital e documentos: {concurso.nome}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {algumDisponivel
            ? "Baixe os documentos abaixo. O resumo do que muda em relação ao concurso anterior está no material dos assinantes."
            : concurso.status === "previsto"
              ? "O edital deste concurso ainda não foi publicado. Assine o Plano Completo para ser avisado assim que sair."
              : "Estamos organizando os PDFs deste concurso. Enquanto isso, use o link oficial abaixo."}
        </p>

        {algumDisponivel && (
          <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {itens.map((i) => (
              <div key={i.arquivo} className="border-t pt-5">
                <FilePdfIcon size={24} weight="duotone" className="text-brand" aria-hidden />
                <h3 className="mt-3 font-semibold">{i.titulo}</h3>
                <a
                  href={`/edital/${concurso.slug}/${i.arquivo}`}
                  className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                  download
                >
                  <FileArrowDownIcon size={16} weight="bold" aria-hidden />
                  Baixar PDF
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 max-w-2xl rounded-2xl border bg-surface p-6">
          <h3 className="font-semibold">Canais oficiais</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Inscrições e editais verdadeiros só saem nos sites oficiais. Esta plataforma
            não faz inscrição no seu lugar.
          </p>
          <ul className="mt-4 grid gap-2 text-sm">
            {linkInscricaoDoConcurso(concurso) && (
              <li>
                <a
                  href={linkInscricaoDoConcurso(concurso)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                >
                  Fazer a inscrição e pagar a taxa (site oficial)
                  <ArrowUpRightIcon size={14} weight="bold" aria-hidden />
                </a>
              </li>
            )}
            {concurso.linkOficial &&
              concurso.linkOficial !== linkInscricaoDoConcurso(concurso) && (
                <li>
                  <a
                    href={concurso.linkOficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                  >
                    Página do concurso e edital
                    <ArrowUpRightIcon size={14} weight="bold" aria-hidden />
                  </a>
                </li>
              )}
            {concurso.slug !== concursoDestaque.slug && (
              <li className="text-muted">
                Não achou? Busque pelo nome do órgão mais &quot;concurso{" "}
                {new Date().getFullYear()}&quot;.
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
