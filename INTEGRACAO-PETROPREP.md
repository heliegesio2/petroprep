# PetroPrep — estado atual do projeto e o que falta para integrar

> Documento de handoff técnico. Objetivo: qualquer pessoa (ou o Claude Code
> rodando neste repositório) consegue entender o que já existe, como foi
> construído, e o que precisa ser feito a seguir — sem depender do histórico
> da conversa onde isso foi produzido.

Última atualização: 31/08/2026.

---

## 1. Visão geral

A PetroPrep é uma plataforma de estudos para concursos públicos brasileiros.
Hoje existem **dois guias de concurso**, cada um em uma pasta própria no
mesmo diretório raiz, como sites estáticos irmãos:

```
C:\petro2017\
├── site\               ← guia do Concurso Transpetro 2026 (Cesgranrio)
│   └── index.html
└── sitetocantins\       ← guia do Concurso Saúde Tocantins 2026 (FGV)
    ├── index.html
    ├── assets\site.css
    ├── vagas\           (páginas internas de cada cargo)
    ├── estudo\          (páginas de estudo por item de conteúdo)
    ├── testes\          (placeholder do motor de testes)
    ├── schema\          (dados estruturados + documentação de padrão)
    └── build_*.py       (scripts geradores)
```

**Nenhum dos dois sites tem backend, banco de dados ou servidor hoje.** São
arquivos HTML/CSS/JS estáticos, gerados localmente (no caso do Tocantins) ou
mantidos à mão (no caso do site principal), e abertos direto no navegador
via `file://` ou publicados como arquivos estáticos em qualquer host. Isso é
o ponto central deste documento: **o que falta para o site funcionar de
forma dinâmica de verdade** está detalhado na seção 6.

---

## 2. O que já está pronto

### 2.1 Design system compartilhado (os dois sites usam o mesmo)

Tokens de marca, fixos em `:root` (CSS custom properties), repetidos em
`site/index.html`, `sitetocantins/index.html` e em `sitetocantins/assets/site.css`:

```css
--primary:#0b5e59; --primary-dark:#083f3c; --primary-light:#e3f2f0;
--accent:#f4a300;  --accent-dark:#c97e00;
--surface:#ffffff; --bg:#f4f6f5;
--text-primary:#1b1f1e; --text-secondary:#5b6663; --text-muted:#8a938f;
--border:#e1e6e4; --good:#0e8a5a;
```

Fontes: Roboto (texto) + Roboto Mono (números). Carregadas via Google Fonts
(`fonts.googleapis.com`) — **isso depende de internet**; se o site for
usado totalmente offline, essas fontes precisam ser embutidas ou trocadas
por uma pilha de fontes de sistema.

### 2.2 Padrão do card de vaga (`.vaga-tile`) — obrigatório em todo edital

Nesta ordem, sempre:

1. Tags (edital/área + nível)
2. Nome do cargo
3. Meta (carga horária + nº de localidades)
4. Caixa **salário básico**
5. Caixa dupla **vagas imediatas** / **cadastro de reserva**
6. Chips de localidade
7. Botão **"Saiba mais →"** — **link real** para uma página interna
   dedicada (`vagas/<slug-do-cargo>.html`), nunca um acordeão `<details>`
   nem um `href="#"` de placeholder.

Esse padrão está documentado em detalhe em
`sitetocantins/schema/edital-content-schema.md` — leia esse arquivo antes de
mexer em qualquer card, ele tem o checklist completo que deve ser conferido
toda vez que um novo edital for adicionado.

### 2.3 Guia do Concurso Saúde Tocantins 2026 (`sitetocantins/`)

