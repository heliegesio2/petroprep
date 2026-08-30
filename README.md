# PetroPrep 2027

Plataforma de preparação para o próximo concurso da Petrobras: simulados no
estilo da banca, conteúdo programático por cargo e buscador de vagas com filtros.

**Status:** Fase 1 — landing page de captação (lista de espera). As demais
funcionalidades estão apenas modeladas em `prisma/schema.prisma`.

> Até agosto/2026 a Petrobras não publicou edital para 2027. Referência atual:
> concurso **Transpetro 2026** (Cesgranrio), provas em 29/11/2026. Os números
> exibidos na landing são estimativas e ficam centralizados em `lib/concurso.ts`.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Prisma 6 · PostgreSQL

## Rodando localmente

```bash
npm install
cp .env.example .env        # no Windows: copy .env.example .env

# opcional — só se quiser persistir os leads:
docker compose up -d        # sobe Postgres em localhost:5432
npm run db:push             # cria a tabela Lead

npm run dev                 # http://localhost:3000
```

Sem `DATABASE_URL` a landing funciona normalmente: o formulário da lista de
espera responde com mensagem amigável e apenas registra o lead no log do
servidor (ver `app/api/waitlist/route.ts`).

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Desenvolvimento (Turbopack) |
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
components/             # uma seção por arquivo (hero, cargos, edital, ...)
lib/
  concurso.ts           # FONTE ÚNICA: cargos, conteúdo, datas, FAQ, números
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
