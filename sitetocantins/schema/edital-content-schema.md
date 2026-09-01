# Padrão PetroPrep para páginas de edital/concurso

> É um site só. Toda vez que um novo edital for enriquecido (novo guia/concurso
> adicionado à PetroPrep), os itens abaixo precisam ser conferidos para manter
> o mesmo padrão visual e de dados em todas as páginas do produto.

## 1. Checklist obrigatório por edital

Ao adicionar um novo concurso, confirme que os seguintes pontos existem e
seguem o padrão já estabelecido (guia Petrobras/Transpetro e guia Concurso
Saúde Tocantins 2026 são as referências):

- [ ] **Card de vaga** (`.vaga-tile`) com, nesta ordem: tags (edital/área +
  nível), nome do cargo, meta (carga horária + nº de localidades), caixa de
  **salário básico**, caixa dupla **vagas imediatas** / **cadastro de
  reserva**, chips de localidade, botão **"Saiba mais →"**.
- [ ] O botão **"Saiba mais →" é um link real (`<a href>`) para uma página
  interna dedicada daquele cargo** (`/vagas/<slug>.html`) — nunca um
  acordeão/`<details>` inline nem um `href="#"` de placeholder.
- [ ] A página interna do cargo repete a caixa de salário/vagas, mostra o
  **requisito de investidura**, o **conteúdo específico (Módulo II)** e as
  **matérias do Módulo I** (gerais, por nível), e a lista de localidades com
  vagas.
- [ ] **Todo conteúdo que é uma lista enumerada no edital original** (ex.:
  "1. Tema A; 2. Tema B; 3. Tema C") deve ser renderizado como uma lista real
  (`<ul>`/`<li>`), um item abaixo do outro — nunca como um parágrafo corrido
  com números soltos. Cada item leva um ícone pequeno (SVG inline, sem
  depender de fontes externas) consistente com a marca.
- [ ] **Matérias do Módulo I** aparecem com um link clicável de "Fazer teste
  →" por matéria. Enquanto o motor de testes não existir, o link aponta para
  `/testes/em-breve.html?materia=<slug>` (nunca um link quebrado ou `href="#"`).
- [ ] Rodapé com disclaimer de que a PetroPrep é independente, sem vínculo
  com o órgão/banca, citando o nome oficial do edital extraído.
- [ ] Fonte oficial do edital (URL) linkada no topbar, no anúncio superior e
  no rodapé.

## 2. De onde vêm os dados (pipeline de extração)

1. PDF oficial do edital → extraído com `pdfplumber` (texto + tabelas).
2. Vagas por cargo/localidade → tabela do Anexo de distribuição de vagas.
3. Salários → tabela de remuneração.
4. Requisitos de investidura → anexo de requisitos por cargo.
5. Conteúdo programático (Módulo I geral + Módulo II específico) → anexo de
   conteúdo programático.
6. Os textos extraídos passam por `parse_list()` (ver `build_details.py`) que
   separa listas enumeradas em itens individuais e remove artefatos de
   extração (ex.: marcadores de página).

## 3. Onde a integração real deve ler os dados

Este guia estático gera, para cada edital, um arquivo
`schema/cargos_enriched.json` com a estrutura abaixo. **É este arquivo — e
não o HTML — que a parte do sistema responsável pela interligação/backend
deve consumir** para renderizar as páginas de vaga dinamicamente ou para
alimentar busca, filtros e testes.

```json
{
  "edital": {
    "nome": "string",
    "orgao": "string",
    "banca": "string",
    "fonte_oficial": "url",
    "total_vagas_oficial": 0,
    "data_prova": "YYYY-MM-DD"
  },
  "materias_modulo1": {
    "medio": [{ "nome": "string", "slug": "string" }],
    "superior": [{ "nome": "string", "slug": "string" }]
  },
  "cargos": {
    "<nome do cargo>": {
      "nome": "string",
      "slug": "string",
      "area": "string",
      "nivel": "string",
      "carga_horaria": "string",
      "salario_basico": "string",
      "vagas": { "imediatas": 0, "cadastro_reserva": 0, "total": 0 },
      "localidades": [{ "cidade": "string", "vagas": 0 }],
      "requisito_investidura": "string",
      "conteudo_especifico": { "texto_bruto": "string", "itens": ["string"] },
      "materias_modulo1": [
        { "nome": "string", "slug": "string", "link_teste": "/testes/em-breve.html?materia=..." }
      ],
      "link_detalhe": "/vagas/<slug>.html",
      "fonte_edital": "url"
    }
  }
}
```

## 4. Regras de nomenclatura (para não quebrar o padrão entre editais)

- `slug()` = minúsculas, sem acento, espaços viram `-` (mesma função em
  `build_index.py` e `build_details.py`).
- Rótulos das caixas do card são **fixos e não devem ser traduzidos/alterados
  por edital**: `salário básico`, `vagas imediatas`, `cadastro de reserva`,
  `Saiba mais →`.
- Cores/tokens de marca (`--primary`, `--accent`, etc.) são os mesmos em
  todas as páginas do site — nunca redefinir por edital.

## 5. Arquivos deste guia (Concurso Saúde Tocantins 2026)

- `index.html` — guia principal (autocontido, usado também como página de
  marketing/preview).
- `assets/site.css` — estilos compartilhados pelas páginas internas de vaga
  (não usado pelo `index.html`, que permanece autocontido de propósito).
- `vagas/<slug>.html` — 73 páginas internas, uma por cargo.
- `testes/em-breve.html` — placeholder dos testes por matéria.
- `schema/cargos_enriched.json` — dados estruturados para integração.
- `build_index.py`, `build_full.py`, `build_details.py` — geradores; rodar
  nesta ordem sempre que os dados de origem (`cargos_final.json`,
  `modulo1_gerais.json`) mudarem.
