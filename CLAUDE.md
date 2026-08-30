# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## O que é este projeto

**Plataforma multi-concurso** de preparação (simulados, conteúdo, buscador de vagas/cotas). O **Transpetro 2026** (banca Cesgranrio, inscrições até 14/09/2026, prova 29/11/2026) é o concurso em **destaque**; os demais entram como cards de resumo. Nome "PetroPrep" é provisório — deve mudar (ver plano `~/.claude/plans/abre-o-naveg-*.md`).

**Fase atual: landing page** com carrossel de concursos + filtro de vagas + **captação de assinatura** (2 planos). Simulados/conteúdo completo ainda não têm telas.

**Monetização:** 2 planos pagamento único — R$ 50 (só Transpetro, até a prova) e R$ 80 (todos os concursos). Sem tier gratuito. O botão "Assinar" **capta intenção** (nome+e-mail+plano → `Lead`); checkout real (Mercado Pago/Stripe) é fase futura.

Contexto factual: vagas/salários/datas são **estimativas** de imprensa + editais anteriores. Só a Transpetro tem edital publicado. Sempre com selo "confira a fonte oficial".

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

- `Dockerfile` — build de produção multi-stage, usa `output: "standalone"` do `next.config.ts`. Copia `.prisma` e `@prisma` para o runner (a rota `/api/assinar` precisa do engine em runtime). `openssl` instalado nas 3 stages (Prisma exige).
- `Dockerfile.dev` — imagem de dev, `npm ci` + código por volume.
- `docker-compose.yml` — dev: `app` + `db`, source bind-mounted, `node_modules` e `.next` em volumes anônimos.
- `docker-compose.prod.yml` — build de produção + serviço `migrate` one-shot antes do `app`.

## Arquitetura

**Stack:** Next.js 16 (App Router, React 19, Turbopack), Tailwind CSS v4, Prisma 6 + PostgreSQL. TypeScript estrito. Deploy alvo: Vercel + Postgres gerenciado (não configurado ainda); `docker-compose.yml` cobre o Postgres local.

**Fonte única de dados — `lib/concursos.ts`.** Array `concursos: Concurso[]` (Transpetro com `cargos`/`vagas`/`conteudo`/`gruposReserva`; os outros só resumo). `concursoDestaque` = 1º. Ordenação: `destaque` primeiro, depois por `dataProva ?? inscricoesAte`. FAQ, rótulos (`ufLabel`, `escolaridadeLabel`, `statusLabel`), `formatBRL`/`formatData` e a lógica de cotas (`vagasReservadas`, `filtrarVagas`) também vivem aqui. **Planos** ficam em `lib/planos.ts`. Ao sair um edital, editar só o objeto do concurso.

**Composição da página.** `app/page.tsx` (Server Component) lê `public/edital/<slug>/*.pdf` com `fs` → `docsPorConcurso`, e monta: `SiteNav` → `ConcursoExplorer` → `FeatureGrid` → `PlanosSection` → `FaqSection` → `SiteFooter`.

**`ConcursoExplorer` (client) é o núcleo.** Guarda `filtro` (`FiltroConcursos`) + `atual`. Renderiza `ConcursoFiltro` (faixa clara entre a nav e o banner: escolaridade/situação/salário mínimo + linha "N concursos para o seu perfil, salários de X a Y") → `ConcursoCarousel` (só com os concursos que passam no filtro, via `concursoAtendeFiltro`) → `VagasFiltro` + `ConteudoSection` + `EditalSection` do concurso atual. Trocar filtro reseta `atual` para 0; `atual` é clampado ao tamanho da lista filtrada. Helpers em `lib/concursos.ts`: `filtroConcursosVazio`, `concursoAtendeFiltro`, `resumoConcursos`, `opcoesSalarioMinimo`.

**`ConcursoCarousel`** (client): banner verde escuro `#062a1c`, compacto (~cabe acima da dobra junto com o topo do filtro), setas ‹ ›, dots, teclado ←/→. Slide `destaque` mostra `Countdown` + vagas/salário; slides `previsto` mostram situação.

