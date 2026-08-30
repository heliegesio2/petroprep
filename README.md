# PetroPrep 2027

Plataforma de preparação para o próximo concurso da Petrobras: simulados no
estilo da banca, conteúdo programático por cargo e buscador de vagas com filtros.

**Status:** Fase 1 — landing page de captação (lista de espera) com filtro
interativo de vagas e cotas. Simulados e conteúdos completos ainda são só
modelagem em `prisma/schema.prisma`.

> Até agosto/2026 a Petrobras não publicou edital para 2027. Referência atual:
> concurso **Transpetro 2026** (Cesgranrio), provas em 29/11/2026. Os números
> exibidos na landing são estimativas e ficam centralizados em `lib/concurso.ts`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Prisma 6 · PostgreSQL

## Rodando com Docker (recomendado)

Precisa só do **Docker Desktop** aberto. Um comando sobe o site + o banco:

```bash
docker compose up --build      # primeira vez (ou após mudar deps/schema)
docker compose up              # nas próximas vezes
```

Abra **http://localhost:3100** (porta 3100 porque a 3000 costuma estar ocupada
por outro projeto). O código é montado por volume, então editar arquivos
recarrega a página automaticamente (hot reload). O Postgres já vem junto (host
`localhost:5433`) e a tabela `Lead` é criada no start (`prisma db push`).

```bash
docker compose down            # para tudo (mantém os dados)
docker compose down -v         # para tudo e apaga o banco
docker compose logs -f app     # ver os logs do site
```

Build de produção local (a mesma imagem do deploy, sem hot reload):

```bash
docker compose -f docker-compose.prod.yml up --build
```

## Rodando sem Docker (Node direto)

```bash
npm install
cp .env.example .env        # no Windows: copy .env.example .env
npm run dev                 # http://localhost:3100
```

Sem `DATABASE_URL` a landing funciona normalmente: o formulário da lista de
espera responde com mensagem amigável e apenas registra o lead no log do
servidor (ver `app/api/waitlist/route.ts`). Para persistir os leads, suba um
Postgres e rode `npm run db:push`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Desenvolvimento (Turbopack) na porta 3100 |
| `npm run build` | `prisma generate` + build de produção |
| `npm run start` | Servir o build |
| `npm run lint` | ESLint |
| `npm run db:push` | Aplicar schema no banco (dev) |
| `npm run db:migrate` | Migration nomeada (produção) |
| `npm run db:studio` | Prisma Studio |

## Estrutura

```
app/
  page.tsx              # monta as seções da landing
  layout.tsx            # metadados pt-BR, fonte
  globals.css           # tokens de tema (claro/escuro)
  api/waitlist/route.ts # POST da lista de espera → Prisma (degrada sem banco)
components/             # uma seção por arquivo (hero banner, vagas-section, edital, ...)
lib/
  concurso.ts           # FONTE ÚNICA: cargos, vagas, cotas, conteúdo, datas, FAQ
                        #   filtrarVagas() calcula vagas por perfil + reserva (cotas)
  prisma.ts             # Prisma Client singleton
prisma/schema.prisma    # Lead (usado) + modelos das próximas fases
public/edital/          # PDFs do edital (ver LEIA-ME.md)
```

## Documentos do edital

Coloque os PDFs em `public/edital/` com os nomes descritos em
`public/edital/LEIA-ME.md`. A seção "Edital" da landing detecta o arquivo e
troca "Em breve" pelo botão de download automaticamente.

---

Iniciativa independente de preparação para concursos, **sem vínculo** com a
Petrobras, a Transpetro ou a Fundação Cesgranrio.
