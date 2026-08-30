import fs from "node:fs";
import path from "node:path";
import { ConcursoExplorer } from "@/components/concurso-explorer";
import { FeatureGrid } from "@/components/feature-grid";
import { PlanosSection } from "@/components/planos-section";
import { FaqSection } from "@/components/faq-section";
import { concursos } from "@/lib/concursos";
import { lerSessao } from "@/lib/auth";

/** Lê quais PDFs existem em public/edital/<slug>/ para cada concurso. */
function lerDocsPorConcurso(): Record<string, string[]> {
  const base = path.join(process.cwd(), "public", "edital");
  const mapa: Record<string, string[]> = {};
  for (const concurso of concursos) {
    try {
      mapa[concurso.slug] = fs
        .readdirSync(path.join(base, concurso.slug))
        .filter((f) => f.toLowerCase().endsWith(".pdf"));
    } catch {
      mapa[concurso.slug] = [];
    }
  }
  return mapa;
}

export default async function Home() {
  const docsPorConcurso = lerDocsPorConcurso();
  const logado = Boolean(await lerSessao());

  return (
    <>
      <ConcursoExplorer concursos={concursos} docsPorConcurso={docsPorConcurso} />
      <FeatureGrid />
      <PlanosSection logado={logado} />
      <FaqSection />
    </>
  );
}
