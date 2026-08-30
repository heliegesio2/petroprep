# PetroPrep

Plataforma **multi-concurso** de preparação: simulados no estilo da banca,
conteúdo programático por cargo e buscador de vagas e cotas por perfil.
**Transpetro 2026** (Cesgranrio) é o concurso em destaque; outros entram como
cards de resumo.

**Status:** landing page com carrossel de concursos + filtro de vagas/cotas +
captação de assinatura (2 planos). Simulados e conteúdo completo ainda são só
modelagem em `prisma/schema.prisma`.

> Vagas, salários e datas são **estimativas** montadas a partir da imprensa
> especializada e de editais anteriores — confira sempre a fonte oficial.
> Centralizadas em `lib/concursos.ts`. O nome "PetroPrep" é provisório.

## Planos

| Plano | Preço | Acesso |
| --- | --- | --- |
| Transpetro | R$ 50 (único) | todo o material da Transpetro, até o dia da prova |
| Completo | R$ 80 (único) | todos os concursos da plataforma |

O botão "Assinar" hoje **capta intenção** (nome + e-mail + plano → tabela `Lead`).
Checkout real (Mercado Pago/Stripe) é fase seguinte.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Prisma 6 · PostgreSQL

## Rodando com Docker (recomendado)

Precisa só do **Docker Desktop** aberto:

```bash
docker compose up --build      # primeira vez (ou após mudar deps/schema)
docker compose up              # nas próximas vezes
```

Abra **http://localhost:3100** (a 3000 costuma estar ocupada por outro projeto).
Código montado por volume → hot reload. Postgres já vem junto (host
`localhost:5433`); o schema é aplicado no start (`prisma db push`).

```bash
docker compose down            # para (mantém os dados)
docker compose down -v         # para e apaga o banco
docker compose logs -f app     # logs do site
```

Build de produção local: `docker compose -f docker-compose.prod.yml up --build`.

## Rodando sem Docker

```bash
npm install
cp .env.example .env           # Windows: copy .env.example .env
npm run dev                    # http://localhost:3100
```

Sem `DATABASE_URL` a landing funciona: `/api/assinar` responde com mensagem
amigável e só registra no log. Para persistir, suba um Postgres e `npm run db:push`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Desenvolvimento (Turbopack) na porta 3100 |
| `npm run build` | `prisma generate` + build de produção |
| `npm run lint` | ESLint |
| `npm run db:push` | Aplicar schema no banco (dev) |
| `npm run db:studio` | Prisma Studio |

## Estrutura

```
app/
  page.tsx                 # server: lê public/edital/*, monta as seções
  layout.tsx               # metadados pt-BR
  api/assinar/route.ts     # POST assinatura → Prisma (degrada sem banco)
components/
  concurso-explorer.tsx    # CLIENT: estado do concurso selecionado
  concurso-carousel.tsx    # banner em carrossel (setas, dots, teclado)
  vagas-filtro.tsx         # filtro de vagas/cotas (ou teaser "em breve")
  conteudo-section.tsx / edital-section.tsx
  planos-section.tsx + assinar-form.tsx
lib/
  concursos.ts             # FONTE ÚNICA: concursos, cargos, vagas, cotas, FAQ
  planos.ts                # os 2 planos
  prisma.ts                # Prisma Client singleton
public/edital/<slug>/      # PDFs por concurso (ver LEIA-ME.md dentro)
```

---

Iniciativa independente de preparação para concursos, **sem vínculo** com a
Petrobras, a Transpetro, a Cesgranrio ou qualquer órgão público.
