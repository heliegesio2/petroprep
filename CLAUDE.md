# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## O que é este projeto

**Plataforma multi-concurso** de preparação (simulados, conteúdo, buscador de vagas/cotas). O **Transpetro 2026** (banca Cesgranrio, inscrições até 14/09/2026, prova 29/11/2026) é o concurso em **destaque**; os demais entram como cards de resumo. Nome "PetroPrep" é provisório — deve mudar (ver plano `~/.claude/plans/abre-o-naveg-*.md`).

**Fase atual:** landing (carrossel + filtro de vagas) **+ cadastro/login real + simulados no Postgres + checkout Mercado Pago**. O conteúdo programático da Transpetro tem resumo real por disciplina e progresso do candidato (localStorage).

**Monetização:** 2 planos pagamento único - R$ 50 (só Transpetro, até a prova) e R$ 80 (todos os concursos). Sem tier gratuito. O botão "Assinar": deslogado leva a `/cadastro`; logado chama `POST /api/checkout` → preferência Mercado Pago → `init_point`. Sem `MP_ACCESS_TOKEN`, degrada ("checkout em configuração", marca `planoStatus=pendente`). `Lead` (`/api/assinar`) continua para captação pré-cadastro.

Contexto factual: vagas/salários/datas são **estimativas** de imprensa + editais anteriores. Só a Transpetro tem edital publicado. Sempre com selo "confira a fonte oficial".

## Comandos

