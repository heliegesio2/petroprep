# -*- coding: utf-8 -*-
import json

DATA_DIR = '/home/claude/tocantins_saude'
CARDS_HTML = open(f'{DATA_DIR}/_cards.html', encoding='utf-8').read()
DISC_MEDIO = open(f'{DATA_DIR}/_disc_medio.html', encoding='utf-8').read()
DISC_SUPERIOR = open(f'{DATA_DIR}/_disc_superior.html', encoding='utf-8').read()
AREA_OPTIONS = open(f'{DATA_DIR}/_area_options.html', encoding='utf-8').read()
LOC_OPTIONS = open(f'{DATA_DIR}/_loc_options.html', encoding='utf-8').read()
S = json.load(open(f'{DATA_DIR}/_summary.json', encoding='utf-8'))

TEMPLATE = '''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PetroPrep | Concurso Saúde Tocantins 2026</title>
<meta name="description" content="Guia completo do Concurso Saúde Tocantins 2026 (Edital 001/2026 SECAD/SES/TO, banca FGV): vagas por cargo e localidade, requisitos, conteúdo específico e cronograma.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&family=Roboto+Mono:wght@500;700&display=swap" rel="stylesheet">
<style>
  :root{{
    --primary:#0b5e59;
    --primary-dark:#083f3c;
    --primary-light:#e3f2f0;
    --accent:#f4a300;
    --accent-dark:#c97e00;
    --surface:#ffffff;
    --bg:#f4f6f5;
    --text-primary:#1b1f1e;
    --text-secondary:#5b6663;
    --text-muted:#8a938f;
    --border:#e1e6e4;
    --good:#0e8a5a;
    --bad:#c2c9c6;
    --shadow-1:0 1px 2px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.10);
    --shadow-2:0 4px 8px rgba(0,0,0,.08), 0 2px 4px rgba(0,0,0,.06);
    --shadow-3:0 12px 24px rgba(0,0,0,.14), 0 4px 8px rgba(0,0,0,.08);
    --radius:16px;
    --maxw:1160px;
  }}
  *{{box-sizing:border-box;}}
  html{{scroll-behavior:smooth;}}
  html,body{{margin:0;padding:0;}}
  body{{
    font-family:'Roboto',system-ui,-apple-system,'Segoe UI',sans-serif;
    background:var(--bg);
    color:var(--text-primary);
    -webkit-font-smoothing:antialiased;
    line-height:1.55;
  }}
  a{{color:inherit;}}
  img{{max-width:100%;}}
  .wrap{{max-width:var(--maxw);margin:0 auto;padding:0 24px;}}
  .mono{{font-family:'Roboto Mono',monospace;}}

  .announce{{ background:var(--accent); color:var(--primary-dark); text-align:center; font-size:13px; font-weight:700; padding:9px 16px; }}
  .announce a{{ text-decoration:underline; }}

  .topbar{{ background:var(--primary); color:#fff; padding:16px 24px; box-shadow:var(--shadow-2); position:sticky; top:0; z-index:50; }}
  .topbar-inner{{ max-width:var(--maxw); margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:20px; }}
  .brand{{ display:flex; align-items:center; gap:10px; font-weight:900; font-size:21px; text-decoration:none; }}
  .brand-mark{{ width:32px;height:32px;border-radius:9px; background:var(--accent); display:flex;align-items:center;justify-content:center; font-weight:900; color:var(--primary-dark); font-size:17px; }}
  nav.links{{ display:flex; gap:24px; }}
  nav.links a{{ color:rgba(255,255,255,.86); text-decoration:none; font-size:.9rem; font-weight:500; transition:color .15s; }}
  nav.links a:hover{{ color:#fff; }}
  .topbar-cta{{ display:flex; align-items:center; gap:14px; }}
  .link-plain{{ color:rgba(255,255,255,.86); text-decoration:none; font-size:.9rem; font-weight:500; }}
  .link-plain:hover{{ color:#fff; }}
  .menu-toggle{{ display:none; background:none; border:1px solid rgba(255,255,255,.35); border-radius:8px; padding:7px 10px; color:#fff; cursor:pointer; font-size:1rem; }}

  .btn{{ display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 22px; border-radius:10px; font-weight:700; font-size:.92rem; text-decoration:none; border:none; cursor:pointer; transition:filter .15s, transform .15s; white-space:nowrap; }}
  .btn-accent{{ background:var(--accent); color:var(--primary-dark); }}
  .btn-accent:hover{{ filter:brightness(1.05); transform:translateY(-1px); }}
  .btn-light{{ background:rgba(255,255,255,.14); color:#fff; border:1px solid rgba(255,255,255,.3); }}
  .btn-light:hover{{ background:rgba(255,255,255,.22); }}
  .btn-outline{{ background:transparent; color:var(--primary); border:1.5px solid var(--primary); }}
  .btn-outline:hover{{ background:var(--primary-light); }}
  .btn-block{{ width:100%; }}
  .btn-lg{{ padding:14px 28px; font-size:1rem; }}

  .hero{{ padding:52px 24px 72px; text-align:center; color:#fff; position:relative; overflow:hidden; background:linear-gradient(180deg, var(--primary) 0%, var(--primary-dark) 100%); }}
  .hero-skyline{{ position:absolute; inset:0; width:100%; height:100%; z-index:0; pointer-events:none; }}
  .hero-particles{{ position:absolute; inset:0; z-index:1; opacity:.55; pointer-events:none; }}
  .hero > *:not(.hero-particles):not(.hero-skyline){{ position:relative; z-index:2; }}

  .filter-priority{{ background:var(--surface); border-bottom:1px solid var(--border); padding:24px 0 26px; }}
  .filter-priority .fp-head{{ display:flex; align-items:baseline; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:16px; }}
  .filter-priority .fp-title{{ font-size:1rem; font-weight:800; margin:0; }}
  .filter-priority .fp-sub{{ font-size:.82rem; color:var(--text-muted); margin:2px 0 0; }}
  .concurso-switch{{ margin-bottom:14px; }}
  .concurso-switch .cs-label{{ display:block; font-size:.7rem; font-weight:800; text-transform:uppercase; letter-spacing:.05em; color:var(--text-muted); margin-bottom:6px; }}
  .concurso-switch select{{
    appearance:none; -webkit-appearance:none; -moz-appearance:none;
    background:var(--primary-light) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="%230b5e59" stroke-width="2"><path d="M5.5 7.5l4.5 4.5 4.5-4.5"/></svg>') no-repeat right 14px center;
    background-size:14px; border:1.5px solid var(--primary); color:var(--primary); font-weight:800; font-size:.92rem;
    padding:10px 40px 10px 16px; border-radius:10px; cursor:pointer; font-family:inherit; max-width:360px;
  }}
  .concurso-switch select:hover{{ background-color:#d7ece9; }}
  .hero-badge{{ display:inline-flex; align-items:center; gap:8px; margin-bottom:18px; padding:6px 16px; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.28); border-radius:999px; font-size:12.5px; font-weight:700; letter-spacing:.3px; text-transform:uppercase; }}
  .hero-badge .dot{{ width:7px; height:7px; border-radius:50%; background:#5be08a; }}
  .hero h1{{ margin:0 0 14px; font-size:clamp(26px,4vw,42px); font-weight:900; line-height:1.16; max-width:820px; margin-left:auto; margin-right:auto; }}
  .hero p.lead{{ margin:0 auto 34px; max-width:640px; font-size:17px; color:rgba(255,255,255,.85); }}
  .hero-ctas{{ display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:40px; }}

  .hero-stats{{ display:flex; justify-content:center; gap:36px; flex-wrap:wrap; margin-bottom:40px; font-size:.85rem; color:rgba(255,255,255,.78); }}
  .hero-stats b{{ display:block; font-family:'Roboto Mono',monospace; font-size:1.25rem; color:#fff; font-weight:700; }}

  .countdown-card{{ display:inline-block; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.18); border-radius:18px; padding:22px 30px; }}
  .countdown-card .cc-label{{ font-size:.78rem; color:rgba(255,255,255,.7); margin-bottom:12px; }}
  .countdown{{ display:flex; gap:12px; justify-content:center; }}
  .cd-item{{ background:rgba(255,255,255,.09); border-radius:10px; padding:10px 14px; min-width:58px; text-align:center; }}
  .cd-num{{ font-family:'Roboto Mono',monospace; font-size:1.7rem; font-weight:700; display:block; }}
  .cd-label{{ font-size:.68rem; text-transform:uppercase; letter-spacing:.05em; color:rgba(255,255,255,.65); }}
  .cc-sub{{ margin-top:12px; font-size:.8rem; color:rgba(255,255,255,.65); }}

  .section{{ padding:76px 0; }}
  .section-title{{ text-align:center; font-size:clamp(22px,3vw,30px); font-weight:900; margin:0 0 10px; }}
  .section-sub{{ text-align:center; color:var(--text-secondary); font-size:15px; max-width:640px; margin:0 auto 44px; line-height:1.6; }}
  .eyebrow{{ display:block; text-align:center; color:var(--primary); font-weight:800; font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }}

  .benefits-grid{{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }}
  .benefit-card{{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:26px 22px; box-shadow:var(--shadow-1); position:relative; }}
  .benefit-card .icon{{ width:44px; height:44px; border-radius:12px; background:var(--primary-light); color:var(--primary); display:flex; align-items:center; justify-content:center; font-size:1.3rem; margin-bottom:16px; }}
  .benefit-card h3{{ font-size:1rem; margin:0 0 8px; }}
  .benefit-card p{{ font-size:.88rem; color:var(--text-secondary); margin:0; line-height:1.55; }}
  .soon-tag{{ position:absolute; top:20px; right:20px; background:var(--primary-light); color:var(--primary); font-size:.68rem; font-weight:800; padding:3px 9px; border-radius:999px; text-transform:uppercase; }}

  .vagas-summary{{ display:flex; gap:14px; justify-content:center; flex-wrap:wrap; margin-bottom:34px; }}
  .summary-pill{{ background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:14px 22px; text-align:center; min-width:140px; box-shadow:var(--shadow-1); }}
  .summary-pill .num{{ font-family:'Roboto Mono',monospace; font-weight:700; font-size:1.35rem; color:var(--primary); }}
  .summary-pill .lbl{{ font-size:.74rem; color:var(--text-muted); margin-top:2px; }}

  .filters-bar{{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px 22px; margin-bottom:28px; box-shadow:var(--shadow-1); }}
  .filters-row{{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }}
  .filter-field label{{ display:block; font-size:.74rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px; }}
  .filter-field select, .filter-field input[type="search"]{{ width:100%; padding:10px 12px; border-radius:9px; border:1px solid var(--border); background:#fff; font-family:inherit; font-size:.88rem; color:var(--text-primary); }}

  .vagas-note{{ text-align:center; font-size:.82rem; color:var(--text-muted); margin:-10px 0 30px; }}

  .vagas-grid{{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }}
  .vaga-tile{{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px 20px; box-shadow:var(--shadow-1); transition:transform .15s, box-shadow .15s; display:flex; flex-direction:column; }}
  .vaga-tile:hover{{ transform:translateY(-4px); box-shadow:var(--shadow-3); }}
  .vaga-tile .tags{{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }}
  .vaga-tile .tag{{ font-size:.64rem; font-weight:800; padding:4px 9px; border-radius:999px; text-transform:uppercase; letter-spacing:.03em; background:var(--bg); color:var(--text-secondary); border:1px solid var(--border); }}
  .vaga-tile .tag-edital{{ background:var(--primary-light); color:var(--primary); border-color:transparent; }}
  .vaga-tile h3{{ font-size:1rem; margin:0 0 6px; line-height:1.3; }}
  .vaga-tile .meta{{ font-size:.76rem; color:var(--text-muted); margin-bottom:14px; }}
  .vaga-tile .card-salary{{ font-size:.85rem; font-weight:700; color:var(--text-primary); margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border); }}
  .vaga-tile .card-salary .cs-label{{ display:block; font-size:.66rem; font-weight:500; color:var(--text-muted); text-transform:uppercase; letter-spacing:.03em; margin-top:2px; }}
  .vaga-tile .card-vagas{{ display:flex; gap:10px; margin-bottom:14px; }}
  .vaga-tile .card-vagas > div{{ flex:1; border-radius:10px; padding:10px 12px; text-align:center; }}
  .vaga-tile .cv-imed{{ background:var(--primary-light); }}
  .vaga-tile .cv-imed .n{{ font-family:'Roboto Mono',monospace; font-weight:700; font-size:1.15rem; color:var(--primary); display:block; }}
  .vaga-tile .cv-imed .l{{ font-size:.62rem; color:var(--good); font-weight:700; text-transform:uppercase; letter-spacing:.02em; }}
  .vaga-tile .cv-cr{{ background:var(--bg); }}
  .vaga-tile .cv-cr .n{{ font-family:'Roboto Mono',monospace; font-weight:700; font-size:1.15rem; color:var(--text-primary); display:block; }}
  .vaga-tile .cv-cr .l{{ font-size:.62rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:.02em; }}
  .vaga-tile .loc-chips{{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }}
  .vaga-tile .chip{{ font-size:.68rem; background:var(--bg); border:1px solid var(--border); color:var(--text-secondary); padding:3px 9px; border-radius:999px; }}
  .vaga-tile .chip-more{{ background:var(--primary-light); color:var(--primary); border-color:transparent; font-weight:700; }}
  .vaga-tile .card-details{{ margin-top:auto; }}
  .vaga-tile .card-details summary{{ cursor:pointer; list-style:none; width:100%; }}
  .vaga-tile .card-details summary::-webkit-details-marker{{ display:none; }}
  .vaga-tile .card-details[open] summary{{ margin-bottom:14px; }}
  .vaga-tile .cd-block{{ margin-top:10px; }}
  .vaga-tile .cd-block h4{{ font-size:.72rem; text-transform:uppercase; letter-spacing:.03em; color:var(--text-muted); margin:10px 0 4px; }}
  .vaga-tile .cd-block h4:first-child{{ margin-top:0; }}
  .vaga-tile .cd-block p{{ font-size:.8rem; color:var(--text-secondary); line-height:1.55; margin:0; }}
  .vaga-tile.hidden{{ display:none; }}
  .vaga-empty{{ display:none; text-align:center; color:var(--text-muted); padding:40px 0; grid-column:1/-1; }}

  .content-progress{{ display:flex; align-items:center; justify-content:center; gap:12px; margin-bottom:16px; flex-wrap:wrap; }}
  .disc-group-title{{ font-size:.86rem; font-weight:800; color:var(--primary); text-transform:uppercase; letter-spacing:.04em; margin:36px 0 16px; text-align:center; }}
  .disc-group-title:first-of-type{{ margin-top:0; }}
  .disciplinas-grid{{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }}
  .disc-card{{ background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:18px 20px; display:flex; align-items:flex-start; gap:14px; box-shadow:var(--shadow-1); }}
  .disc-check{{ width:22px; height:22px; border-radius:6px; border:2px solid var(--primary); background:var(--primary-light); color:var(--primary); flex-shrink:0; margin-top:2px; display:flex; align-items:center; justify-content:center; font-size:.75rem; font-weight:900; }}
  .disc-body h3{{ font-size:.92rem; margin:0 0 6px; }}
  .disc-card p{{ font-size:.8rem; color:var(--text-muted); margin:0; line-height:1.5; }}
  .mod2-note{{ max-width:820px; margin:36px auto 0; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px 28px; box-shadow:var(--shadow-1); }}
  .mod2-note h3{{ margin:0 0 10px; font-size:15px; }}
  .mod2-note p, .mod2-note li{{ font-size:13.5px; color:var(--text-secondary); line-height:1.65; }}

  .points-table{{ width:100%; border-collapse:collapse; font-size:13px; margin-top:10px; }}
  .points-table th{{ background:var(--primary); color:#fff; padding:10px 12px; text-align:left; }}
  .points-table td{{ padding:9px 12px; border-top:1px solid var(--border); }}
  .points-table tr:nth-child(even) td{{ background:var(--bg); }}

  .steps{{ display:grid; grid-template-columns:repeat(4,1fr); gap:22px; }}
  .step{{ text-align:left; background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px; box-shadow:var(--shadow-1); }}
  .step-num{{ width:38px; height:38px; border-radius:10px; background:var(--primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-family:'Roboto Mono',monospace; margin-bottom:14px; }}
  .step h3{{ font-size:1rem; margin:0 0 8px; }}
  .step p{{ font-size:.86rem; color:var(--text-secondary); margin:0; line-height:1.5; }}

  .faq{{ max-width:740px; margin:0 auto; }}
  .faq-item{{ background:var(--surface); border:1px solid var(--border); border-radius:12px; margin-bottom:12px; overflow:hidden; box-shadow:var(--shadow-1); }}
  .faq-q{{ width:100%; text-align:left; background:none; border:none; color:var(--text-primary); padding:18px 20px; font-size:.95rem; font-weight:700; font-family:inherit; display:flex; align-items:center; justify-content:space-between; gap:16px; cursor:pointer; }}
  .faq-q .plus{{ font-size:1.2rem; color:var(--primary); transition:transform .2s; flex-shrink:0; }}
  .faq-item.open .faq-q .plus{{ transform:rotate(45deg); }}
  .faq-a{{ max-height:0; overflow:hidden; transition:max-height .25s ease; }}
  .faq-a p{{ padding:0 20px 18px; margin:0; color:var(--text-secondary); font-size:.88rem; }}

  .cta-final{{ position:relative; overflow:hidden; text-align:center; border-radius:24px; padding:56px 32px; max-width:880px; margin:0 auto; background:linear-gradient(135deg, var(--primary), var(--primary-dark)); color:#fff; }}
  .cta-final h2{{ font-size:clamp(22px,3vw,28px); margin:0 0 12px; position:relative; z-index:1; }}
  .cta-final p{{ color:rgba(255,255,255,.82); margin:0 0 28px; position:relative; z-index:1; }}
  .cta-final .cta-ctas{{ position:relative; z-index:1; display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }}

  footer{{ border-top:1px solid var(--border); padding:50px 0 28px; background:var(--surface); }}
  .footer-grid{{ display:grid; grid-template-columns:1.4fr 1fr 1fr 1fr; gap:32px; margin-bottom:36px; }}
  .footer-grid h4{{ font-size:.78rem; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); margin:0 0 14px; }}
  .footer-grid ul{{ list-style:none; margin:0; padding:0; }}
  .footer-grid li{{ margin-bottom:9px; }}
  .footer-grid a{{ color:var(--text-secondary); text-decoration:none; font-size:.87rem; }}
  .footer-grid a:hover{{ color:var(--primary); }}
  .footer-brand p{{ color:var(--text-secondary); font-size:.85rem; max-width:280px; }}
  .disclaimer{{ border-top:1px solid var(--border); padding-top:22px; color:var(--text-muted); font-size:.76rem; line-height:1.7; }}
  .disclaimer .copyright{{ margin-top:8px; }}

  @media (max-width: 980px){{
    .benefits-grid{{ grid-template-columns:repeat(2,1fr); }}
    .filters-row{{ grid-template-columns:repeat(2,1fr); }}
    .vagas-grid{{ grid-template-columns:repeat(2,1fr); }}
    .steps{{ grid-template-columns:repeat(2,1fr); }}
    .disciplinas-grid{{ grid-template-columns:1fr; }}
    .footer-grid{{ grid-template-columns:1fr 1fr; }}
  }}
  @media (max-width: 720px){{
    nav.links, .topbar-cta .link-plain{{ display:none; }}
    .menu-toggle{{ display:inline-flex; }}
  }}
  @media (max-width: 560px){{
    .benefits-grid{{ grid-template-columns:1fr; }}
    .filters-row{{ grid-template-columns:1fr; }}
    .vagas-grid{{ grid-template-columns:1fr; }}
    .steps{{ grid-template-columns:1fr; }}
    .hero-stats{{ gap:22px; }}
    .footer-grid{{ grid-template-columns:1fr; }}
    .countdown{{ flex-wrap:wrap; }}
  }}
</style>
</head>
<body>

<div class="announce">🩺 Concurso Saúde Tocantins 2026 · Edital 001/2026 SECAD/SES/TO · inscrições até 10/09/2026 · <a href="https://conhecimento.fgv.br/concursos/sesto26/" target="_blank" rel="noopener">inscreva-se no site oficial</a></div>

<header class="topbar">
  <div class="topbar-inner">
    <a href="#top" class="brand"><span class="brand-mark">P</span>PetroPrep</a>
    <nav class="links">
      <a href="#filtro">Vagas por cargo</a>
      <a href="#conteudo">O que cai na prova</a>
      <a href="#cronograma">Cronograma</a>
      <a href="#faq">Dúvidas</a>
    </nav>
    <div class="topbar-cta">
      <a href="https://conhecimento.fgv.br/concursos/sesto26/" target="_blank" rel="noopener" class="link-plain">Site oficial (FGV)</a>
      <a href="#filtro" class="btn btn-accent">Ver vagas</a>
      <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu">☰</button>
    </div>
  </div>
</header>

<section class="filter-priority" id="filtro">
  <div class="wrap">
    <div class="fp-head">
      <div>
        <div class="concurso-switch">
          <span class="cs-label">Concursos (2)</span>
          <select id="concursoSwitch" onchange="if(this.value) window.location.href=this.value;">
            <option value="index.html" selected>Concurso Saúde Tocantins 2026</option>
            <option value="../site/index.html">Concurso Transpetro 2026</option>
          </select>
        </div>
        <p class="fp-title">🔎 Encontre seu cargo</p>
        <p class="fp-sub">Filtre por nível, área, cidade de lotação ou busque pelo nome do cargo.</p>
      </div>
      <div class="vagas-summary" style="margin:0;">
        <div class="summary-pill"><div class="num">5.124</div><div class="lbl">vagas no edital</div></div>
        <div class="summary-pill"><div class="num">{n_cargos}</div><div class="lbl">cargos/especialidades</div></div>
        <div class="summary-pill"><div class="num">{n_localidades}</div><div class="lbl">cidades de lotação</div></div>
      </div>
    </div>

    <div class="filters-bar" style="margin-bottom:0;">
      <div class="filters-row">
        <div class="filter-field">
          <label for="f-nivel">Nível</label>
          <select id="f-nivel">
            <option value="">Todos os níveis</option>
            <option value="medio-tecnico">Médio/Técnico</option>
            <option value="superior">Superior</option>
          </select>
        </div>
        <div class="filter-field">
          <label for="f-area">Área</label>
          <select id="f-area">
            <option value="">Todas as áreas</option>
            {area_options}
          </select>
        </div>
        <div class="filter-field">
          <label for="f-localidade">Cidade de lotação</label>
          <select id="f-localidade">
            <option value="">Todas as cidades</option>
            {loc_options}
          </select>
        </div>
        <div class="filter-field">
          <label for="f-busca">Buscar cargo</label>
          <input type="search" id="f-busca" placeholder="Ex.: enfermeiro, médico...">
        </div>
      </div>
    </div>
    <p class="vagas-note" style="margin-top:12px; margin-bottom:0;">Mostrando os {n_cargos} cargos/especialidades do Anexo II do edital — ajuste os filtros ou role até <a href="#vagas" style="color:var(--primary); font-weight:700;">Vagas por cargo ↓</a></p>
  </div>
</section>

<section class="hero" id="top">
  <canvas class="hero-particles" id="hero-particles"></canvas>
  <svg class="hero-skyline" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#052624"/>
        <stop offset="45%" stop-color="#083f3c"/>
        <stop offset="78%" stop-color="#0b5e59"/>
        <stop offset="100%" stop-color="#12716a"/>
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#a7e8d8" stop-opacity="0.9"/>
        <stop offset="35%" stop-color="#3fb89a" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#3fb89a" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="textShade" cx="50%" cy="34%" r="62%">
        <stop offset="0%" stop-color="#052624" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#052624" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="1600" height="900" fill="url(#skyGrad)"/>
    <circle cx="1230" cy="290" r="260" fill="url(#sunGlow)"/>
    <g fill="#052624" opacity="0.9">
      <circle cx="220" cy="470" r="130"/>
      <rect x="180" y="470" width="80" height="190"/>
      <rect x="330" y="560" width="18" height="100"/>
      <circle cx="339" cy="556" r="9"/>
      <rect x="1000" y="500" width="16" height="160"/>
      <circle cx="1008" cy="496" r="8"/>
      <path d="M960,660 h120 v-70 a60,60 0 0 1 60,0 v70 h40 v20 h-220 z"/>
      <rect x="90" y="620" width="70" height="40" rx="4"/>
      <rect x="115" y="600" width="20" height="24"/>
    </g>
    <rect x="0" y="660" width="1600" height="240" fill="#052624" opacity="0.55"/>
    <path d="M0,672 Q80,662 160,672 T320,672 T480,672 T640,672 T800,672 T960,672 T1120,672 T1280,672 T1440,672 T1600,672" stroke="#12716a" stroke-width="2" fill="none" opacity="0.5"/>
    <g fill="#fff" opacity="0.85">
      <path d="M760,610 v-14 h6 v14 M757,600 h12" stroke="#fff" stroke-width="2"/>
      <rect x="748" y="612" width="30" height="20" rx="3"/>
    </g>
    <ellipse cx="800" cy="330" rx="760" ry="270" fill="url(#textShade)"/>
  </svg>
  <span class="hero-badge"><span class="dot"></span>Inscrições abertas · Banca FGV · Edital 001/2026</span>
  <h1>Sua aprovação no Concurso Saúde Tocantins começa com o conteúdo certo</h1>
  <p class="lead">5.124 vagas em {n_localidades} cidades para {n_cargos} cargos e especialidades da Secretaria da Saúde do Tocantins (SECAD/SES/TO). Veja vagas por cargo, requisitos, o que cai na prova e prepare-se com a PetroPrep.</p>
  <div class="hero-ctas">
    <a href="https://conhecimento.fgv.br/concursos/sesto26/" target="_blank" rel="noopener" class="btn btn-accent btn-lg">Inscreva-se no site oficial</a>
    <a href="#filtro" class="btn btn-light btn-lg">Ver vagas por cargo</a>
  </div>

  <div class="hero-stats">
    <div><b>5.124</b>vagas (ampla + reservas)</div>
    <div><b>{sal_min}–{sal_max}</b>faixa de vencimento inicial</div>
    <div><b>8</b>cidades com prova (01/11/2026)</div>
  </div>

  <div class="countdown-card">
    <div class="cc-label">Contagem regressiva para a Prova Objetiva</div>
    <div class="countdown" id="countdown">
      <div class="cd-item"><span class="cd-num" id="cd-days">--</span><span class="cd-label">dias</span></div>
      <div class="cd-item"><span class="cd-num" id="cd-hours">--</span><span class="cd-label">horas</span></div>
      <div class="cd-item"><span class="cd-num" id="cd-min">--</span><span class="cd-label">min</span></div>
      <div class="cd-item"><span class="cd-num" id="cd-sec">--</span><span class="cd-label">seg</span></div>
    </div>
    <div class="cc-sub">Prova Objetiva em 01/11/2026 — confirme local e horário no cartão de confirmação da FGV</div>
  </div>
</section>

<section class="section" id="beneficios">
  <div class="wrap">
    <span class="eyebrow">Por que estudar com a PetroPrep</span>
    <h2 class="section-title">Feito pra quem não pode perder tempo</h2>
    <p class="section-sub">Enquanto o guia abaixo te mostra vagas e conteúdo oficial do edital, a PetroPrep entra com os simulados.</p>
    <div class="benefits-grid">
      <div class="benefit-card">
        <div class="icon">♾️</div>
        <h3>Simulados ilimitados</h3>
        <p>Refaça quantas vezes quiser, por disciplina ou por cargo, no estilo da banca FGV — sem limite até o dia da prova.</p>
      </div>
      <div class="benefit-card">
        <div class="icon">🤖</div>
        <h3>Feedback por IA</h3>
        <p>Depois de cada simulado, a IA aponta exatamente em quais tópicos do Módulo I e II você está mais fraco.</p>
      </div>
      <div class="benefit-card">
        <div class="icon">🏆</div>
        <h3>Ranking competitivo</h3>
        <p>Veja sua posição frente a outros candidatos do mesmo cargo/especialidade e acompanhe sua evolução até 01/11.</p>
      </div>
      <div class="benefit-card">
        <div class="icon">📴</div>
        <span class="soon-tag">Em breve</span>
        <h3>Simulados offline</h3>
        <p>Baixe os simulados do seu cargo e treine mesmo sem internet — ideal pra quem estuda entre plantões.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="vagas" style="background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
  <div class="wrap">
    <span class="eyebrow">Anexo II do edital</span>
    <h2 class="section-title">Vagas por cargo, especialidade e cidade de lotação</h2>
    <p class="section-sub">Os {n_cargos} cargos/especialidades do concurso, com vencimento inicial, vagas de ampla concorrência e total com reservas, cidades de lotação e — em cada card — requisito para investidura e o conteúdo específico cobrado no Módulo II. Resultado do filtro no topo da página.</p>

    <div class="vagas-grid" id="vagas-grid">
{cards}    </div>
    <p class="vaga-empty" id="vaga-empty">Nenhum cargo encontrado com esses filtros.</p>
    <p class="vagas-note" style="margin-top:30px;">Os números de vagas por cargo e cidade foram extraídos do Anexo II do Edital 001/2026 – SECAD/SES/TO; o total oficial do edital é <strong>5.124 vagas</strong>. Havendo qualquer divergência de arredondamento nos números por cargo/cidade, prevalece sempre o edital oficial publicado no Diário Oficial do Tocantins.</p>
  </div>
</section>

<section class="section" id="conteudo">
  <div class="wrap">
    <span class="eyebrow">Anexo I do edital</span>
    <h2 class="section-title">O que cai na prova</h2>
    <p class="section-sub">A Prova Objetiva tem 60 questões: 30 do Módulo I (Conhecimentos Gerais) e 30 do Módulo II (Conhecimentos Específicos). Veja abaixo os temas do Módulo I — o conteúdo específico completo de cada cargo está no card correspondente, na seção de vagas.</p>

    <p class="disc-group-title">Módulo I · Cargos de Nível Médio</p>
    <div class="disciplinas-grid">
{disc_medio}    </div>

    <p class="disc-group-title">Módulo I · Cargos de Nível Superior</p>
    <div class="disciplinas-grid">
{disc_superior}    </div>

    <div class="mod2-note">
      <h3>Como funciona o Módulo II — Conhecimentos Específicos</h3>
      <p>Para cargos de <strong>Nível Médio</strong>: 5 questões de Legislação do SUS + 25 questões específicas do cargo. Para cargos de <strong>Nível Superior</strong>: 6 questões de Legislação do SUS (dentro do Módulo I) + 30 questões específicas do cargo/especialidade. O conteúdo específico de cada um dos {n_cargos} cargos e especialidades — incluindo todas as especialidades médicas com RQE — está listado no card do respectivo cargo, na seção "Vagas por cargo" acima.</p>
      <table class="points-table">
        <thead><tr><th>Módulo</th><th>Nível Médio</th><th>Nível Superior</th></tr></thead>
        <tbody>
          <tr><td>Língua Portuguesa</td><td>10 questões</td><td>10 questões</td></tr>
          <tr><td>Matemática / Raciocínio Lógico</td><td>7 questões</td><td>8 questões</td></tr>
          <tr><td>Informática Básica</td><td>7 questões</td><td>—</td></tr>
          <tr><td>História e Geografia do Tocantins</td><td>6 questões</td><td>6 questões</td></tr>
          <tr><td>Legislação (SUS)</td><td>5 questões (Módulo II)</td><td>6 questões (Módulo I)</td></tr>
          <tr><td>Conhecimentos específicos do cargo</td><td>25 questões</td><td>30 questões</td></tr>
          <tr><td><strong>Total</strong></td><td><strong>60 questões / 90 pontos</strong></td><td><strong>60 questões / 90 pontos</strong></td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="section" id="cronograma" style="background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border);">
  <div class="wrap">
    <span class="eyebrow">Como funciona o concurso</span>
    <h2 class="section-title">Cronograma e regras da prova</h2>
    <p class="section-sub">As datas confirmadas no Edital 001/2026 – SECAD/SES/TO.</p>
    <div class="steps">
      <div class="step">
        <div class="step-num">01</div>
        <h3>Inscrições</h3>
        <p>De 10/08/2026 a 10/09/2026 (até 22h). Taxa de R$ 100,00 (Nível Médio) ou R$ 150,00 (Nível Superior), paga por PIX ou cartão via DAR.</p>
      </div>
      <div class="step">
        <div class="step-num">02</div>
        <h3>Escolha cargo e localidade</h3>
        <p>No ato da inscrição você indica cargo, especialidade/perfil, cidade de lotação e a cidade onde fará a prova — são escolhas independentes.</p>
      </div>
      <div class="step">
        <div class="step-num">03</div>
        <h3>Prova Objetiva</h3>
        <p>Dia 01/11/2026, em Araguaína, Araguatins, Arraias, Dianópolis, Gurupi, Palmas, Paraíso do Tocantins e Porto Nacional. Manhã (8h–12h) para Nível Médio, tarde (15h–19h) para Nível Superior.</p>
      </div>
      <div class="step">
        <div class="step-num">04</div>
        <h3>Aprovação e nomeação</h3>
        <p>Mínimo 40% dos pontos do Módulo II e 40% do total (60 questões, 90 pontos). Concurso válido por 2 anos, prorrogável por igual período.</p>
      </div>
    </div>
  </div>
</section>

<section class="section" id="faq" style="background:var(--surface); border-top:1px solid var(--border);">
  <div class="wrap">
    <span class="eyebrow">Dúvidas</span>
    <h2 class="section-title">Perguntas frequentes</h2>
    <div class="faq">
      <div class="faq-item">
        <button class="faq-q">A PetroPrep é ligada ao Governo do Tocantins ou à FGV?<span class="plus">+</span></button>
        <div class="faq-a"><p>Não. A PetroPrep é uma plataforma de estudos independente, sem qualquer vínculo oficial com o Governo do Tocantins, a Secretaria da Saúde ou a banca FGV. A inscrição e o pagamento da taxa são feitos sempre no site oficial: conhecimento.fgv.br/concursos/sesto26.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">Posso concorrer a mais de um cargo?<span class="plus">+</span></button>
        <div class="faq-a"><p>Sim, até 2 inscrições, desde que as provas sejam aplicadas em turnos distintos (uma no turno da manhã, de Nível Médio, e outra no turno da tarde, de Nível Superior), pagando a taxa correspondente a cada uma.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">A cidade da prova precisa ser a mesma da vaga?<span class="plus">+</span></button>
        <div class="faq-a"><p>Não. A cidade onde você faz a prova é independente da cidade de lotação da vaga a que concorre — são duas escolhas separadas no ato da inscrição.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">Como funcionam as vagas reservadas?<span class="plus">+</span></button>
        <div class="faq-a"><p>10% das vagas de cada cargo são reservadas a pessoas negras/pardas, 10% a pessoas com deficiência (PcD), 5% a pessoas indígenas e 5% a pessoas quilombolas, conforme as Leis Estaduais nº 4.344/2023 e nº 5.029/2026.</p></div>
      </div>
      <div class="faq-item">
        <button class="faq-q">Como funciona o feedback de IA da PetroPrep?<span class="plus">+</span></button>
        <div class="faq-a"><p>A cada simulado, a IA analisa suas respostas por tópico do Módulo I e do Módulo II e mostra onde seu desempenho está mais fraco, sugerindo o que revisar antes do próximo simulado.</p></div>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <div class="cta-final">
      <h2>O edital não espera. Comece hoje.</h2>
      <p>Garanta sua inscrição no site oficial e treine com simulados ilimitados no estilo FGV.</p>
      <div class="cta-ctas">
        <a href="https://conhecimento.fgv.br/concursos/sesto26/" target="_blank" rel="noopener" class="btn btn-accent btn-lg">Inscreva-se no site oficial</a>
        <a href="#filtro" class="btn btn-light btn-lg">Ver vagas por cargo</a>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#top" class="brand" style="color:var(--text-primary);"><span class="brand-mark">P</span>PetroPrep</a>
        <p style="margin-top:14px;">Plataforma de estudos para os principais concursos do país, com guias completos como este do Concurso Saúde Tocantins 2026.</p>
      </div>
      <div>
        <h4>Este concurso</h4>
        <ul>
          <li><a href="#filtro">Vagas por cargo</a></li>
          <li><a href="#conteudo">O que cai na prova</a></li>
          <li><a href="#cronograma">Cronograma</a></li>
        </ul>
      </div>
      <div>
        <h4>Suporte</h4>
        <ul>
          <li><a href="#faq">Dúvidas frequentes</a></li>
          <li><a href="#">Fale conosco</a></li>
          <li><a href="#">Termos de uso</a></li>
        </ul>
      </div>
      <div>
        <h4>Fontes oficiais</h4>
        <ul>
          <li><a href="https://conhecimento.fgv.br/concursos/sesto26/" target="_blank" rel="noopener">Site oficial (FGV)</a></li>
          <li><a href="https://diariooficial.to.gov.br/" target="_blank" rel="noopener">Diário Oficial do Tocantins</a></li>
        </ul>
      </div>
    </div>
    <div class="disclaimer">
      A PetroPrep é uma plataforma de estudos independente e não possui qualquer vínculo com o Governo do Estado do Tocantins, a Secretaria de Estado da Saúde, a Secretaria de Estado de Administração, a Fundação Getulio Vargas (FGV) ou qualquer órgão público. O cadastro e o pagamento da taxa de inscrição são feitos sempre no site oficial do concurso. Os dados de vagas, salários, requisitos e conteúdo programático deste guia foram extraídos do Edital nº 001/2026 – SECAD/SES/TO, de 12 de agosto de 2026; consulte sempre o edital oficial e seus anexos para as informações definitivas.
      <div class="copyright">© <span id="year"></span> PetroPrep. Todos os direitos reservados.</div>
    </div>
  </div>
</footer>

<script>
  document.getElementById('year').textContent = new Date().getFullYear();

  (function(){{
    var target = new Date('2026-11-01T08:00:00-03:00').getTime();
    var elD = document.getElementById('cd-days');
    var elH = document.getElementById('cd-hours');
    var elM = document.getElementById('cd-min');
    var elS = document.getElementById('cd-sec');
    function tick(){{
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      var d = Math.floor(diff / 86400000);
      var h = Math.floor((diff % 86400000) / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      elD.textContent = d;
      elH.textContent = String(h).padStart(2,'0');
      elM.textContent = String(m).padStart(2,'0');
      elS.textContent = String(s).padStart(2,'0');
    }}
    tick();
    setInterval(tick, 1000);
  }})();

  (function(){{
    var canvas = document.getElementById('hero-particles');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var hero = document.querySelector('.hero');
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var particles = [];
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var LINK_DIST = 130;
    var mouse = {{ x: null, y: null }};
    var REPEL = 150;
    var MAX_SPEED = 0.28;
    var MIN_SPEED = 0.06;

    function density(){{
      var area = canvas.clientWidth * canvas.clientHeight;
      return Math.max(28, Math.min(90, Math.round(area / 14000)));
    }}
    function resize(){{
      canvas.width = hero.clientWidth * DPR;
      canvas.height = hero.clientHeight * DPR;
      canvas.style.width = hero.clientWidth + 'px';
      canvas.style.height = hero.clientHeight + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }}
    function init(){{
      var n = density();
      particles = [];
      var w = hero.clientWidth, h = hero.clientHeight;
      for (var i = 0; i < n; i++){{
        var ang = Math.random() * Math.PI * 2;
        var spd = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
        particles.push({{ x: Math.random()*w, y: Math.random()*h, vx: Math.cos(ang)*spd, vy: Math.sin(ang)*spd, r: Math.random()*1.5+1 }});
      }}
    }}
    function frame(){{
      var w = hero.clientWidth, h = hero.clientHeight;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(function(p){{
        p.vx += (Math.random()-0.5)*0.02;
        p.vy += (Math.random()-0.5)*0.02;
        if (mouse.x !== null){{
          var dx = p.x-mouse.x, dy = p.y-mouse.y;
          var dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < REPEL && dist > 0.01){{
            var force = (1-dist/REPEL)*0.9;
            p.vx += (dx/dist)*force; p.vy += (dy/dist)*force;
          }}
        }}
        var speed = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
        if (speed > MAX_SPEED){{ p.vx=(p.vx/speed)*MAX_SPEED; p.vy=(p.vy/speed)*MAX_SPEED; }}
        else if (speed < MIN_SPEED && speed > 0){{ p.vx=(p.vx/speed)*MIN_SPEED; p.vy=(p.vy/speed)*MIN_SPEED; }}
        p.x += p.vx; p.y += p.vy;
        if (p.x<0||p.x>w) p.vx*=-1;
        if (p.y<0||p.y>h) p.vy*=-1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }});
      for (var i=0;i<particles.length;i++){{
        for (var j=i+1;j<particles.length;j++){{
          var a=particles[i], b=particles[j];
          var dx=a.x-b.x, dy=a.y-b.y;
          var dist=Math.sqrt(dx*dx+dy*dy);
          if (dist<LINK_DIST){{
            var t=1-dist/LINK_DIST;
            ctx.strokeStyle='rgba(255,255,255,'+(0.18+t*0.55).toFixed(3)+')';
            ctx.lineWidth=1.3+t*1.4;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }}
        }}
        if (mouse.x !== null){{
          var mdx=particles[i].x-mouse.x, mdy=particles[i].y-mouse.y;
          var mdist=Math.sqrt(mdx*mdx+mdy*mdy);
          if (mdist<REPEL*1.35){{
            ctx.strokeStyle='rgba(255,255,255,'+((1-mdist/(REPEL*1.35))*0.55).toFixed(3)+')';
            ctx.lineWidth=1.8;
            ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke();
          }}
        }}
      }}
      particles.forEach(function(p){{
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.fill();
      }});
      if (!reduceMotion) requestAnimationFrame(frame);
    }}
    hero.addEventListener('mousemove', function(e){{
      var rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top;
    }});
    hero.addEventListener('mouseleave', function(){{ mouse.x=null; mouse.y=null; }});
    hero.addEventListener('touchmove', function(e){{
      if (!e.touches || !e.touches[0]) return;
      var rect = hero.getBoundingClientRect();
      mouse.x = e.touches[0].clientX - rect.left; mouse.y = e.touches[0].clientY - rect.top;
    }}, {{ passive: true }});
    hero.addEventListener('touchend', function(){{ mouse.x=null; mouse.y=null; }});
    window.addEventListener('resize', function(){{ resize(); init(); }});
    resize(); init();
    if (reduceMotion){{ frame(); }} else {{ requestAnimationFrame(frame); }}
  }})();

  (function(){{
    var toggle = document.getElementById('menuToggle');
    var links = document.querySelector('nav.links');
    toggle.addEventListener('click', function(){{
      var open = links.style.display === 'flex';
      links.style.cssText = open ? '' : 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:#0b5e59;padding:16px 24px;gap:14px;box-shadow:0 8px 16px rgba(0,0,0,.15);';
    }});
  }})();

  (function(){{
    var nivel = document.getElementById('f-nivel');
    var area = document.getElementById('f-area');
    var localidade = document.getElementById('f-localidade');
    var busca = document.getElementById('f-busca');
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.vaga-tile'));
    var empty = document.getElementById('vaga-empty');

    function applyFilters(){{
      var vNivel = nivel.value, vArea = area.value, vLoc = localidade.value;
      var vBusca = busca.value.trim().toLowerCase();
      var visibleCount = 0;
      tiles.forEach(function(tile){{
        var okNivel = !vNivel || tile.dataset.nivel === vNivel;
        var okArea = !vArea || tile.dataset.area === vArea;
        var okLoc = !vLoc || (' ' + tile.dataset.localidades + ' ').indexOf(' ' + vLoc + ' ') !== -1;
        var okBusca = !vBusca || tile.dataset.nome.indexOf(vBusca) !== -1;
        var show = okNivel && okArea && okLoc && okBusca;
        tile.classList.toggle('hidden', !show);
        if (show) visibleCount++;
      }});
      empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }}
    [nivel, area, localidade].forEach(function(el){{ el.addEventListener('change', applyFilters); }});
    busca.addEventListener('input', applyFilters);
  }})();

  (function(){{
    document.querySelectorAll('.faq-q').forEach(function(btn){{
      btn.addEventListener('click', function(){{
        var item = btn.closest('.faq-item');
        var answer = item.querySelector('.faq-a');
        var isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(function(el){{
          if (el !== item){{ el.classList.remove('open'); el.querySelector('.faq-a').style.maxHeight = null; }}
        }});
        item.classList.toggle('open', !isOpen);
        answer.style.maxHeight = !isOpen ? (answer.scrollHeight + 'px') : null;
      }});
    }});
  }})();
</script>
</body>
</html>
'''

html_out = TEMPLATE.format(
    n_cargos=S['n_cargos'], n_localidades=S['n_localidades'],
    sal_min=S['sal_min'], sal_max=S['sal_max'],
    area_options=AREA_OPTIONS, loc_options=LOC_OPTIONS,
    cards=CARDS_HTML, disc_medio=DISC_MEDIO, disc_superior=DISC_SUPERIOR,
)

open(f'{DATA_DIR}/index.html', 'w', encoding='utf-8').write(html_out)
print('wrote', len(html_out), 'chars to index.html')
