/**
 * Classifica cargos do guia por escolaridade (Fundamental/Médio/Médio Técnico/
 * Superior) e local de trabalho (embarcado/terra) a partir do texto que já vem
 * do edital (`CargoConcurso.nivel` e `.requisito`). Não inventa nível: quando o
 * próprio edital agrupa (ex.: "Fundamental/Médio" das praças, "Técnico/Superior
 * Marítimo" dos oficiais), o cargo entra nas duas categorias.
 */

export type Escolaridade = "Fundamental" | "Médio" | "Médio Técnico" | "Superior";
export type Local = "embarcado" | "terra";

export interface CargoNivelInfo {
  nivel: string;
  requisito: string | null;
}

/** Cargo de nível médio que exige curso técnico ainda em andamento. */
export function exigeCursoTecnico(requisito: string | null) {
  if (!requisito) return false;
  return /curso t[ée]cnico/i.test(requisito) && !/n[ãa]o exige/i.test(requisito);
}

export function localDoCargo(c: CargoNivelInfo): Local {
  return /embarque/i.test(c.nivel) ? "embarcado" : "terra";
}

export function escolaridadesDoCargo(c: CargoNivelInfo): Escolaridade[] {
  if (localDoCargo(c) === "embarcado") {
    if (/mar[íi]timo/i.test(c.nivel)) return ["Médio Técnico", "Superior"];
    return ["Fundamental", "Médio"];
  }
  if (/superior/i.test(c.nivel)) return ["Superior"];
  return exigeCursoTecnico(c.requisito) ? ["Médio Técnico"] : ["Médio"];
}

export function escolaridadeLabelDe(c: CargoNivelInfo) {
  return escolaridadesDoCargo(c).join(" / ");
}

export const ESCOLARIDADES: Escolaridade[] = [
  "Fundamental",
  "Médio",
  "Médio Técnico",
  "Superior",
];

/** Palavras que indicam exigência ou diferencial de pós-graduação num requisito. */
const RE_POS_GERAL =
  /p[óo]s[- ]gradua|especializa[çc][ãa]o|\bmestrado\b|\bdoutorado\b|\bmba\b/i;

export function requisitoMencionaPos(requisito: string | null) {
  return requisito ? RE_POS_GERAL.test(requisito) : false;
}
