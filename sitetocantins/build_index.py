# -*- coding: utf-8 -*-
import json, re, html, unicodedata

DATA_DIR = '/home/claude/tocantins_saude'
OUT = '/home/claude/tocantins_saude/index.html'

cargos = json.load(open(f'{DATA_DIR}/cargos_final.json', encoding='utf-8'))
mod1 = json.load(open(f'{DATA_DIR}/modulo1_gerais.json', encoding='utf-8'))

LOC_NAMES = {
    'PORTO NACIONAL': 'Porto Nacional',
    'AUGUSTINOPOLIS': 'Augustinópolis',
    'PARAISO': 'Paraíso do Tocantins',
    'MIRACEMA': 'Miracema do Tocantins',
    'PALMAS': 'Palmas',
    'ARAPOEMA': 'Arapoema',
    'PEDRO AFONSO': 'Pedro Afonso',
    'ALVORADA': 'Alvorada',
    'ARAGUAÇU': 'Araguaçu',
    'GURUPI': 'Gurupi',
    'ARAGUAINA': 'Araguaína',
    'GUARAI': 'Guaraí',
    'XAMBIOA': 'Xambioá',
    'ARRAIAS': 'Arraias',
    'DIANOPOLIS': 'Dianópolis',
}

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode()
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s).strip('-').lower()
    return s

def esc(s):
    return html.escape(s, quote=True)

AREAS = sorted(set(v['area'] for v in cargos.values()))
NIVEIS = ['Médio/Técnico', 'Superior']
LOCALIDADES = sorted(LOC_NAMES.values())

# ---------- summary numbers ----------
total_vagas = sum(v['vagas']['total'] for v in cargos.values())
total_ampla = sum(v['vagas']['ampla'] for v in cargos.values())
total_reserva = total_vagas - total_ampla
n_cargos = len(cargos)
n_localidades = len(LOC_NAMES)
salarios_nums = []
for v in cargos.values():
    try:
        salarios_nums.append(float(v['salario'].replace('.', '').replace(',', '.')))
    except Exception:
        pass
sal_min, sal_max = min(salarios_nums), max(salarios_nums)

def fmt_money(n):
    s = f'{n:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    return 'R$ ' + s

# ---------- build vaga cards ----------
def area_slug(a):
    return slug(a)

def nivel_slug(n):
    return slug(n)

card_tpl = '''      <div class="vaga-tile" data-nivel="{nivel_s}" data-area="{area_s}" data-localidades="{locs_s}" data-nome="{nome_lower}">
        <div class="tags"><span class="tag tag-edital">{area}</span><span class="tag">{nivel}</span></div>
        <h3>{nome}</h3>
        <div class="meta">{carga} semanais · {n_locs} localidade{plural}</div>
        <div class="card-salary">💰 {salario}<span class="cs-label">salário básico</span></div>
        <div class="card-vagas">
          <div class="cv-imed"><span class="n">{ampla}</span><span class="l">vagas imediatas</span></div>
          <div class="cv-cr"><span class="n">{reservas}</span><span class="l">cadastro de reserva</span></div>
        </div>
        <div class="loc-chips">{loc_chips}</div>
        <a href="vagas/{slug}.html" class="btn btn-outline">Saiba mais →</a>
      </div>
'''

def build_cards():
    out = []
    for nome in sorted(cargos.keys(), key=lambda n: -cargos[n]['vagas']['total']):
        v = cargos[nome]
        locs = v['localidades']
        loc_names_full = [LOC_NAMES.get(l, l.title()) for l, _ in locs]
        loc_slugs = ' '.join(slug(LOC_NAMES.get(l, l)) for l, _ in locs)
        top_chips = ''.join(f'<span class="chip">{esc(LOC_NAMES.get(l, l.title()))} ({t})</span>' for l, t in locs[:4])
        extra = len(locs) - 4
        if extra > 0:
            top_chips += f'<span class="chip chip-more">+{extra} cidades</span>'
        out.append(card_tpl.format(
            nivel_s=nivel_slug(v['nivel']), area_s=area_slug(v['area']),
            locs_s=esc(loc_slugs), nome_lower=esc(nome.lower()),
            area=esc(v['area']), nivel=esc(v['nivel']), nome=esc(nome),
            carga=esc(v['carga_horaria']), n_locs=len(locs), plural='s' if len(locs) != 1 else '',
            salario=esc('R$ ' + v['salario']), ampla=v['vagas']['ampla'],
            reservas=v['vagas']['total'] - v['vagas']['ampla'],
            loc_chips=top_chips, slug=slug(nome),
        ))
    return ''.join(out)

CARDS_HTML = build_cards()

# ---------- filter option lists ----------
def options(items):
    return ''.join(f'<option value="{slug(i)}">{esc(i)}</option>' for i in items)

AREA_OPTIONS = options(AREAS)
LOC_OPTIONS = options(LOCALIDADES)

# ---------- módulo I content blocks ----------
def disciplinas_html(d, done_prefix):
    out = []
    for i, (nome, texto) in enumerate(d.items()):
        out.append(f'''      <div class="disc-card" data-done="0">
        <div class="disc-check">✓</div>
        <div class="disc-body">
          <h3>{esc(nome)}</h3>
          <p>{esc(texto[:220])}{'…' if len(texto) > 220 else ''}</p>
        </div>
      </div>
''')
    return ''.join(out)

DISC_MEDIO = disciplinas_html(mod1['medio'], 'm')
DISC_SUPERIOR = disciplinas_html(mod1['superior'], 's')

TOTAL_DISC = len(mod1['medio']) + len(mod1['superior'])

print('cards ok, total vagas', total_vagas, 'cargos', n_cargos)
print(len(CARDS_HTML), 'chars de cards html')
open(f'{DATA_DIR}/_cards.html', 'w', encoding='utf-8').write(CARDS_HTML)
open(f'{DATA_DIR}/_disc_medio.html', 'w', encoding='utf-8').write(DISC_MEDIO)
open(f'{DATA_DIR}/_disc_superior.html', 'w', encoding='utf-8').write(DISC_SUPERIOR)
open(f'{DATA_DIR}/_area_options.html', 'w', encoding='utf-8').write(AREA_OPTIONS)
open(f'{DATA_DIR}/_loc_options.html', 'w', encoding='utf-8').write(LOC_OPTIONS)

summary = {
    'total_vagas': total_vagas, 'total_ampla': total_ampla, 'total_reserva': total_reserva,
    'n_cargos': n_cargos, 'n_localidades': n_localidades,
    'sal_min': fmt_money(sal_min), 'sal_max': fmt_money(sal_max),
}
json.dump(summary, open(f'{DATA_DIR}/_summary.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(summary)
