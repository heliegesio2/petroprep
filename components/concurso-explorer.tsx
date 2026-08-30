"use client";

import { useState } from "react";
import { ConcursoCarousel } from "@/components/concurso-carousel";
import { VagasFiltro } from "@/components/vagas-filtro";
import { ConteudoSection } from "@/components/conteudo-section";
import { EditalSection } from "@/components/edital-section";
import type { Concurso } from "@/lib/concursos";

interface Props {
  concursos: Concurso[];
  /** slug do concurso → arquivos de edital que existem em disco. */
  docsPorConcurso: Record<string, string[]>;
}

export function ConcursoExplorer({ concursos, docsPorConcurso }: Props) {
  const [atual, setAtual] = useState(0);
  const concurso = concursos[atual];

  return (
    <>
      <ConcursoCarousel
        concursos={concursos}
        atual={atual}
        onAtualChange={setAtual}
      />
      <VagasFiltro concurso={concurso} />
      <ConteudoSection concurso={concurso} />
      <EditalSection
        concurso={concurso}
        docs={docsPorConcurso[concurso.slug] ?? []}
      />
    </>
  );
}
