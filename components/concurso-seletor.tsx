"use client";

import { useRouter } from "next/navigation";

export interface ConcursoOpcao {
  slug: string;
  nome: string;
}

export function ConcursoSeletor({
  concursos,
  atual,
}: {
  concursos: ConcursoOpcao[];
  atual: string;
}) {
  const router = useRouter();
  if (concursos.length < 2) return null;

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="text-muted">Concurso:</span>
      <select
        value={atual}
        onChange={(e) => router.push(`/?c=${e.target.value}`)}
        className="rounded-lg border bg-surface px-3 py-1.5 font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/25"
      >
        {concursos.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.nome}
          </option>
        ))}
      </select>
    </label>
  );
}
