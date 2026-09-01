# -*- coding: utf-8 -*-
"""
Gera as páginas internas de ESTUDO de cada item do conteúdo programático
(Módulo I - matérias gerais, e Módulo II - conteúdo específico por cargo),
e atualiza as páginas de vaga para linkar cada item à sua página de estudo.

Piloto (ver decisão do usuário): Assistente Social (Módulo II completo) +
as 4 matérias de nível Superior do Módulo I (compartilhadas por todos os
cargos de nível Superior). Os demais 72 cargos continuam com os itens em
texto simples até a rolagem completa ser aprovada.
"""
import json, re, html, unicodedata

DATA_DIR = '/home/claude/tocantins_saude'
OUT_ESTUDO = f'{DATA_DIR}/estudo'

study = json.load(open(f'{DATA_DIR}/schema/study_content.json', encoding='utf-8'))
cargos = json.load(open(f'{DATA_DIR}/cargos_final.json', encoding='utf-8'))

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s

def esc(s):
    return html.escape(s or '', quote=True)

def item_slug(text):
    return slug(text[:80])

ICON_CHECK = '<svg class="ic" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="currentColor" opacity=".14"/><path d="M8 12.5l2.6 2.6L16.5 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ICON_BULB = '<svg class="ic" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6v.5h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'

MATERIA_NAMES = {
    'superior--lingua-portuguesa': 'Língua Portuguesa',
    'superior--raciocinio-logico-e-matematico': 'Raciocínio Lógico e Matemático',
    'superior--historia-e-geografia-do-estado-do-tocantins': 'História e Geografia do Estado do Tocantins',
    'superior--legislacao': 'Legislação',
}

PAGE_TPL = '''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | PetroPrep</title>
<meta name="description" content="{desc}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{rel}assets/site.css">
</head>
<body>

<header class="topbar">
  <div class="topbar-inner">
    <a href="{rel}index.html#top" class="brand"><span class="brand-mark">P</span>PetroPrep</a>
    <nav class="links">
      <a href="{rel}index.html#filtro">Vagas por cargo</a>
      <a href="{rel}index.html#conteudo">O que cai na prova</a>
    </nav>
    <div class="topbar-cta"><a href="{rel}index.html#filtro" class="btn btn-accent">Ver vagas</a></div>
  </div>
</header>

<div class="wrap crumb">{crumb}</div>

<section class="study-hero">
  <div class="wrap">
    <span class="badge-soft">{badge}</span>
    <h1>{title}</h1>
  </div>
</section>

<main class="wrap-narrow" style="padding:36px 24px 10px;">
  {body}
</main>

<footer>
  <div class="wrap">
    <div class="disclaimer">
      A PetroPrep é uma plataforma de estudos independente. O conteúdo desta página é um resumo de apoio para revisão e não substitui o edital oficial nem a bibliografia indicada — consulte sempre o {edital_nome} para as informações definitivas.
      <div class="copyright">© <span id="year"></span> PetroPrep. Todos os direitos reservados.</div>
    </div>
  </div>
</footer>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>
</body>
</html>
'''

EDITAL_NOME = 'Edital nº 001/2026 – SECAD/SES/TO'

def render_item_page(title, badge, resumo, pontos, dica, crumb, rel, back_href, back_label, prev_item, next_item, desc):
    pontos_html = ''.join(f'<li>{ICON_CHECK}<span class="tx">{esc(p)}</span></li>' for p in pontos)
    body = f'''
  <div class="content-section">
    <p style="font-size:1rem; color:var(--text-primary);">{esc(resumo)}</p>
    <h3 style="font-size:.92rem; text-transform:uppercase; letter-spacing:.03em; color:var(--text-muted); margin:22px 0 12px;">Pontos-chave</h3>
    <ul class="icon-list">{pontos_html}</ul>
  </div>
  <div class="dica-box">
    {ICON_BULB}
    <div><span class="tt">Dica de prova</span><p>{esc(dica)}</p></div>
  </div>
  <div class="study-nav">
    {('<a class="prev" href="'+item_slug(prev_item)+'.html"><span class="lbl">← Anterior</span>'+esc(prev_item[:60])+('…' if len(prev_item)>60 else '')+'</a>') if prev_item else '<span></span>'}
    {('<a class="next" href="'+item_slug(next_item)+'.html"><span class="lbl">Próximo →</span>'+esc(next_item[:60])+('…' if len(next_item)>60 else '')+'</a>') if next_item else '<span></span>'}
  </div>
  <p style="text-align:center; margin-top:6px;"><a href="{back_href}" class="link-plain" style="color:var(--primary); font-weight:700;">{back_label}</a></p>
'''
    return PAGE_TPL.format(title=esc(title), desc=esc(desc), rel=rel, crumb=crumb, badge=esc(badge), body=body, edital_nome=EDITAL_NOME)

def render_index_page(title, badge, items, rel, back_href, back_label, desc, item_prefix=''):
    lis = ''.join(f'<li><a href="{item_prefix}{item_slug(it["item"])}.html">{esc(it["item"][:110])}{"…" if len(it["item"])>110 else ""}</a></li>' for it in items)
    body = f'''
  <div class="content-section">
    <p style="color:var(--text-secondary); margin-top:-2px;">Clique em um item para abrir o resumo de estudo com pontos-chave e dica de prova.</p>
    <ul class="item-index-list">{lis}</ul>
  </div>
  <p style="text-align:center; margin-top:6px;"><a href="{back_href}" class="link-plain" style="color:var(--primary); font-weight:700;">{back_label}</a></p>
'''
    return PAGE_TPL.format(title=esc(title), desc=esc(desc), rel=rel, crumb='', badge=esc(badge), body=body, edital_nome=EDITAL_NOME)

