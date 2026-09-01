# -*- coding: utf-8 -*-
"""
Gera as páginas internas de cada cargo ("Saiba mais"), a página de teste
("em breve") e os arquivos de dados/esquema (JSON + Markdown) que descrevem
como este guia foi enriquecido — para que a outra parte do projeto (o sistema
que faz a interligação/backend real do site) saiba de onde vêm os dados e
como replicar o padrão em novos editais.
"""
import json, re, html, unicodedata
from urllib.parse import quote

DATA_DIR = '/home/claude/tocantins_saude'
OUT_VAGAS = f'{DATA_DIR}/vagas'
OUT_TESTES = f'{DATA_DIR}/testes'
OUT_SCHEMA = f'{DATA_DIR}/schema'

cargos = json.load(open(f'{DATA_DIR}/cargos_final.json', encoding='utf-8'))
mod1 = json.load(open(f'{DATA_DIR}/modulo1_gerais.json', encoding='utf-8'))

FONTE_EDITAL = 'https://conhecimento.fgv.br/concursos/sesto26/'
EDITAL_NOME = 'Edital nº 001/2026 – SECAD/SES/TO'

LOC_NAMES = {
    'PORTO NACIONAL': 'Porto Nacional', 'AUGUSTINOPOLIS': 'Augustinópolis',
    'PARAISO': 'Paraíso do Tocantins', 'MIRACEMA': 'Miracema do Tocantins',
    'PALMAS': 'Palmas', 'ARAPOEMA': 'Arapoema', 'PEDRO AFONSO': 'Pedro Afonso',
    'ALVORADA': 'Alvorada', 'ARAGUAÇU': 'Araguaçu', 'GURUPI': 'Gurupi',
    'ARAGUAINA': 'Araguaína', 'GUARAI': 'Guaraí', 'XAMBIOA': 'Xambioá',
    'ARRAIAS': 'Arraias', 'DIANOPOLIS': 'Dianópolis',
}

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s

def esc(s):
    return html.escape(s or '', quote=True)

def clean_text(t):
    if not t:
        return ''
    t = re.sub(r'=+\s*PAGE\s*\d+\s*=+', ' ', t, flags=re.I)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def parse_list(text):
    """Quebra um texto enumerado ('1. a; 2. b; 3. c' ou '1. a. 2. b. 3. c')
    em uma lista de itens limpos, um por linha."""
    text = clean_text(text)
    if not text:
        return []
    parts = re.split(r'[;.]\s*(?=\d+\.\s)', text)
    items = []
    for p in parts:
        p = p.strip()
        p = re.sub(r'^\d+\.\s*', '', p)
        p = p.rstrip(';').rstrip('.').strip()
        if p:
            items.append(p)
    # se não conseguimos separar em pelo menos 2 itens, não é uma lista real
    if len(items) < 2:
        return []
    return items

# ---------- ícones (SVG inline, para não depender de fontes externas) ----------
ICON_CHECK = '<svg class="ic" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".14"/><path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ICON_BOOK = '<svg class="ic" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" fill="currentColor" opacity=".14"/><path d="M4 5.5C4 4.67 4.67 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M20 5.5c0-.83-.67-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'

def esc_list_html(items, icon=ICON_CHECK):
    lis = ''.join(f'<li>{icon}<span class="tx">{esc(it)}</span></li>' for it in items)
    return f'<ul class="icon-list">{lis}</ul>'

# ---------- carrega dados de módulo I (matérias gerais, comuns a todos os cargos do mesmo nível) ----------
def materia_slug(nivel, nome):
    return f"{slug(nivel)}--{slug(nome)}"

MATERIAS_POR_NIVEL = {
    'medio': list(mod1['medio'].keys()),
    'superior': list(mod1['superior'].keys()),
}

def nivel_key(nivel_label):
    return 'medio' if 'dio' in nivel_label.lower() or 'cnico' in nivel_label.lower() else 'superior'

# ---------- template da página de detalhe do cargo ----------
DETAIL_TPL = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{nome} — Concurso Saúde Tocantins 2026 | PetroPrep</title>
<meta name="description" content="Requisitos, conteúdo específico e vagas por cidade para {nome} no Concurso Saúde Tocantins 2026 (SECAD/SES/TO).">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>

<div class="announce">🩺 Concurso Saúde Tocantins 2026 · {edital_nome} · <a href="{fonte}" target="_blank" rel="noopener">inscreva-se no site oficial</a></div>