Construído a partir do PDF oficial do edital (`Edital nº 001/2026 –
SECAD/SES/TO`, banca FGV, fonte: https://conhecimento.fgv.br/concursos/sesto26/).

- **72 cargos/especialidades** (não 73 — ver bug corrigido na seção 5.1),
  5.102 vagas mapeadas por cargo/cidade (total oficial do edital: 5.124 —
  diferença documentada na seção 5.2), 15 localidades.
- `index.html`: página principal com filtro (nível/área/cidade/busca),
  grade de 72 cards de vaga, seções de conteúdo programático, cronograma e
  FAQ. Arquivo único e autocontido (CSS/JS inline) — assim ele pode ser
  publicado como artifact de página única sem depender de arquivos externos.
- `vagas/<slug>.html` — **72 páginas internas**, uma por cargo, com: caixas
  de salário/vagas, requisito de investidura, conteúdo específico do
  Módulo II em lista (com ícone), matérias do Módulo I do nível
  correspondente (com botão "Fazer teste →"), vagas por cidade, CTA final.
  Usam `assets/site.css` (compartilhado, **não** inline) — por isso essas
  páginas só funcionam corretamente se a pasta inteira for mantida junto.
- `estudo/` — páginas de **estudo por item individual** de conteúdo
  programático (ver detalhe na seção 2.4).
- `testes/em-breve.html` — placeholder para onde os botões "Fazer teste →"
  apontam hoje. Não existe motor de teste ainda (ver seção 6.4).
- Seletor de concurso "CONCURSOS (2)" no topo da seção de filtro, com
  `<select>` que navega entre `sitetocantins/index.html` e
  `../site/index.html` (ver seção 2.5).

### 2.4 Páginas de estudo por item (`estudo/`) — piloto

Cada item de conteúdo programático (tanto do Módulo I — matérias gerais —
quanto do Módulo II — conteúdo específico por cargo) pode ter sua própria
página de estudo, com resumo, pontos-chave e dica de prova. Hoje isso está
implementado como **piloto**, cobrindo:

- As **4 matérias de nível Superior** do Módulo I: Língua Portuguesa (17
  itens), Raciocínio Lógico e Matemático (19), História e Geografia do
  Estado do Tocantins (16), Legislação (9) — total **61 páginas** em
  `estudo/materia/<materia-slug>/`, cada uma com um `index.html` (lista de
  itens) e uma página por item.
- **1 cargo completo** (Assistente Social) do Módulo II: **41 páginas** em
  `estudo/cargo/assistente-social/`, com o mesmo formato.

O conteúdo de cada página (`resumo`, `pontos-chave`, `dica de prova`) está
em `schema/study_content.json` e foi **escrito por IA (Claude), com base em
conhecimento geral sobre os temas** — não veio de nenhuma apostila ou
bibliografia da PetroPrep, e não foi revisado por um especialista humano.
Ver ressalva importante na seção 6.1.

Na página de cada cargo (`vagas/<slug>.html`), os itens de conteúdo
específico e os nomes das matérias só aparecem como **links clicáveis**
quando a página de estudo correspondente já existe. Hoje isso é assim
apenas em `vagas/assistente-social.html` — nos outros 71 cargos, os itens
ainda são texto simples, não clicável (porque a página de destino ainda não
existe). Ver seção 6.2 para o rollout completo.

### 2.5 Seletor de concurso ("CONCURSOS (N)")

No topo da seção de filtro dos dois sites, substituindo o texto fixo do
nome do concurso, agora existe:

```html
<div class="concurso-switch">
  <span class="cs-label">Concursos (2)</span>
  <select id="concursoSwitch" onchange="if(this.value) window.location.href=this.value;">
    <option value="index.html" selected>Concurso Saúde Tocantins 2026</option>
    <option value="../site/index.html">Concurso Transpetro 2026</option>
  </select>
</div>
```

**Isso está hardcoded** — cada arquivo `index.html` tem a lista de opções
escrita à mão, apontando para o caminho relativo do outro site (`../site/`
ou `../sitetocantins/`). Funciona hoje porque só existem 2 concursos, mas
não escala — ver seção 6.3.

### 2.6 Pipeline de extração de dados do edital (PDF → site)

Usado para o Tocantins Saúde; é o processo a repetir para qualquer edital
novo. Ferramenta: `pdfplumber` (Python).

1. `extract_text()` — texto corrido, usado para achar seções e blocos.
2. `extract_tables()` — tabela de vagas por cargo/cidade (Anexo II).
   **Cuidado**: linhas de subtotal ("TOTAL", "TOTAL GERAL") precisam ser
   explicitamente filtradas, senão viram cargos fantasmas que dobram a
   contagem de vagas de uma localidade.
3. `extract_words()` com clustering por posição X — usado para o Anexo IV
   (requisitos), que tinha layout de 2 colunas mal estruturado no PDF. A
   coluna esquerda (`x0 < 260`) é o nome do cargo; a direita (`x0 >= 260`)
   é o texto do requisito. Detecção de novo bloco de cargo via frases
   "gatilho" (`"Curso Superior"`, `"Ensino Médio"`, `"Formação Superior"`).
4. Conteúdo programático (Módulo I geral + Módulo II específico) — texto
   extraído e depois normalizado com `parse_list()` (em
   `build_details.py` e `build_study.py`), que:
   - Remove marcadores de página deixados pela extração (`===== PAGE N
     =====`) — havia **40 cargos** com esse artefato antes da limpeza.
   - Separa o texto enumerado (`"1. X; 2. Y; 3. Z"` **ou** `"1. X. 2. Y."`)
     em uma lista real de itens.
5. Nomes de cargo entre anexos diferentes nem sempre batem exatamente
   (acento, hífen vs. travessão, variação semântica como "Cirurgia Geral"
   vs. "Cirurgião Geral"). Isso exigiu normalização acento/case-insensitive
   mais um dicionário de alias manual — **e ainda assim um caso passou
   despercebido** (ver seção 5.1).

Arquivos de dados intermediários ficam em `sitetocantins/` (não vão para
produção, são só do pipeline): `full_text.txt`, `anexo1_conteudo.txt`,
`anexo2_vagas.txt`, `anexo4_requisitos.txt`, `*_raw*.json`. Os dados finais
e limpos, que os scripts de geração realmente usam, são:
`cargos_final.json` (dados por cargo) e `modulo1_gerais.json` (matérias do
Módulo I por nível).

### 2.7 Scripts geradores — ordem de execução

Sempre que `cargos_final.json` ou `modulo1_gerais.json` mudarem, rode nesta
ordem (cada um lê a saída do anterior):

```bash
cd sitetocantins
python3 build_index.py     # gera os 72 cards de vaga (_cards.html) e os _summary.json
python3 build_full.py      # monta o index.html completo (CSS + body + JS)
python3 build_details.py   # gera vagas/*.html, testes/em-breve.html, schema/cargos_enriched.json
python3 build_study.py     # gera estudo/materia/*.html e estudo/cargo/*.html (usa schema/study_content.json)
```

`build_details.py` **precisa rodar antes** de `build_study.py`, porque é
ele quem gera as páginas de vaga que `build_study.py` depois edita
(inserindo os links para as páginas de estudo).

---

## 3. Contrato de dados para integração (`schema/cargos_enriched.json`)

Este é o arquivo pensado para ser a **fonte de verdade que um backend real
deveria consumir**, em vez de fazer parsing do HTML. Estrutura:

```json
{
  "edital": {
    "nome": "Edital nº 001/2026 – SECAD/SES/TO",
    "orgao": "Secretaria de Estado da Saúde do Tocantins (SES/TO)",
    "banca": "FGV",
    "fonte_oficial": "https://conhecimento.fgv.br/concursos/sesto26/",
    "total_vagas_oficial": 5124,
    "data_prova": "2026-11-01"
  },
  "materias_modulo1": {
    "medio": [{ "nome": "...", "slug": "..." }],
    "superior": [{ "nome": "...", "slug": "..." }]
  },
  "cargos": {
    "<nome do cargo>": {
      "nome": "string", "slug": "string", "area": "string", "nivel": "string",
      "carga_horaria": "string", "salario_basico": "string",
      "vagas": { "imediatas": 0, "cadastro_reserva": 0, "total": 0 },
      "localidades": [{ "cidade": "string", "vagas": 0 }],
      "requisito_investidura": "string",
      "conteudo_especifico": { "texto_bruto": "string", "itens": ["string"] },
      "materias_modulo1": [{ "nome": "string", "slug": "string", "link_teste": "/testes/em-breve.html?materia=..." }],
      "link_detalhe": "/vagas/<slug>.html",
      "fonte_edital": "url"
    }
  }
}
```

O conteúdo de estudo (`schema/study_content.json`) é um segundo arquivo,
hoje **não referenciado** dentro de `cargos_enriched.json` — cada item de
`conteudo_especifico.itens` teria que ser casado por texto com a chave
correspondente em `study_content.json`. Se for construir um backend de
verdade, vale a pena unificar os dois num único schema (ver seção 6.5).

---

## 4. O que NÃO está implementado (features "de mentirinha" hoje)

Para não haver dúvida na hora de integrar — estas coisas **aparecem no
site mas não funcionam de verdade**:

- **Login / Cadastre-se** (site principal): botões existem, não há
  autenticação nem conta de usuário.
- **Planos pagos / checkout**: página de planos existe com preços, não há
  integração de pagamento.
- **Simulados / "Fazer teste"**: em ambos os sites, é só texto ou leva para
  `testes/em-breve.html`. Não existe banco de questões nem motor de
  correção.
- **Progresso do usuário** ("X de 7 disciplinas estudadas", checkbox de
  "marcar como estudado"): é só um contador em JavaScript local, perdido ao
  fechar a aba — não salva em lugar nenhum.
- **Ranking competitivo**: mencionado no texto de marketing, não existe.
- **Ver todos os X cargos** / paginação: o site principal (`site/`) mostra
  só 8 de 22 cargos como exemplo, com um card "+14 outros cargos" que não
  leva a lugar nenhum ainda.

---

## 5. Bugs encontrados e correções aplicadas

### 5.1 Cargo duplicado por inconsistência de travessão (corrigido)

`cargos_final.json` tinha duas entradas para o mesmo cargo — "Médico RQE
**–** Ultrassonografista - Medicina Fetal (USG)" (travessão) e "Médico RQE
**-** Ultrassonografista - Medicina Fetal (USG)" (hífen) — resultado de uma
inconsistência da extração do PDF. Isso fazia o gerador de slugs colidir
(as duas viravam o mesmo nome de arquivo), e uma das duas pisava na outra
silenciosamente: o card aparecia duplicado no index, mas a página de
detalhe só tinha os dados de uma das duas (perdendo a vaga da outra
cidade). **Corrigido**: as duas entradas foram mescladas em uma só,
somando as localidades (Palmas: 3 + Gurupi: 1 = 4 vagas) e usando a forma
com hífen simples, que é o padrão dominante no arquivo (37 outras entradas
usam hífen, só essa usava travessão). Cargo count real: **72**, não 73.
Todo o site foi regenerado após a correção.

### 5.2 Diferença entre vagas extraídas e total oficial (não resolvido, documentado)

Soma das vagas extraídas por cargo/cidade: **5.102**. Total oficial do
edital (citado no texto do próprio edital): **5.124**. Diferença de 22
vagas, rastreada a 5 localidades específicas (Araguaçu -2, Gurupi -11,
Araguaína -1, Arraias -5, Dianópolis -3), causada por linhas perdidas em
quebras de página durante `extract_tables()`. **Decisão tomada**: usar o
número oficial (5.124) nos destaques/hero do site, manter os 5.102
extraídos nos cards individuais (é a soma que bate com o detalhamento por
cargo/cidade), e deixar um aviso explícito no rodapé de que o edital
oficial prevalece. Se for reprocessar o PDF, vale revisar essas 5
localidades linha por linha no Anexo II.

---

## 6. O que falta fazer (lista de tarefas, em ordem sugerida de prioridade)

### 6.1 Revisão humana do conteúdo de estudo (`schema/study_content.json`)

As 102 páginas de estudo já geradas (61 de matérias do Módulo I Superior +
41 do cargo Assistente Social) têm resumo, pontos-chave e dica de prova
**escritos por IA**, sem checagem de uma pessoa formada na área (Serviço
Social, Direito Administrativo/SUS, etc.) nem comparação com bibliografia
oficial. Antes de publicar isso como conteúdo pago/oficial do produto, uma
pessoa qualificada devia revisar linha por linha — principalmente os itens
que citam leis específicas (Lei 8.080, Lei 8.142, ECA), para garantir que
não há nenhum erro factual.

### 6.2 Rollout do padrão de estudo para o resto do Tocantins Saúde

Hoje só 1 de 72 cargos (Assistente Social) e só as matérias de nível
Superior têm página de estudo. Falta:

- As 4 matérias de nível **Médio/Técnico** do Módulo I (hoje só existem
  como texto em `modulo1_gerais.json`, nunca viraram páginas).
- Os outros **71 cargos** do Módulo II (cada um com seus próprios itens de
  conteúdo específico).
- Estimativa: são bem mais de 1.000 páginas de estudo adicionais, cada uma
  precisando de conteúdo redigido (por IA e depois revisado, ou já
  revisado desde o início). Rodar `build_study.py` sozinho não basta — ele
  só gera HTML a partir do que já estiver escrito em
  `study_content.json`; o texto de cada item novo precisa ser produzido
  antes.

### 6.3 Lista de concursos dinâmica (não hardcoded)

O seletor "CONCURSOS (N)" hoje tem as opções escritas à mão em cada
`index.html`. Isso não escala: a cada concurso novo, seria preciso editar
manualmente **todos** os `index.html` existentes para adicionar a nova
opção. Ideal:

- Um arquivo único (`concursos.json`, na raiz de `C:\petro2017\`, por
  exemplo) listando todos os concursos ativos: `{ "nome": "...", "url":
  "..." }[]`.
- Cada `index.html` carrega esse arquivo dinamicamente (via `fetch`, o que
  exige servir os arquivos por HTTP — **não funciona abrindo por
  `file://`**, que é como o site é usado hoje) e monta o `<select>` a
  partir dele.
- Alternativa mais simples sem precisar de servidor: gerar o `<select>` de
  cada site no momento do build (um script Python lê `concursos.json` e
  escreve o HTML final de cada `index.html`), similar ao que
  `build_full.py` já faz para o resto da página.

### 6.4 Motor de simulados/testes

Hoje é 100% placeholder (`testes/em-breve.html`). Para isso funcionar de
verdade é necessário, no mínimo:

- Banco de questões por matéria/item (não existe nenhuma questão hoje, só
  os resumos de estudo).
- Um backend com lógica de aplicação/correção do teste e algum tipo de
  persistência do resultado.
- Ligação entre a questão e o item de conteúdo/matéria correspondente
  (`materia_slug` / `item_slug` já existem como identificadores — dá pra
  reaproveitar).

### 6.5 Backend real / dinamização do site

Este é o item estrutural maior. Hoje **não existe backend**: tudo é HTML
estático gerado localmente. Para o site "funcionar dinamicamente" (termo
usado no pedido que originou este documento), o caminho natural é:

1. Migrar os dados de `schema/cargos_enriched.json` (por edital) e
   `schema/study_content.json` para um banco de dados real (mesmo que
   simples), em vez de arquivos JSON versionados manualmente por pasta de
   concurso.
2. Trocar as páginas estáticas (`vagas/<slug>.html`,
   `estudo/materia/<slug>/<item>.html`, `estudo/cargo/<slug>/<item>.html`)
   por rotas dinâmicas servidas por uma aplicação real (ex.: Next.js,
   Django, Rails — a escolha é do time), que buscam o conteúdo do banco em
   vez de ter um arquivo HTML por cargo/item gerado antecipadamente.
3. Unificar `cargos_enriched.json` e `study_content.json` num só schema
   (hoje são dois arquivos separados que precisam ser casados por texto do
   item — frágil).
4. Nesse cenário, a lista de concursos (seção 6.3), o progresso do usuário,
   o login e os simulados passam a ser features naturais de se implementar
   (hoje são features "presas" pela falta de backend).
5. **Contas de usuário e progresso salvo** (login, "X de N disciplinas
   estudadas" persistente, histórico de simulados) — depende do item 2.

### 6.6 Aplicar o padrão de página de vaga + estudo no site principal (Transpetro)

O `site/index.html` (Transpetro) **ainda não tem** página interna de vaga
nem página de estudo — os cards de lá têm "Saiba mais" apontando para
`href="#"` (não implementado), e as "disciplinas" do conteúdo programático
são só um checklist visual, sem detalhamento nem link. Se o padrão do
Tocantins for aprovado, o mesmo trabalho (páginas `vagas/*.html`,
`estudo/materia/*` e `estudo/cargo/*`, scripts geradores equivalentes)
precisa ser replicado lá — ainda não foi feito.

### 6.7 Hospedagem real

Hoje os dois sites só existem localmente, no Windows do usuário
(`C:\petro2017\...`), abertos via `file://`. Para o produto ir ao ar,
falta publicar os arquivos estáticos (ou a aplicação dinâmica, se o item
6.5 for implementado) em um host real com domínio próprio.

---

## 7. Referências rápidas

- Padrão de card/página e regras para novos editais:
  `sitetocantins/schema/edital-content-schema.md`
- Dados estruturados do edital Tocantins:
  `sitetocantins/schema/cargos_enriched.json`
- Conteúdo de estudo (resumo/pontos/dica) por item:
  `sitetocantins/schema/study_content.json`
- Ordem de build: seção 2.7 deste documento.
