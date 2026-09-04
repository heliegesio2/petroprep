// Gera prisma/dados/transpetro-2026/cargos-detalhe.json a partir de site/vagas/*.html.
//
// Rode a partir da raiz do repo:  node prisma/dados/transpetro-2026/build-detalhe.mjs
//
// Cada pagina site/vagas/<slug>.html e o guia completo do candidato para uma enfase.
// As secoes por cargo (variam dentro de um mesmo edital) sao:
//   #resumo  #vagas  #requisitos  #curso-tecnico  #conteudo (parte "Conhecimentos Especificos")
//   #requisitos-gerais (remuneracao, em alguns editais)
// As secoes comuns a um edital inteiro (#identificacao, #modalidades, #cronograma, #taxa, ...)
// nao entram aqui - ver nota no fim do arquivo.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const VAGAS_DIR = join(HERE, "..", "..", "..", "site", "vagas");
const OUT = join(HERE, "cargos-detalhe.json");

/** Regra dura do projeto: nada de em-dash / en-dash em texto visivel. */
function limpar(s) {
  if (s == null) return null;
  const t = s
    .replace(/\s*[—–]\s*/g, " - ")
    .replace(/ /g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.length ? t : null;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&aacute;/g, "a")
    .replace(/&nbsp;/g, " ");
}

/** Tira tags mas preserva o texto de links como "texto (url)". */
function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<a [^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/gs, (_, href, txt) => {
        const clean = txt.replace(/<[^>]+>/g, "").trim();
        return href.startsWith("http") ? `${clean} (${href})` : clean;
      })
      .replace(/<[^>]+>/g, " "),
  );
}

function text(html) {
  const t = stripTags(html)
    .replace(/\s+([.,;:!?])/g, "$1")
    .replace(/([.,;:])\1+/g, "$1")
    .replace(/\.\s+\./g, ".");
  return limpar(t);
}

function section(html, id) {
  const re = new RegExp(
    `<section class="section-card" id="${id}">(.*?)</section>`,
    "s",
  );
  const m = html.match(re);
  return m ? m[1] : null;
}

/** Conteudo de um <p><strong>Rotulo:</strong> corpo</p> ou <li><strong>Rotulo</strong>: corpo</li>. */
function labeled(sectionHtml, labelRegex) {
  if (!sectionHtml) return null;
  const re = new RegExp(
    `<(p|li)>\\s*<strong>\\s*(${labelRegex})\\s*:?\\s*</strong>\\s*:?\\s*(.*?)</\\1>`,
    "is",
  );
  const m = sectionHtml.match(re);
  return m ? text(m[3]) : null;
}

// --------------------------------------------------------------------------
// Conteudo especifico (Modulo II)
// --------------------------------------------------------------------------

/** Divide "1 A. 2 B. 3 C" ou "A; B; C" em itens. */
function itensDeParagrafo(txt) {
  if (!txt) return [];
  const numerado = (txt.match(/\b\d+\s+[A-ZÀ-Ý]/g) || []).length;
  if (numerado >= 3) {
    return txt
      .split(/\s+(?=\d+\s+[A-ZÀ-Ý])/)
      .map((s) => limpar(s.replace(/^\d+[\s.)-]+/, "")))
      .filter((s) => s && s.length > 3);
  }
  const romano = (txt.match(/\b[IVX]{1,4}\.\s+[A-ZÀ-Ý]/g) || []).length;
  if (romano >= 3) {
    return txt
      .split(/\s+(?=[IVX]{1,4}\.\s+[A-ZÀ-Ý])/)
      .map((s) => limpar(s.replace(/^[IVX]{1,4}\.\s*/, "")))
      .filter((s) => s && s.length > 3);
  }
  if ((txt.match(/;/g) || []).length >= 3) {
    return txt
      .split(/\s*;\s*/)
      .map((s) => limpar(s.replace(/\.$/, "")))
      .filter((s) => s && s.length > 3);
  }
  return [limpar(txt)].filter(Boolean);
}