# ---------- gera páginas de MATÉRIA (Módulo I) ----------
import os
n_materia_pages = 0
for msl, items in study['materias'].items():
    mnome = MATERIA_NAMES.get(msl, msl)
    outdir = f'{OUT_ESTUDO}/materia/{msl}'
    os.makedirs(outdir, exist_ok=True)
    crumb = f'<a href="../../../index.html#conteudo">← O que cai na prova</a> / {esc(mnome)}'
    # index da matéria
    idx_html = render_index_page(
        title=mnome, badge='Módulo I · Conhecimentos gerais', items=items,
        rel='../../../', back_href='../../../index.html#conteudo', back_label='← Voltar ao guia completo',
        desc=f'Resumo de estudo de {mnome} para o Concurso Saúde Tocantins 2026.',
    )
    open(f'{outdir}/index.html', 'w', encoding='utf-8').write(idx_html)
    for i, it in enumerate(items):
        prev_item = items[i-1]['item'] if i > 0 else None
        next_item = items[i+1]['item'] if i < len(items)-1 else None
        page = render_item_page(
            title=it['item'], badge=f'Módulo I · {mnome}', resumo=it['resumo'], pontos=it['pontos'], dica=it['dica'],
            crumb=crumb, rel='../../../', back_href='index.html', back_label=f'← Todos os itens de {mnome}',
            prev_item=prev_item, next_item=next_item,
            desc=f'{it["item"]} — resumo de estudo para {mnome}, Concurso Saúde Tocantins 2026.',
        )
        open(f'{outdir}/{item_slug(it["item"])}.html', 'w', encoding='utf-8').write(page)
        n_materia_pages += 1

print(f'{n_materia_pages} páginas de estudo de matéria geradas (+ {len(study["materias"])} índices)')

# ---------- gera páginas de CARGO (Módulo II) ----------
n_cargo_pages = 0
for csl, items in study['cargos'].items():
    cnome = None
    for nome in cargos:
        if slug(nome) == csl:
            cnome = nome
            break
    cnome = cnome or csl
    outdir = f'{OUT_ESTUDO}/cargo/{csl}'
    os.makedirs(outdir, exist_ok=True)
    crumb = f'<a href="../../../vagas/{csl}.html">← {esc(cnome)}</a> / Conteúdo específico'
    idx_html = render_index_page(
        title=f'Conteúdo específico — {cnome}', badge='Módulo II · Conhecimentos específicos', items=items,
        rel='../../../', back_href=f'../../../vagas/{csl}.html', back_label=f'← Voltar para {cnome}',
        desc=f'Resumo de estudo do conteúdo específico de {cnome} para o Concurso Saúde Tocantins 2026.',
    )
    open(f'{outdir}/index.html', 'w', encoding='utf-8').write(idx_html)
    for i, it in enumerate(items):
        prev_item = items[i-1]['item'] if i > 0 else None
        next_item = items[i+1]['item'] if i < len(items)-1 else None
        page = render_item_page(
            title=it['item'][:120], badge=f'Módulo II · {cnome}', resumo=it['resumo'], pontos=it['pontos'], dica=it['dica'],
            crumb=crumb, rel='../../../', back_href='index.html', back_label=f'← Todos os itens de {cnome}',
            prev_item=prev_item, next_item=next_item,
            desc=f'{it["item"][:150]} — resumo de estudo para {cnome}, Concurso Saúde Tocantins 2026.',
        )
        open(f'{outdir}/{item_slug(it["item"])}.html', 'w', encoding='utf-8').write(page)
        n_cargo_pages += 1

print(f'{n_cargo_pages} páginas de estudo de conteúdo específico geradas (+ {len(study["cargos"])} índices)')

# ---------- atualiza a página da vaga (Assistente Social) para linkar itens e matérias ----------
def linkify_vaga_page(csl):
    path = f'{DATA_DIR}/vagas/{csl}.html'
    txt = open(path, encoding='utf-8').read()
    items = study['cargos'].get(csl)
    if items:
        for it in items:
            old_li = f'{ICON_CHECK}<span class="tx">{esc(it["item"])}</span>'
            new_li = f'{ICON_CHECK}<a class="tx" href="../estudo/cargo/{csl}/{item_slug(it["item"])}.html" style="color:inherit; text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px;">{esc(it["item"])}</a>'
            if old_li in txt:
                txt = txt.replace(old_li, new_li, 1)
    # linka nome das matérias do Módulo I (apenas as de nível Superior, cobertas no piloto)
    for msl, mnome in MATERIA_NAMES.items():
        old_name = f'<span class="m-name">{esc(mnome)}</span>'
        new_name = f'<a class="m-name" href="../estudo/materia/{msl}/index.html" style="color:inherit; text-decoration:underline; text-decoration-color:var(--border); text-underline-offset:3px;">{esc(mnome)}</a>'
        txt = txt.replace(old_name, new_name)
    open(path, 'w', encoding='utf-8').write(txt)

linkify_vaga_page('assistente-social')
print('vagas/assistente-social.html atualizado com links de estudo')
