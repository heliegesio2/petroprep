import fs from "node:fs";
import path from "node:path";
import { SiteNav } from "@/components/site-nav";
import { ConcursoExplorer } from "@/components/concurso-explorer";
import { FeatureGrid } from "@/components/feature-grid";
import { PlanosSection } from "@/components/planos-section";
import { FaqSection } from "@/components/faq-section";
import { SiteFooter } from "@/components/site-footer";
import { concursos } from "@/lib/concursos";

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

export default function Home() {
  const docsPorConcurso = lerDocsPorConcurso();

  return (
    <>
      <SiteNav />
      <main className="flex-1">
        <ConcursoExplorer concursos={concursos} docsPorConcurso={docsPorConcurso} />
        <FeatureGrid />
        <PlanosSection />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  );
}
