import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  CoinsIcon,
  GraduationCapIcon,
  HourglassIcon,
} from "@phosphor-icons/react/dist/ssr";
import { formatBRL } from "@/lib/concursos";
import { escolaridadesDoCargo, localDoCargo } from "@/lib/cargo-nivel";
import {
  carregarConcursoGuia,
  listarCargosDoConcurso,
} from "@/lib/concurso-guia";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const c = await carregarConcursoGuia(slug).catch(() => null);
  return {
    title: c
      ? `Nível médio técnico - ainda dá tempo - ${c.nome}`
      : "Nível médio técnico",
  };
}

export default async function TecnicoAindaDaTempoPage({ params }: Params) {
  const { slug } = await params;
  const concurso = await carregarConcursoGuia(slug);
  if (!concurso) notFound();

  const cargos = await listarCargosDoConcurso(concurso.id);
  const tecnicos = cargos
    .filter(
      (c) =>
        localDoCargo(c) === "terra" &&
        escolaridadesDoCargo(c).includes("Médio Técnico"),
    )
    .sort((a, b) => b.vagasImediatas - a.vagasImediatas);

  const totalImediatas = tecnicos.reduce((s, c) => s + c.vagasImediatas, 0);
  const totalReserva = tecnicos.reduce((s, c) => s + c.vagasReserva, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/?c=${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
      >
        <ArrowLeftIcon size={15} aria-hidden />
        {concurso.nome}
      </Link>

      <div className="mt-4 flex items-center gap-2">
        <GraduationCapIcon size={22} weight="fill" className="text-brand" aria-hidden />
        <h1 className="text-2xl font-bold tracking-tight">
          Nível médio técnico: ainda dá tempo
        </h1>
      </div>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Nestes cargos o edital exige um curso técnico de nível médio, mas o
        diploma/certificado só precisa ser apresentado na convocação, depois
        da aprovação - não na inscrição nem no dia da prova. Quem ainda está
        cursando o técnico pode ter tempo de concluir até ser chamado(a).
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-surface p-4">
          <p className="text-xs text-muted">Cargos</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {tecnicos.length}
          </p>
        </div>
        <div className="rounded-2xl border bg-surface p-4">
          <p className="text-xs text-muted">Vagas imediatas</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {totalImediatas}
          </p>
        </div>
        <div className="rounded-2xl border bg-surface p-4">
          <p className="text-xs text-muted">Cadastro de reserva</p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums">
            {totalReserva}
          </p>
        </div>
      </div>

      {tecnicos.length === 0 ? (
        <p className="mt-8 rounded-2xl border bg-surface p-6 text-sm text-muted">
          Nenhum cargo de nível médio técnico neste concurso.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {tecnicos.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/concurso/${slug}/vaga/${c.slug}`}
                className="group flex flex-col gap-2 rounded-2xl border bg-surface p-4 transition hover:border-brand/50 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-semibold">{c.nome}</h2>
                  {c.requisito && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {c.requisito}
                    </p>
                  )}
                </div>
                <div className="flex flex-none items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CoinsIcon size={14} className="text-brand" aria-hidden />
                    {c.salario ? formatBRL(c.salario.toNumber(), false) : "conforme edital"}
                  </span>
                  <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand-strong">
                    {c.vagasImediatas} imediatas
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
        <HourglassIcon
          size={18}
          weight="fill"
          className="mt-0.5 flex-none text-amber-600"
          aria-hidden
        />
        <p>
          Cada cargo tem sua própria lista de cursos técnicos aceitos e o
          detalhe de prazo - abra o cargo para ver &ldquo;Como concluir o
          curso técnico a tempo&rdquo;.
        </p>
      </div>

      <p className="mt-8 border-t pt-4 text-xs leading-relaxed text-muted">
        Guia independente, sem vínculo com {concurso.orgao}
        {concurso.banca ? ` ou ${concurso.banca}` : ""}. Prazos de convocação
        e regras de comprovação seguem o edital oficial, que prevalece.
      </p>
    </div>
  );
}
