import fs from "node:fs";
import path from "node:path";
import { concurso } from "@/lib/concurso";

const PDF_DIR = path.join(process.cwd(), "public", "edital");

interface Documento {
  arquivo: string;
  titulo: string;
}

/** Catálogo dos documentos esperados na pasta public/edital. */
const documentos: Documento[] = [
  { arquivo: "edital-petrobras-2027.pdf", titulo: "Edital de abertura" },
  { arquivo: "conteudo-programatico.pdf", titulo: "Conteúdo programático completo" },
  { arquivo: "cronograma.pdf", titulo: "Cronograma e datas" },
];

function existe(arquivo: string): number | null {
  try {
    const stat = fs.statSync(path.join(PDF_DIR, arquivo));
    return stat.size;
  } catch {
    return null;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function EditalSection() {
  const itens = documentos.map((d) => ({ ...d, tamanho: existe(d.arquivo) }));
  const algumDisponivel = itens.some((i) => i.tamanho !== null);

  return (
    <section id="edital" className="border-b py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Edital e documentos oficiais
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          {algumDisponivel
            ? "Baixe os documentos abaixo. Nossa equipe já preparou o resumo com o que muda em relação ao concurso anterior."
            : "O edital do concurso Petrobras 2027 ainda não foi publicado. Assim que sair, os PDFs aparecem aqui e vão por e-mail para quem está na lista."}
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {itens.map((i) => (
            <div key={i.arquivo} className="flex flex-col rounded-2xl border bg-surface p-5">
              <FileIcon />
              <h3 className="mt-3 font-semibold">{i.titulo}</h3>
              {i.tamanho !== null ? (
                <a
                  href={`/edital/${i.arquivo}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-strong"
                  download
                >
                  Baixar PDF
                  <span className="text-xs font-normal opacity-80">
                    ({formatSize(i.tamanho)})
                  </span>
                </a>
              ) : (
                <span className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-dashed px-4 py-2 text-sm text-muted">
                  Em breve
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border bg-surface p-6">
          <h3 className="font-semibold">Canais oficiais</h3>
          <p className="mt-1 text-sm text-muted">
            As inscrições e o edital verdadeiro só saem nestes endereços. A
            PetroPrep não faz inscrição no seu lugar.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {concurso.linksOficiais.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand hover:underline"
                >
                  {l.label} ↗
                </a>
              </li>
            ))}
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