<header class="topbar">
  <div class="topbar-inner">
    <a href="../index.html#top" class="brand"><span class="brand-mark">P</span>PetroPrep</a>
    <nav class="links">
      <a href="../index.html#filtro">Vagas por cargo</a>
      <a href="../index.html#conteudo">O que cai na prova</a>
      <a href="../index.html#cronograma">Cronograma</a>
    </nav>
    <div class="topbar-cta">
      <a href="{fonte}" target="_blank" rel="noopener" class="link-plain">Site oficial (FGV)</a>
      <a href="../index.html#filtro" class="btn btn-accent">Ver todas as vagas</a>
    </div>
  </div>
</header>

<div class="wrap crumb"><a href="../index.html#vagas">← Todas as vagas</a> / {area}</div>

<section class="vaga-hero">
  <div class="wrap">
    <div class="tags"><span class="tag tag-edital">{area}</span><span class="tag">{nivel}</span></div>
    <h1>{nome}</h1>
    <p class="meta">{carga} semanais · {n_locs} localidade{plural} de lotação</p>
    <div class="stat-row">
      <div class="stat-box"><span class="n">{salario}</span><span class="l">salário básico</span></div>
      <div class="stat-box imed"><span class="n">{ampla}</span><span class="l">vagas imediatas</span></div>
      <div class="stat-box cr"><span class="n">{reservas}</span><span class="l">cadastro de reserva</span></div>
    </div>
  </div>
</section>

<main class="wrap">

  <div class="content-section">
    <span class="eyebrow">Requisito para investidura</span>
    <h2 class="section-title">O que você precisa ter para tomar posse</h2>
    <p>{requisito}</p>
  </div>

  <div class="content-section">
    <span class="eyebrow">Módulo II — conhecimentos específicos</span>
    <h2 class="section-title">O que cai na prova para {nome}</h2>
    {conteudo_html}
  </div>

  <div class="content-section">
    <span class="eyebrow">Módulo I — conhecimentos gerais</span>
    <h2 class="section-title">Matérias comuns a todos os cargos de nível {nivel}</h2>
    <p style="margin-top:-4px;">Além do conteúdo específico acima, todo candidato de nível {nivel} responde questões destas matérias. Clique para testar seus conhecimentos.</p>
    {materias_html}
  </div>

  <div class="content-section">
    <span class="eyebrow">Localidades</span>
    <h2 class="section-title">Vagas de {nome} por cidade</h2>
    <div class="loc-grid">{loc_html}</div>
  </div>

  <div class="vaga-cta">
    <h3>Pronto para estudar com foco?</h3>
    <p>Conteúdo direto ao ponto, sem enrolação — só o que cai na prova de {nome}.</p>
    <div class="cta-actions">
      <a href="../index.html#filtro" class="btn btn-primary">Ver outras vagas do edital</a>
      <a href="{fonte}" target="_blank" rel="noopener" class="btn btn-outline">Edital oficial (FGV)</a>
    </div>
  </div>

</main>

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a href="../index.html#top" class="brand" style="color:var(--text-primary);"><span class="brand-mark">P</span>PetroPrep</a>
      </div>
      <div>
        <a href="../index.html#faq" class="link-plain" style="color:var(--primary);">Dúvidas frequentes →</a>
      </div>
    </div>
    <div class="disclaimer">
      A PetroPrep é uma plataforma de estudos independente e não possui qualquer vínculo com o Governo do Estado do Tocantins, a Secretaria de Estado da Saúde ou a Fundação Getulio Vargas (FGV). O cadastro e o pagamento da taxa de inscrição são feitos sempre no site oficial do concurso. Os dados desta página foram extraídos do {edital_nome}; consulte sempre o edital oficial para as informações definitivas.
      <div class="copyright">© <span id="year"></span> PetroPrep. Todos os direitos reservados.</div>
    </div>
  </div>
</footer>

