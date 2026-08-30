# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## O que é este projeto

Plataforma de preparação para o **próximo concurso da Petrobras** (referência interna: "2027"). Objetivo de longo prazo: simulados, conteúdo programático por cargo, e um buscador de vagas com filtros (escolaridade, área, estado, concorrência).

**Fase atual: apenas a landing page** (captação de leads para lista de espera). As telas de Simulados, Conteúdos e Vagas ainda não existem — só a modelagem de dados em `prisma/schema.prisma`.

Contexto factual importante: até 2026-08 **não há edital oficial** da Petrobras para 2027. O concurso vivo de referência é o **Transpetro 2026 (banca Cesgranrio)**. Todos os números na landing são estimativas.

## Comandos

**Docker é o caminho recomendado** (evita as quirks de file-watching do Next no Windows quando o projeto está direto na raiz `C:\`):

```bash
docker compose up --build   # app (hot reload) + Postgres → http://localhost:3100
docker compose down [-v]     # para (-v apaga o banco)
docker compose -f docker-compose.prod.yml up --build   # testa a imagem de deploy
```

O serviço `app` (compose dev) roda `prisma db push` e depois `next dev -H 0.0.0.0 --webpack`. **`--webpack` + `WATCHPACK_POLLING=true` são obrigatórios**: o Turbopack não detecta mudanças no bind mount do Windows (o watcher do Webpack com polling detecta). Para edição intensa, `npm run dev` no host é mais rápido. Depois de mudar arquivo, se o container não recompilar: `docker compose restart app`.

Node direto:

```bash
npm run dev            # Turbopack em :3100 (emite "Watchpack Error ... C:\pagefile.sys" — ruído inofensivo)
npm run build          # prisma generate + next build (output: standalone)
npm run lint           # ESLint (eslint-config-next). Deve passar limpo.
npm run db:push        # aplica prisma/schema.prisma (dev, sem migration)
npm run db:studio      # Prisma Studio
```

Não há suíte de testes. Verificação = `npm run lint` + `npm run build` + conferir a página no browser.

## Docker

- `Dockerfile` — build de produção multi-stage, usa `output: "standalone"` do `next.config.ts`. Copia `.prisma` e `@prisma` para o runner (a rota `/api/waitlist` precisa do engine em runtime). `openssl` instalado nas 3 stages (Prisma exige).
- `Dockerfile.dev` — imagem de dev, `npm ci` + código por volume.
- `docker-compose.yml` — dev: `app` + `db`, source bind-mounted, `node_modules` e `.next` em volumes anônimos.
- `docker-compose.prod.yml` — build de produção + serviço `migrate` one-shot antes do `app`.

## Arquitetura

**Stack:** Next.js 16 (App Router, React 19, Turbopack), Tailwind CSS v4, Prisma 6 + PostgreSQL. TypeScript estrito. Deploy alvo: Vercel + Postgres gerenciado (não configurado ainda); `docker-compose.yml` cobre o Postgres local.

**Fonte única de dados do concurso — `lib/concurso.ts`.** Cargos, salários, conteúdo programático, datas, FAQ e números vivem aqui. As seções da landing importam desse módulo. Quando o edital oficial sair, **este é o único arquivo que precisa mudar** para a landing refletir os dados reais. Campos com `oficial: false` devem manter o selo de "estimativa" na UI.

**Composição da página.** `app/page.tsx` (Server Component) monta seções de `components/*` na ordem: nav (com faixa de anúncio) → hero (banner verde escuro) → features → vagas → conteúdo → edital → waitlist → FAQ → footer. Cada seção é um componente isolado. Client Components (têm estado): `countdown.tsx` (timer), `vagas-section.tsx` (filtro de vagas/cotas), `waitlist-form.tsx` (submit).

**Filtro de vagas e cotas — `components/vagas-section.tsx` + `lib/concurso.ts`.** O usuário escolhe escolaridade, área, UF e grupos de reserva (cotas); o total de vagas e as vagas reservadas ao perfil recalculam via `filtrarVagas(filtro)` — função pura em `lib/concurso.ts`, sem chamada de rede. Dados: `vagas[]` (por cargo/UF, `imediatas` estimadas) e `gruposReserva[]` (negros 20% / Lei 12.990, PcD 5% / Decreto 9.508; indígena e LGBTQIA+ com `percentual: 0` e `nota` explicando que não há cota federal). `vagasReservadas()` aplica percentual, piso de vagas e teto de 20%. Para mudar cotas ou números quando o edital sair, editar só esses arrays.

**Hero é banner escuro.** `components/hero.tsx` usa fundo `#062a1c` + gradiente + `Refinery()` (SVG silhueta) e texto branco. `countdown.tsx` usa `border-current/15 bg-current/10` para funcionar sobre fundo claro ou escuro.

**Fluxo da lista de espera.** `waitlist-form.tsx` → `POST /api/waitlist` (`app/api/waitlist/route.ts`) → `prisma.lead.upsert`. A rota **degrada com elegância sem banco**: se `DATABASE_URL` não estiver setada (`hasDatabase` em `lib/prisma.ts`), ela loga o lead e responde 200 com mensagem amigável, sem tocar no Prisma. Mantenha esse comportamento — a landing precisa funcionar antes do banco estar pronto.

**Prisma client** é singleton em `lib/prisma.ts` (evita esgotar conexões no hot-reload / serverless).

**Seção do edital.** `components/edital-section.tsx` é Server Component e checa `fs.statSync` em `public/edital/` pelos nomes de arquivo listados no array `documentos`. Se o PDF existe → botão de download; senão → "Em breve". Para adicionar um documento, coloque o PDF em `public/edital/` e adicione a entrada no array. Ver `public/edital/LEIA-ME.md`.

**Schema além da Fase 1.** `prisma/schema.prisma` já modela `Cargo`, `Vaga`, `Topico`, `Questao`, `Simulado`, `RespostaSimulado` para as próximas fases. Só `Lead` é usado hoje. Ao evoluir a plataforma, alinhe esses modelos com `lib/concurso.ts` (ou migre os dados estáticos para o banco).

## Convenções

- **Idioma:** toda a UI e os comentários de domínio em **português (pt-BR)**. Nomes de identificadores podem ser em português quando descrevem o domínio (`cargos`, `escolaridade`).
- **Cores:** use os tokens Tailwind do tema (`bg-brand`, `text-muted`, `border`, `bg-surface`, `bg-accent`) definidos em `app/globals.css` — não hardcode hex. Tema claro/escuro via `prefers-color-scheme`.
- **Disclaimer legal:** o rodapé deixa claro que a PetroPrep não tem vínculo com Petrobras/Transpetro/Cesgranrio. Não remova isso e não crie páginas que se passem por canais oficiais.
- **Regra de lint React:** não chamar `setState` de forma síncrona dentro de `useEffect` (a `eslint-config-next` barra). Ver o padrão em `countdown.tsx` (init lazy no `useState` + `suppressHydrationWarning`).
- **Aviso de hidratação `inmaintabuse="1"` no log do dev:** é injeção da extensão Claude-in-Chrome no `<body>`, não bug do código. Não aparece para usuário sem a extensão.
- **Portas:** app 3100, Postgres host 5433 (a 3000 está ocupada por outro projeto Docker na máquina).
- O bloco `BEGIN:nextjs-agent-rules` em `AGENTS.md` é regravado pelo `next dev` — commite junto, não tente removê-lo.
