# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## O que é este projeto

Plataforma de preparação para o **próximo concurso da Petrobras** (referência interna: "2027"). Objetivo de longo prazo: simulados, conteúdo programático por cargo, e um buscador de vagas com filtros (escolaridade, área, estado, concorrência).

**Fase atual: apenas a landing page** (captação de leads para lista de espera). As telas de Simulados, Conteúdos e Vagas ainda não existem — só a modelagem de dados em `prisma/schema.prisma`.

Contexto factual importante: até 2026-08 **não há edital oficial** da Petrobras para 2027. O concurso vivo de referência é o **Transpetro 2026 (banca Cesgranrio)**. Todos os números na landing são estimativas.

## Comandos

```bash
npm run dev            # servidor de desenvolvimento (Turbopack) em :3000
npm run build          # prisma generate + next build
npm run lint           # ESLint (eslint-config-next). Deve passar limpo.

npm run db:push        # aplica prisma/schema.prisma no banco (dev, sem migration)
npm run db:migrate     # cria/aplica migration nomeada (produção)
npm run db:studio      # Prisma Studio
npm run db:generate    # regenera o Prisma Client (rode após editar o schema)

docker compose up -d   # sobe Postgres local (user/senha/db = petroprep)
```

Não há suíte de testes ainda. Verificação = `npm run lint` + `npm run build` + conferir a página no browser.

## Arquitetura

**Stack:** Next.js 16 (App Router, React 19, Turbopack), Tailwind CSS v4, Prisma 6 + PostgreSQL. TypeScript estrito. Deploy alvo: Vercel + Postgres gerenciado (não configurado ainda); `docker-compose.yml` cobre o Postgres local.

**Fonte única de dados do concurso — `lib/concurso.ts`.** Cargos, salários, conteúdo programático, datas, FAQ e números vivem aqui. As seções da landing importam desse módulo. Quando o edital oficial sair, **este é o único arquivo que precisa mudar** para a landing refletir os dados reais. Campos com `oficial: false` devem manter o selo de "estimativa" na UI.

**Composição da página.** `app/page.tsx` (Server Component) monta seções de `components/*` na ordem: nav → hero → features → cargos → conteúdo → edital → waitlist → FAQ → footer. Cada seção é um componente isolado. Só são Client Components os que têm estado: `countdown.tsx` (timer), `cargos-section.tsx` (filtros), `waitlist-form.tsx` (submit).

**Fluxo da lista de espera.** `waitlist-form.tsx` → `POST /api/waitlist` (`app/api/waitlist/route.ts`) → `prisma.lead.upsert`. A rota **degrada com elegância sem banco**: se `DATABASE_URL` não estiver setada (`hasDatabase` em `lib/prisma.ts`), ela loga o lead e responde 200 com mensagem amigável, sem tocar no Prisma. Mantenha esse comportamento — a landing precisa funcionar antes do banco estar pronto.

**Prisma client** é singleton em `lib/prisma.ts` (evita esgotar conexões no hot-reload / serverless).

**Seção do edital.** `components/edital-section.tsx` é Server Component e checa `fs.statSync` em `public/edital/` pelos nomes de arquivo listados no array `documentos`. Se o PDF existe → botão de download; senão → "Em breve". Para adicionar um documento, coloque o PDF em `public/edital/` e adicione a entrada no array. Ver `public/edital/LEIA-ME.md`.

**Schema além da Fase 1.** `prisma/schema.prisma` já modela `Cargo`, `Vaga`, `Topico`, `Questao`, `Simulado`, `RespostaSimulado` para as próximas fases. Só `Lead` é usado hoje. Ao evoluir a plataforma, alinhe esses modelos com `lib/concurso.ts` (ou migre os dados estáticos para o banco).

## Convenções

- **Idioma:** toda a UI e os comentários de domínio em **português (pt-BR)**. Nomes de identificadores podem ser em português quando descrevem o domínio (`cargos`, `escolaridade`).
- **Cores:** use os tokens Tailwind do tema (`bg-brand`, `text-muted`, `border`, `bg-surface`, `bg-accent`) definidos em `app/globals.css` — não hardcode hex. Tema claro/escuro via `prefers-color-scheme`.
- **Disclaimer legal:** o rodapé deixa claro que a PetroPrep não tem vínculo com Petrobras/Transpetro/Cesgranrio. Não remova isso e não crie páginas que se passem por canais oficiais.
- **Regra de lint React:** não chamar `setState` de forma síncrona dentro de `useEffect` (a `eslint-config-next` barra). Ver o padrão em `countdown.tsx` (init lazy no `useState` + `suppressHydrationWarning`).
- O bloco `BEGIN:nextjs-agent-rules` em `AGENTS.md` é regravado pelo `next dev` — commite junto, não tente removê-lo.