**Docker é o caminho recomendado** (evita as quirks de file-watching do Next no Windows quando o projeto está direto na raiz `C:\`):

```bash
docker compose up --build   # app (hot reload) + Postgres → http://localhost:3100
docker compose down [-v]     # para (-v apaga o banco)
docker compose -f docker-compose.prod.yml up --build   # testa a imagem de deploy
```

O serviço `app` (compose dev) roda `prisma db push` → `prisma db seed` (popula questões/simulados, idempotente) → `next dev -H 0.0.0.0 --webpack`. **`--webpack` + `WATCHPACK_POLLING=true` são obrigatórios**: o Turbopack não detecta mudanças no bind mount do Windows (o watcher do Webpack com polling detecta). Para edição intensa, `npm run dev` no host é mais rápido. Depois de mudar arquivo, se o container não recompilar: `docker compose restart app`.

Node direto:

```bash
npm run dev            # Turbopack em :3100 (emite "Watchpack Error ... C:\pagefile.sys" — ruído inofensivo)
npm run build          # prisma generate + next build (output: standalone)
npm run lint           # ESLint (eslint-config-next). Deve passar limpo.
npm run db:push        # aplica prisma/schema.prisma (dev, sem migration)
npm run db:seed        # popula banco de questões + simulados (prisma/seed.ts, idempotente)
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

**Fonte única de dados - `lib/concursos.ts`.** Array `concursos: Concurso[]` (Transpetro com `cargos`/`vagas`/`conteudo`/`gruposReserva`; os outros só resumo). `concursoDestaque` = 1º. Ordenação: `destaque` primeiro, depois por `dataProva ?? inscricoesAte`. FAQ, rótulos (`escolaridadeLabel`, `editalLabel`), `formatBRL`/`formatData` e a lógica de cotas (`vagasReservadas`, `filtrarVagas`) também vivem aqui. **Planos** ficam em `lib/planos.ts` (`planoValidoAte` calcula até quando o acesso vale a partir da `dataProva` dos concursos do plano). Ao sair um edital, editar só o objeto do concurso.

**Transpetro = 4 editais.** `Cargo.edital: EditalTranspetro` (`mar-guarnicao|mar-oficiais|terra-medio|terra-superior`). `Vaga` tem `polo` (não `uf`) + `imediatas` + `cadastroReserva`. `filtrarVagas` filtra por escolaridade/área/polo/edital; `editaisDoConcurso` e `polosDoConcurso` alimentam os selects. Cargos são lista parcial ("principais"), sempre com disclaimer.

**Rotas.** Route groups: `app/(auth)/` (`/cadastro`, `/entrar` - layout centrado) e `app/(site)/` (`SiteNav` + `main` + `SiteFooter`). `app/(site)/page.tsx` (server) lê `public/edital/<slug>/*.pdf` e `lerSessao()`, monta `ConcursoExplorer` → `FeatureGrid` → `PlanosSection` (recebe `logado`) → `FaqSection`. Fora do grupo: `/minha-conta`, `/simulado`, `/simulado/[slug]`, `/obrigado`.

**Auth (`lib/auth.ts`).** Custom leve: `bcryptjs` (hash) + `jose` (JWT HS256 em cookie httpOnly `petroprep_sessao`, 30 dias). `AUTH_SECRET` obrigatório em produção (fallback inseguro loga aviso). `lerSessao()` (só cookie), `usuarioAtual()` (busca no banco), `exigirLogin(next)` (redirect p/ `/entrar`), `planoAtivo(u)`. `Usuario.email` e `Usuario.senhaHash` são **opcionais** (contas sociais).

**Login social (`lib/oauth.ts`).** OAuth2 authorization-code + PKCE (S256) na mão p/ Google, Facebook, TikTok, reaproveitando o cookie de sessão. `GET /api/auth/[provedor]` gera state+verifier em cookies curtos (`oauth_state/verifier/next`, path `/api/auth`) e redireciona ao provedor; `GET /api/auth/[provedor]/callback` troca o código, então: acha `ContaOAuth` por `(provedor, provedorUserId)` → senão vincula a `Usuario` com e-mail verificado igual → senão cria conta nova (`senhaHash: null`). **TikTok não dá e-mail**: conta criada sem e-mail, `/minha-conta` mostra `ContaEmailForm` → `POST /api/conta/email`. `provedorConfigurado(p)` = há as 2 env vars; sem elas o botão some (`provedoresConfigurados()` no server component). `GOOGLE_CLIENT_ID/SECRET`, `FACEBOOK_CLIENT_ID/SECRET`, `TIKTOK_CLIENT_KEY/SECRET` no `.env`.

**Simulados (`lib/simulado.ts` + `prisma/seed.ts`).** `carregarSimulado(slug)` traz questões ordenadas sem gabarito; `podeAcessar` = `gratuito || planoAtivo`. `Simulado` "diagnostico" é `gratuito` (abre sem login; tentativa anônima é vinculada à conta no login via cookie `sim_anon` - `lib/tentativas-anonimas.ts`, chamado em `criarSessao`). Player estilo Duolingo (`SimuladoPlayer`, client, `fixed inset-0`): uma questão por vez, "Verificar" chama `POST /api/simulado/[slug]/responder` (corrige e devolve o gabarito só depois de respondida), feedback com estrela/carinha; "Continuar"; auto-envio no zero do cronômetro. `POST .../submeter` recorrige tudo → `RespostaSimulado` + `Tentativa.nota/finalizadoEm` → página relê com `?r=` → `SimuladoResultado` (rosca conic-gradient geral + por matéria, "Onde focar", dicas). Lista `/simulado` marca os feitos + "Refazer". Histórico e ranking em `/minha-conta` e `/ranking`.

**Ranking (`lib/ranking.ts`).** Pontos = acertos da MELHOR tentativa de cada simulado (sem peso por disciplina ainda). `/ranking` (top 20 + sua linha), `GET /api/ranking/eu` alimenta o snippet no `AccountMenu`. Nome curto "Fulano S.".

**Admin (`/admin`).** `ehAdmin(u)` = e-mail em `ADMIN_EMAIL` (default `heliegesio@gmail.com`); não-admin → `notFound()`. Lista usuários, define plano/situação/validade por usuário (`PATCH /api/admin/usuarios/[id]`), cria usuário (`POST /api/admin/usuarios`). Link no `AccountMenu` só p/ admin.

**Guia de concurso no banco (`lib/concurso-guia.ts` + `prisma/seed-concursos.ts`).** Modelos `Concurso`, `CargoConcurso`, `MateriaConcurso`, `ItemEstudo` + `Simulado.concursoId`. Populados pelo seed a partir de `prisma/dados/<slug>/` (JSON extraído do edital pelo "Claude Desktop", ver `INTEGRACAO-PETROPREP.md`). Hoje: `ses-to-2026` (Saúde Tocantins, FGV: 72 cargos, 8 matérias, ~3,2k itens; só 102 itens com resumo - piloto). O carrossel da landing continua em `lib/concursos.ts`; a entrada `ses-to-2026` tem `linkGuia` → `/concurso/ses-to-2026`. Rotas: `/concurso/[slug]` (hero + `CargoLista` client), `/vaga/[cargo]`, `/vaga/[cargo]/[item]`, `/estudo`, `/estudo/[materia]`, `/estudo/[materia]/[item]` (`ItemEstudoView`, com "em preparação" + disclaimer IA). `MateriaConcurso.simuladoSlug` liga a matéria a um `Simulado` ("Fazer teste"). Testes do ses-to: `prisma/seed-ses-to-testes.ts` (Português/Matemática reaproveitam `q-pt-*`/`q-mat-*`; Informática, História/Geografia TO e Legislação do SUS têm 18 questões inéditas). `limpar()` no seed troca em-dash de conteúdo importado por hífen. **Transpetro ainda não tem guia** (só `lib/concursos.ts`). **Prod: mudança de schema exige `prisma db push` no Neon + rodar o seed.**

**PWA / offline (`public/sw.js`, `lib/offline-db.ts`, `next.config.ts`).** `experimental.useOffline` (hook `useOffline` no `OfflineBanner`). SW hand-rolled (VERSION-ado): navegação = rede→cache→`/offline`; estáticos = SWR; `/api/*` e `/minha-conta` `/admin` nunca cacheiam. `manifest.ts` + ícones via `ImageResponse` (`app/icons/[spec]`, `app/apple-icon`). **Fase 2 - simulados offline:** `GET /api/simulado/[slug]/pacote` baixa o simulado COM gabarito (só plano ativo; Diagnóstico não), guardado no IndexedDB (`lib/offline-db.ts`). `/estudar-offline` (fora do route group, client puro, lista↔jogo por estado - sem navegação) roda o `SimuladoPlayer` com props `corrigir`/`aoFinalizar`/`aoSair` (correção 100% local). Tentativas offline entram na fila `pendentes`; `SyncOffline` (no layout) sobe via `POST .../importar` (idempotente por `usuario+simulado+iniciadoEm`, recorrige no servidor) no load e no evento `online`. Progresso do conteúdo segue em localStorage (dado minúsculo).

**`ConcursoExplorer` (client) é o núcleo.** Guarda `filtro` (`FiltroConcursos`) + `atual`. Renderiza `ConcursoFiltro` (faixa clara entre a nav e o banner: escolaridade/situação/salário mínimo + linha "N concursos para o seu perfil, salários de X a Y") → `ConcursoCarousel` (só com os concursos que passam no filtro, via `concursoAtendeFiltro`) → `VagasFiltro` + `ConteudoSection` + `EditalSection` do concurso atual. Trocar filtro reseta `atual` para 0; `atual` é clampado ao tamanho da lista filtrada. Helpers em `lib/concursos.ts`: `filtroConcursosVazio`, `concursoAtendeFiltro`, `resumoConcursos`, `opcoesSalarioMinimo`.

**`ConcursoCarousel`** (client): banner verde escuro `#062a1c`, compacto (~cabe acima da dobra junto com o topo do filtro), setas ‹ ›, dots, teclado ←/→. Slide `destaque` mostra `Countdown` + vagas/salário; slides `previsto` mostram situação.

**Filtro de vagas/cotas — `components/vagas-filtro.tsx`.** `filtrarVagas(concurso, filtro)` é função pura (sem rede). Se `concurso.vagas` está vazio → mostra `Teaser` "em breve". Cotas: negros 20% (Lei 12.990), PcD 5% (Decreto 9.508); indígena/LGBTQIA+ com `percentual: 0` + `nota`. `key={concurso.slug}` reseta o filtro ao trocar de concurso.

**`countdown.tsx`** usa `border-current/15 bg-current/10` para funcionar sobre fundo claro ou escuro.

**Checkout (`lib/mercadopago.ts`).** `mpConfigurado` = há `MP_ACCESS_TOKEN`. `criarPreferencia` (item + `back_urls` p/ `/obrigado` + `external_reference` = `usuario.id` + `notification_url`). `POST /api/checkout` exige login, grava `planoStatus=pendente` + `mpPreferenceId`, devolve `{ initPoint }` (ou `{ configurando: true }` sem token). `POST /api/webhook/mercadopago` valida `x-signature` (`validarAssinaturaWebhook`, manifest `id:...;request-id:...;ts:...;`), consulta o pagamento, `approved` → `planoStatus=ativo` + `planoAte` + `mpPaymentId`. Tudo **degrada sem banco/token** - mantenha.

**`EditalSection`** é client (dentro do explorer) e recebe `docs: string[]` (calculado no server em `app/page.tsx`). PDFs vivem em `public/edital/<slug>/` — nomes esperados em `DOCS_CATALOGO`. Ver `public/edital/transpetro-2026/LEIA-ME.md`.

**Prisma client** é singleton em `lib/prisma.ts`.

**Schema.** `prisma/schema.prisma`: `Usuario` (`email?`/`senhaHash?` opcionais + plano: `plano`, `planoStatus` nenhum|pendente|ativo, `planoAte`, `mpPreferenceId`, `mpPaymentId`), `ContaOAuth` (`provedor`, `provedorUserId`, `@@unique([provedor, provedorUserId])`), `Lead` (captação pré-cadastro), `Questao` (`alternativas Json`, `correta Int`, `comentario`), `Simulado` + `SimuladoQuestao` (m2m ordenada), `Tentativa` (`usuarioId?`, `nota`, `finalizadoEm`) + `RespostaSimulado`. `Cargo`/`Vaga`/`Topico` seguem só como direção para migrar os dados estáticos depois.

## Design (skill `design-taste-frontend` aplicada)

- **Fonte:** Geist / Geist Mono (`next/font/google`), variáveis `--font-geist-sans/mono`. Números com `font-mono tabular-nums`.
- **Ícones:** só do barrel `@phosphor-icons/react/dist/ssr` (import por subpath `/dist/ssr/<Nome>` **quebra no webpack do Docker**). Sufixo `Icon`. **Não** desenhar `<svg>` à mão. **Sem emoji** na UI.
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
- **Regra de lint React (`eslint-config-next`, dura):** nada de `setState` síncrono em `useEffect`, `Date.now()`/impuras no corpo do render, nem escrever `ref.current` no render. Padrões: `countdown.tsx` (init lazy + `suppressHydrationWarning`), `conteudo-progresso.tsx` (`useSyncExternalStore` p/ ler localStorage), `simulado-player.tsx` (`deadlineRef` setado dentro do effect do `setInterval`).
- **Aviso de hidratação `inmaintabuse="1"` no log do dev:** é injeção da extensão Claude-in-Chrome no `<body>`, não bug do código. Não aparece para usuário sem a extensão.
- **Portas:** app 3100, Postgres host **5434** (3000 ocupada por outro projeto Docker; 5432 e 5433 ocupadas por um PostgreSQL 14 nativo do Windows - conexão a `localhost` cairia nele e falharia auth).
- O bloco `BEGIN:nextjs-agent-rules` em `AGENTS.md` é regravado pelo `next dev` — commite junto, não tente removê-lo.