/** Extrai a parte "Conhecimentos Especificos" do #conteudo -> [{ titulo, editalTexto }]. */
function conteudoEspecifico(html) {
  const sec = section(html, "conteudo");
  if (!sec) return { itens: [], nota: null };
  const idx = sec.search(/<h3>\s*Conhecimentos Espec[íi]ficos/i);
  if (idx < 0) return { itens: [], nota: null };
  let spec = sec.slice(idx).replace(/^<h3>.*?<\/h3>/s, "");

  // nota "(Observacao: ...)" no fim
  let nota = null;
  const notaM = spec.match(/<p>\s*<em>\s*\((Observa[çc][ãa]o[^]*?)\)\s*<\/em>\s*<\/p>/i);
  if (notaM) {
    nota = limpar(notaM[1]);
    spec = spec.replace(notaM[0], "");
  }

  const itens = [];
  const detalhes = [...spec.matchAll(/<details[^>]*>(.*?)<\/details>/gs)];

  if (detalhes.length) {
    // Familia "naval / tecnico": intro em <p> + acordeoes <summary> + <div class="acc-body">
    const intro = spec.slice(0, spec.indexOf("<details"));
    const introTxt = text(intro);
    if (introTxt && /compartilha|comuns/i.test(introTxt)) {
      itens.push({ titulo: "Blocos comuns do edital", editalTexto: introTxt });
    }
    for (const d of detalhes) {
      const sm = d[1].match(/<summary>(.*?)<\/summary>/s);
      const titulo = sm ? text(sm[1]) : null;
      if (!titulo || /extenso|adicionalmente/i.test(titulo)) continue;
      const body = d[1].replace(/<summary>.*?<\/summary>/s, "");
      const bodyTxt = text(body);
      itens.push({ titulo, editalTexto: bodyTxt || null });
    }
    return { itens, nota };
  }

  // Familia "plain": um ou mais <p> com lista
  const paras = [...spec.matchAll(/<p>(.*?)<\/p>/gs)].map((m) => text(m[1]));
  for (const p of paras) {
    if (!p) continue;
    for (const it of itensDeParagrafo(p)) {
      itens.push({ titulo: it, editalTexto: null });
    }
  }
  return { itens, nota };
}

// --------------------------------------------------------------------------
// Tabela de vagas por modalidade
// --------------------------------------------------------------------------

function vagasModalidade(html) {
  const sec = section(html, "vagas");
  if (!sec) return null;
  const tbl = sec.match(/<table>(.*?)<\/table>/s);
  if (!tbl) return null;
  const rows = [...tbl[1].matchAll(/<tr>(.*?)<\/tr>/gs)];
  const mapa = {
    "Ampla Concorrência": "ac",
    "Pessoa com Deficiência": "pcd",
    "Pessoa Negra": "pn",
    "Pessoa Indígena": "pi",
    "Pessoa Quilombola": "pq",
    TOTAL: "total",
  };
  const out = {};
  for (const r of rows) {
    const cells = [...r[1].matchAll(/<td>(.*?)<\/td>/gs)].map((c) =>
      text(c[1]),
    );
    if (cells.length < 3) continue;
    const key = Object.entries(mapa).find(([nome]) =>
      cells[0].startsWith(nome),
    )?.[1];
    if (!key) continue;
    out[key] = { imediatas: Number(cells[1]) || 0, reserva: Number(cells[2]) || 0 };
  }
  return Object.keys(out).length ? out : null;
}

// --------------------------------------------------------------------------
// "Como concluir o curso tecnico a tempo"
// --------------------------------------------------------------------------

function cursoTecnico(html) {
  const sec = section(html, "curso-tecnico");
  if (!sec) return null;
  const blocos = [];
  const re = /<(h3|p|ul)>(.*?)<\/\1>/gs;
  let m;
  while ((m = re.exec(sec))) {
    const tag = m[1];
    if (tag === "h3") {
      blocos.push({ tipo: "titulo", texto: text(m[2]) });
    } else if (tag === "p") {
      const t = text(m[2]);
      if (t) blocos.push({ tipo: "paragrafo", texto: t });
    } else {
      const itens = [...m[2].matchAll(/<li>(.*?)<\/li>/gs)]
        .map((li) => text(li[1]))
        .filter(Boolean);
      if (itens.length) blocos.push({ tipo: "lista", itens });
    }
  }
  return blocos.length ? blocos : null;
}

