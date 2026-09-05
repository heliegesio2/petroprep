/**
 * Referência estática de municípios e estados do Brasil (fonte: IBGE, API de
 * localidades - https://servicodados.ibge.gov.br/api/v1/localidades/municipios).
 * Serve pra enriquecer `localidades` (cidade + vagas) que já vêm dos editais
 * com UF/região/código IBGE, sem precisar redigitar isso em cada dataset de
 * concurso. Dados geográficos do Brasil não mudam (5.571 municípios, 27 UFs);
 * por isso é JSON estático em vez de tabela no banco.
 */
import municipiosData from "@/prisma/dados/referencia/municipios-brasil.json";
import estadosData from "@/prisma/dados/referencia/estados-brasil.json";

export interface Municipio {
  nome: string;
  uf: string;
  ufNome: string;
  regiao: "N" | "NE" | "CO" | "SE" | "S";
  ibgeId: number;
  capital: boolean;
}

export interface Estado {
  uf: string;
  nome: string;
  regiao: "N" | "NE" | "CO" | "SE" | "S";
}

export const municipios = municipiosData as Municipio[];
export const estados = estadosData as Estado[];

function semAcento(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const porNomeNormalizado = new Map<string, Municipio[]>();
for (const m of municipios) {
  const chave = semAcento(m.nome);
  const lista = porNomeNormalizado.get(chave) ?? [];
  lista.push(m);
  porNomeNormalizado.set(chave, lista);
}

/**
 * Acha o município pelo nome (ignora acento/caixa). Se houver mais de uma
 * cidade com esse nome em UFs diferentes, passe `uf` pra desambiguar; sem
 * `uf` e mais de um resultado, retorna null (evita enriquecer errado).
 */
export function buscarMunicipio(nome: string, uf?: string): Municipio | null {
  const candidatos = porNomeNormalizado.get(semAcento(nome)) ?? [];
  if (uf) return candidatos.find((m) => m.uf === uf.toUpperCase()) ?? null;
  return candidatos.length === 1 ? candidatos[0] : null;
}

export function municipiosPorUf(uf: string): Municipio[] {
  return municipios.filter((m) => m.uf === uf.toUpperCase());
}

export function estadoPorSigla(uf: string): Estado | null {
  return estados.find((e) => e.uf === uf.toUpperCase()) ?? null;
}

/** Enriquece uma localidade {cidade, vagas} de um edital com UF/região do IBGE. */
export function enriquecerLocalidade<T extends { cidade: string; uf?: string }>(
  localidade: T,
): T & { municipio: Municipio | null } {
  return {
    ...localidade,
    municipio: buscarMunicipio(localidade.cidade, localidade.uf),
  };
}