<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
'''

def materias_html_for(nivel_label):
    nk = nivel_key(nivel_label)
    rows = []
    for nome_materia in MATERIAS_POR_NIVEL[nk]:
        msl = materia_slug(nk, nome_materia)
        rows.append(
            f'<div class="materia-row"><div class="m-left">{ICON_BOOK}<span class="m-name">{esc(nome_materia)}</span></div>'
            f'<a href="../testes/em-breve.html?materia={msl}&amp;nome={quote(nome_materia)}" class="btn btn-outline btn-sm">Fazer teste →</a></div>'
        )
    return ''.join(rows)

enriched = {}
generated = 0
for nome, v in cargos.items():
    sl = slug(nome)
    locs = v['localidades']
    loc_names_full = [(LOC_NAMES.get(l, l.title()), t) for l, t in locs]
    loc_html = ''.join(f'<div class="loc-item"><span>{esc(ln)}</span><span class="n">{t}</span></div>' for ln, t in loc_names_full)

    conteudo_items = parse_list(v.get('conteudo', ''))
    conteudo_clean = clean_text(v.get('conteudo', ''))
    if conteudo_items:
        conteudo_html = esc_list_html(conteudo_items, ICON_CHECK)
    else:
        conteudo_html = f'<p>{esc(conteudo_clean) or "Consulte o Anexo I do edital."}</p>'

    requisito_clean = clean_text(v.get('requisito', '')) or 'Consulte o Anexo IV do edital.'

    html_out = DETAIL_TPL.format(
        nome=esc(nome), edital_nome=esc(EDITAL_NOME), fonte=esc(FONTE_EDITAL),
        area=esc(v['area']), nivel=esc(v['nivel']), carga=esc(v['carga_horaria']),
        n_locs=len(locs), plural='s' if len(locs) != 1 else '',
        salario=esc('R$ ' + v['salario']), ampla=v['vagas']['ampla'],
        reservas=v['vagas']['total'] - v['vagas']['ampla'],
        requisito=esc(requisito_clean), conteudo_html=conteudo_html,
        materias_html=materias_html_for(v['nivel']), loc_html=loc_html,
    )
    open(f'{OUT_VAGAS}/{sl}.html', 'w', encoding='utf-8').write(html_out)
    generated += 1

    enriched[nome] = {
        'nome': nome, 'slug': sl, 'area': v['area'], 'nivel': v['nivel'],
        'carga_horaria': v['carga_horaria'], 'salario_basico': v['salario'],
        'vagas': {'imediatas': v['vagas']['ampla'], 'cadastro_reserva': v['vagas']['total'] - v['vagas']['ampla'], 'total': v['vagas']['total']},
        'localidades': [{'cidade': LOC_NAMES.get(l, l.title()), 'vagas': t} for l, t in locs],
        'requisito_investidura': requisito_clean,
        'conteudo_especifico': {
            'texto_bruto': conteudo_clean,
            'itens': conteudo_items,
        },
        'materias_modulo1': [
            {'nome': m, 'slug': materia_slug(nivel_key(v['nivel']), m), 'link_teste': f'/testes/em-breve.html?materia={materia_slug(nivel_key(v["nivel"]), m)}&nome={quote(m)}'}
            for m in MATERIAS_POR_NIVEL[nivel_key(v['nivel'])]
        ],
        'link_detalhe': f'/vagas/{sl}.html',
        'fonte_edital': FONTE_EDITAL,
    }

print(f'{generated} páginas de vaga geradas em {OUT_VAGAS}/')

# ---------- página placeholder "em breve" para os testes de matéria ----------
SOON_TPL = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Teste em breve | PetroPrep</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/site.css">
</head>
<body>
<header class="topbar">
  <div class="topbar-inner">
    <a href="../index.html#top" class="brand"><span class="brand-mark">P</span>PetroPrep</a>
    <a href="../index.html#filtro" class="btn btn-accent">Ver vagas</a>
  </div>
</header>
<div class="wrap">
  <div class="soon-box">
    <span class="badge">Em breve</span>
    <h1 id="soon-title">Teste desta matéria chegando em breve</h1>
    <p>Estamos preparando questões comentadas para esta matéria. Enquanto isso, revise o resumo do conteúdo na página do cargo.</p>
    <a href="../index.html#filtro" class="btn btn-primary">Voltar para as vagas</a>
  </div>
</div>
<script>
  (function(){
    var params = new URLSearchParams(window.location.search);
    var nome = params.get('nome');
    if (!nome) {
      var m = params.get('materia');
      if (m) {
        nome = m.split('--').slice(1).join(' ').replace(/-/g, ' ');
        nome = nome.replace(/\\b\\w/g, function(c){ return c.toUpperCase(); });
      }
    }
    var el = document.getElementById('soon-title');
    if (el && nome) el.textContent = 'Teste de ' + nome + ' chegando em breve';
  })();
</script>
</body>
</html>
'''
open(f'{OUT_TESTES}/em-breve.html', 'w', encoding='utf-8').write(SOON_TPL)
print('página placeholder de teste gerada em', f'{OUT_TESTES}/em-breve.html')

# ---------- dados estruturados para o sistema de interligação ----------
schema_json = {
    'edital': {
        'nome': EDITAL_NOME,
        'orgao': 'Secretaria de Estado da Saúde do Tocantins (SES/TO)',
        'banca': 'FGV',
        'fonte_oficial': FONTE_EDITAL,
        'total_vagas_oficial': 5124,
        'data_prova': '2026-11-01',
    },
    'materias_modulo1': {
        nk: [{'nome': m, 'slug': materia_slug(nk, m)} for m in lst]
        for nk, lst in MATERIAS_POR_NIVEL.items()
    },
    'cargos': enriched,
}
json.dump(schema_json, open(f'{OUT_SCHEMA}/cargos_enriched.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('schema/cargos_enriched.json gerado —', len(enriched), 'cargos')