**Filtro de vagas/cotas — `components/vagas-filtro.tsx`.** `filtrarVagas(concurso, filtro)` é função pura (sem rede). Se `concurso.vagas` está vazio → mostra `Teaser` "em breve". Cotas: negros 20% (Lei 12.990), PcD 5% (Decreto 9.508); indígena/LGBTQIA+ com `percentual: 0` + `nota`. `key={concurso.slug}` reseta o filtro ao trocar de concurso.

**`countdown.tsx`** usa `border-current/15 bg-current/10` para funcionar sobre fundo claro ou escuro.

**Fluxo de assinatura.** `assinar-form.tsx` (dentro de `planos-section.tsx`) → `POST /api/assinar` → `prisma.lead.upsert` com `plano` + `concursoSlug`. A rota **degrada sem banco** (`hasDatabase` em `lib/prisma.ts` → loga + 200). Mantenha esse comportamento.

**`EditalSection`** é client (dentro do explorer) e recebe `docs: string[]` (calculado no server em `app/page.tsx`). PDFs vivem em `public/edital/<slug>/` — nomes esperados em `DOCS_CATALOGO`. Ver `public/edital/transpetro-2026/LEIA-ME.md`.

**Prisma client** é singleton em `lib/prisma.ts`.

**Schema.** `prisma/schema.prisma`: `Lead` = intenção de assinatura (`email`, `nome`, `plano`, `concursoSlug`). Modelos `Cargo`/`Vaga`/`Topico`/`Questao`/`Simulado` ainda são só direção para fases futuras.

## Design (skill `design-taste-frontend` aplicada)

- **Fonte:** Geist / Geist Mono (`next/font/google`), variáveis `--font-geist-sans/mono`. Números com `font-mono tabular-nums`.
- **Ícones:** só `@phosphor-icons/react/dist/ssr/<Nome>` (import por ícone). **Não** desenhar `<svg>` à mão. **Sem emoji** na UI.
- **Sem em-dash (`—`) nem en-dash (`–`) em nada visível.** Só hífen `-`. (Regra dura da skill.)
- **Cor:** verde é o accent em superfícies claras; amarelo (`--accent`) **só** no banner escuro `#062a1c`. Uma cor de accent por superfície.
- **Raio:** cards `rounded-2xl` (16px), controles/botões `rounded-lg` (10px), pills `rounded-full`. Não misturar fora disso.
- **Movimento (MOTION 4):** `components/reveal.tsx` (`motion/react`, `whileInView` once) + crossfade do slide no carrossel. Tudo honra `useReducedMotion()`.
- **Listas longas:** a tabela de vagas mostra 6 linhas + botão "ver todas". Não repetir família de layout entre seções (carrossel / filtro / grid conteúdo / rows features / cards planos / accordion FAQ).
- **Imagem:** `next/image` com placeholder `picsum.photos` no slide em destaque (`remotePatterns` em `next.config.ts`). **TODO: trocar por foto real.**

## Convenções

- **Idioma:** toda a UI e os comentários de domínio em **português (pt-BR)**. Nomes de identificadores podem ser em português quando descrevem o domínio (`cargos`, `escolaridade`).
- **Cores:** use os tokens Tailwind do tema (`bg-brand`, `text-muted`, `border`, `bg-surface`, `bg-accent`) definidos em `app/globals.css` — não hardcode hex. Tema claro/escuro via `prefers-color-scheme`.
- **Disclaimer legal:** o rodapé deixa claro que a PetroPrep não tem vínculo com Petrobras/Transpetro/Cesgranrio. Não remova isso e não crie páginas que se passem por canais oficiais.
- **Regra de lint React:** não chamar `setState` de forma síncrona dentro de `useEffect` (a `eslint-config-next` barra). Ver o padrão em `countdown.tsx` (init lazy no `useState` + `suppressHydrationWarning`).
- **Aviso de hidratação `inmaintabuse="1"` no log do dev:** é injeção da extensão Claude-in-Chrome no `<body>`, não bug do código. Não aparece para usuário sem a extensão.
- **Portas:** app 3100, Postgres host 5433 (a 3000 está ocupada por outro projeto Docker na máquina).
- O bloco `BEGIN:nextjs-agent-rules` em `AGENTS.md` é regravado pelo `next dev` — commite junto, não tente removê-lo.