function calloutCurso(html) {
  const sec = section(html, "requisitos");
  if (!sec) return null;
  const m = sec.match(/<div class="callout">(.*?)<\/div>/s);
  return m ? text(m[1].replace(/^\s*📌\s*/, "")) : null;
}

// --------------------------------------------------------------------------

function parseFile(file) {
  const slug = file.replace(/\.html$/, "");
  const html = readFileSync(join(VAGAS_DIR, file), "utf-8");
  const reqSec = section(html, "requisitos");
  const gerSec = section(html, "requisitos-gerais");

  const requisito =
    labeled(reqSec, "Escolaridade exigida|Requisito|Requisitos[^<:]*") ||
    requisitoDeLista(reqSec);
  const finalidade = labeled(reqSec, "Finalidade[^<:]*");
  const remuneracao =
    labeled(reqSec, "Remuneração|Soldada") ||
    labeled(gerSec, "Remuneração|Soldada") ||
    labeled(section(html, "resumo"), "Remuneração");
  const atribuicoes =
    labeled(reqSec, "Síntese das Atribuições|Atribuições[^<:]*") ||
    atribuicoesDeSubsecao(reqSec);

  const { itens, nota } = conteudoEspecifico(html);

  return {
    slug,
    requisito,
    finalidade,
    remuneracao,
    atribuicoes,
    conteudo_especifico: itens,
    conteudo_especifico_nota: nota,
    vagas_modalidade: vagasModalidade(html),
    curso_tecnico: cursoTecnico(html),
    callout_curso: calloutCurso(html),
  };
}

/** Requisitos como <p><strong>Requisitos (...)</strong></p><ul><li>..</li></ul>. */
function requisitoDeLista(sec) {
  if (!sec || !/<strong>\s*Requisitos?\s*\(/i.test(sec)) return null;
  const ul = sec.match(/<strong>\s*Requisitos?\s*\([^<]*<\/strong>\s*<\/p>\s*<ul>(.*?)<\/ul>/is);
  if (!ul) return null;
  const itens = [...ul[1].matchAll(/<li>(.*?)<\/li>/gs)]
    .map((li) => text(li[1]))
    .filter(Boolean);
  return itens.length ? itens.join("; ") : null;
}

/** <h3>...Atribuições...</h3><p>..</p> ou bloco "Sintese". */
function atribuicoesDeSubsecao(sec) {
  if (!sec) return null;
  const m = sec.match(/<h3>[^<]*Atribui[çc][õo]es[^<]*<\/h3>\s*(<p>.*?<\/p>)+/is);
  return m ? text(m[0].replace(/<h3>.*?<\/h3>/s, "")) : null;
}

const files = readdirSync(VAGAS_DIR)
  .filter((f) => f.endsWith(".html"))
  .sort();
const out = files.map(parseFile);
writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

const stat = (k) => out.filter((c) => c[k] && (!Array.isArray(c[k]) || c[k].length)).length;
console.log(`${out.length} cargos ->`, {
  requisito: stat("requisito"),
  finalidade: stat("finalidade"),
  remuneracao: stat("remuneracao"),
  atribuicoes: stat("atribuicoes"),
  conteudo_especifico: stat("conteudo_especifico"),
  vagas_modalidade: stat("vagas_modalidade"),
  curso_tecnico: stat("curso_tecnico"),
  callout_curso: stat("callout_curso"),
});

// Secoes comuns ao edital inteiro (identificacao, modalidades, cronograma, taxa,
// cidades de prova, regras de admissao, etapas, desempate, validade, outras
// informacoes) NAO sao extraidas aqui - se um dia forem para o app, o lugar
// certo e um modelo de nivel-edital, nao repetido em cada cargo.
