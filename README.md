# PetroPrep

Plataforma **multi-concurso** de preparação: simulados no estilo da banca,
conteúdo programático por cargo e buscador de vagas e cotas por perfil.
**Transpetro 2026** (Cesgranrio) é o concurso em destaque; outros entram como
cards de resumo.

**Status:** carrossel de concursos + filtro de vagas/cotas (Transpetro com os 4
editais reais) + **cadastro/login** (e-mail/senha + Google/Facebook/TikTok) +
**simulados no Postgres** (cronômetro, correção comentada, histórico) + **checkout
Mercado Pago** (sandbox). Conteúdo programático da Transpetro com resumo real por
disciplina e barra de progresso.

> Vagas, salários e datas são **estimativas** montadas a partir da imprensa
> especializada e de editais anteriores — confira sempre a fonte oficial.
> Centralizadas em `lib/concursos.ts`. O nome "PetroPrep" é provisório.

## Planos

| Plano | Preço | Acesso |
| --- | --- | --- |
| Transpetro | R$ 50 (único) | todo o material da Transpetro, até o dia da prova |
| Completo | R$ 80 (único) | todos os concursos da plataforma |

O botão "Assinar": deslogado leva ao cadastro; logado abre o checkout do
**Mercado Pago** (`POST /api/checkout` → preferência → `init_point`). Sem
`MP_ACCESS_TOKEN` no `.env`, degrada com aviso e marca o plano como pendente.
O webhook `/api/webhook/mercadopago` ativa o plano quando o pagamento é aprovado.

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
`localhost:5434`); no start o serviço roda `prisma db push` + `prisma db seed`
(popula o banco de questões e os simulados).

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

Sem `DATABASE_URL` a landing funciona: as rotas de conta/checkout degradam com
mensagem amigável e a lista de simulados avisa que o banco não está configurado.
Para o fluxo completo, suba um Postgres, `npm run db:push` e `npm run db:seed`.
Defina `AUTH_SECRET` (aleatório); para o pagamento, as chaves de TESTE do Mercado
Pago; para o login social, `GOOGLE_/FACEBOOK_/TIKTOK_` client id + secret (cada
provedor some da tela se as chaves dele faltarem). Redirect URIs a cadastrar:
`http://localhost:3100/api/auth/{google,facebook,tiktok}/callback`.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Desenvolvimento (Turbopack) na porta 3100 |
| `npm run build` | `prisma generate` + build de produção |
| `npm run lint` | ESLint |
| `npm run db:push` | Aplicar schema no banco (dev) |
| `npm run db:seed` | Popular questões + simulados (idempotente) |
| `npm run db:studio` | Prisma Studio |

## Estrutura

```
app/
  (site)/                  # nav + footer: home, /simulado, /minha-conta, /obrigado
  (auth)/                  # layout centrado: /cadastro, /entrar
  api/
    cadastro|login|logout  # auth e-mail/senha (bcrypt + JWT em cookie)
    auth/[provedor][/callback]  # login social OAuth2 + PKCE (Google/Facebook/TikTok)
    conta/email            # define e-mail (contas via TikTok)
    checkout               # cria preferência Mercado Pago (exige login)
    webhook/mercadopago    # ativa o plano quando o pagamento é aprovado
    simulado/[slug]/submeter  # corrige a tentativa no servidor
components/
  concurso-explorer.tsx    # CLIENT: estado do concurso selecionado
  concurso-carousel.tsx    # banner em carrossel (setas, dots, teclado)
  vagas-filtro.tsx         # filtro por edital/polo/escolaridade/cota
  conteudo-progresso.tsx   # CLIENT: resumo por disciplina + "já estudei"
  simulado-player.tsx / simulado-resultado.tsx
  planos-section.tsx + assinar-form.tsx
lib/
  concursos.ts             # FONTE ÚNICA: concursos, cargos, vagas, cotas, FAQ
  planos.ts                # os 2 planos + planoValidoAte
  auth.ts / oauth.ts / simulado.ts / mercadopago.ts
  prisma.ts                # Prisma Client singleton
prisma/seed.ts             # banco de questões + simulados
public/edital/<slug>/      # PDFs por concurso (ver LEIA-ME.md dentro)
```

---

Iniciativa independente de preparação para concursos, **sem vínculo** com a
Petrobras, a Transpetro, a Cesgranrio ou qualquer órgão público.
