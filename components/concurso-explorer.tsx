"use client";

import { useMemo, useState } from "react";
import { ConcursoFiltro } from "@/components/concurso-filtro";
import { ConcursoCarousel } from "@/components/concurso-carousel";
import { VagasFiltro } from "@/components/vagas-filtro";
import { ConteudoSection } from "@/components/conteudo-section";
import { EditalSection } from "@/components/edital-section";
import {
  concursoAtendeFiltro,
  filtroConcursosVazio,
  resumoConcursos,
  type Concurso,
  type FiltroConcursos,
} from "@/lib/concursos";

interface Props {
  concursos: Concurso[];
  /** slug do concurso -> arquivos de edital que existem em disco. */
  docsPorConcurso: Record<string, string[]>;
}

export function ConcursoExplorer({ concursos, docsPorConcurso }: Props) {
  const [filtro, setFiltro] = useState<FiltroConcursos>(filtroConcursosVazio);
  const [atual, setAtual] = useState(0);

  const filtrados = useMemo(
    () => concursos.filter((c) => concursoAtendeFiltro(c, filtro)),
    [concursos, filtro],
  );
  const resumo = useMemo(() => resumoConcursos(filtrados), [filtrados]);

  const indice = Math.min(atual, Math.max(0, filtrados.length - 1));
  const concurso = filtrados[indice];
  const filtroAtivo =
    filtro.escolaridade !== "todas" ||
    filtro.situacao !== "todas" ||
    filtro.salarioMinimo > 0;

  function aplicarFiltro(f: FiltroConcursos) {
    setFiltro(f);
    setAtual(0);
  }

  return (
    <>
      <ConcursoFiltro
        filtro={filtro}
        onFiltroChange={aplicarFiltro}
        resumo={resumo}
        ativo={filtroAtivo}
        onLimpar={() => aplicarFiltro(filtroConcursosVazio)}
      />

      {concurso ? (
        <>
          <ConcursoCarousel
            concursos={filtrados}
            atual={indice}
            onAtualChange={setAtual}
          />
          <VagasFiltro concurso={concurso} />
          <ConteudoSection concurso={concurso} />
          <EditalSection
            concurso={concurso}
            docs={docsPorConcurso[concurso.slug] ?? []}
          />
        </>
      ) : null}
    </>
  );
}
