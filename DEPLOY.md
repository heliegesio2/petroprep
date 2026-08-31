# Deploy

## Estado atual (staging, 2026-08-31)

**No ar:** `https://petroprep.com.br` e `https://www.petroprep.com.br`
(deploy de staging - conteúdo ainda raso, sem cobrança real, OAuth só para
usuários de teste/admin; ver "Antes de abrir ao público").

| Peça | Onde |
| --- | --- |
| App | Vercel, projeto `petroprep` (team `noname` / `noname-f269`), plano Hobby, região das funções `iad1` (EUA) |
| Repo | GitHub `heliegesio2/petroprep` (privado), branch `master` - push dispara deploy |
| Banco | Neon, projeto `petroprep-staging`, região `sa-east-1` (São Paulo), Postgres 17, DB `neondb` |
| Domínio | `petroprep.com.br` no Registro.br, DNS no modo básico: A `@` -> `216.198.79.1` (+ `www` mesmo IP, criado automático). SSL emitido pela Vercel. |
| Healthcheck | `curl https://petroprep.com.br/api/health` -> `{"ok":true,"db":true}` |

**Variáveis na Vercel** (Production + Preview): `DATABASE_URL` (Neon, endpoint
direto sem `-pooler`, `?sslmode=require`), `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL`
(`https://petroprep.com.br`), `GOOGLE_CLIENT_ID`/`SECRET`, `FACEBOOK_CLIENT_ID`/`SECRET`.
`MP_*` e `TIKTOK_*` ficam vazias (degradam). O arquivo local `.env.vercel`
(gitignored) foi usado só para o import inicial - pode apagar.

**OAuth já configurado para o domínio:**
- Google (console.cloud.google.com, projeto `petroprep`, cliente "PetroPrep Web"):
  origens JS `http://localhost:3100` + `https://petroprep.com.br`; redirect URIs
  para localhost, `petroprep.com.br` e `www.petroprep.com.br` (`/api/auth/google/callback`).
- Facebook (developers.facebook.com, app `PetroPrep` id `1733572357847574`, Login
  do Facebook): redirect URIs `https://petroprep.com.br` e `www` (`/api/auth/facebook/callback`);
  localhost é liberado automático no modo dev.

---

## Refazer do zero (runbook)

### 1. GitHub
Repo privado `petroprep`, `git remote add origin ...`, `git push -u origin master`.
`.env*` está no `.gitignore` - nenhum segredo vai pro repo.

### 2. Banco (Neon)
Criar projeto em https://neon.tech, copiar a connection string. Aplicar schema +
seed uma vez, do terminal (use o endpoint **sem `-pooler`** e só `?sslmode=require`):

```bash
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npx prisma db push
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npx prisma db seed
```

### 3. Vercel
Import do repo GitHub. Nome `petroprep`. Framework Next.js (autodetectado), build
padrão. **Environment Variables** (aba Settings, NÃO cole `.env` no campo Key da
tela de import - dá erro de parsing; use o botão **"Import .env"**):

| Variável | Tipo | Valor |
| --- | --- | --- |
| `DATABASE_URL` | Secret | string do Neon |
| `AUTH_SECRET` | Secret | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXT_PUBLIC_SITE_URL` | **Config** | `https://petroprep.com.br` (sem barra no fim) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Secret | do `.env` local |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Secret | do `.env` local |
| `MP_*`, `TIKTOK_*` | - | deixar de fora |

`NEXT_PUBLIC_SITE_URL` precisa ser tipo **Config** (o prefixo `NEXT_PUBLIC_` expõe
ao navegador; a Vercel reclama se for Secret).

### 4. Domínio (Registro.br, modo básico)
DNS -> **Configurar endereçamento** -> "Endereço do site" = `216.198.79.1` (IP da
Vercel; o `www` é criado com o mesmo IP). Salvar. Propaga em ~15 min a 2 h; a
Vercel emite o SSL sozinha. Em Vercel -> Settings -> Domains: adicionar
`petroprep.com.br` como **Connect to environment / Production** (não redirecionar
para www - o modo básico do Registro.br não faz CNAME no apex).

### 5. OAuth redirect URIs
Adicionar nos consoles (Google e Facebook) as URIs de `https://petroprep.com.br` e
`https://www.petroprep.com.br` + `/api/auth/<provedor>/callback`. Google: também a
origem JS `https://petroprep.com.br`.

### 6. Conferir
`curl https://petroprep.com.br/api/health` -> `{"ok":true,"db":true}`. Home,
`/simulado` (Diagnóstico abre), `/entrar` com os 2 botões sociais.

---

## Antes de abrir ao público (produção)

- **Mercado Pago**: chaves de produção em `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET`.
- **Google OAuth**: publicar a tela de consentimento (Google Auth Platform ->
  Público-alvo -> "Publicar app"). Sem verificação: teto ~100 usuários; com
  verificação: política de privacidade + verificação de domínio. Hoje só
  `heliegesio@gmail.com` (usuário de teste) loga.
- **Facebook OAuth**: sair do modo Desenvolvimento -> App Review + verificação de
  negócio para a permissão `email`. Hoje só admins/testadores do app logam.
- **Região**: plano Vercel pago + funções em `gru1` (São Paulo), Neon já está em SP.
- **Prisma / conexões**: trocar `DATABASE_URL` para o endpoint **pooled** do Neon
  (`-pooler`, com `?sslmode=require&pgbouncer=true`), adicionar `directUrl` no
  schema apontando pro não-pooled, e migrar de `prisma db push` para
  `prisma migrate deploy` com uma migration inicial commitada em `prisma/migrations/`.
- **Canônico**: definir se `petroprep.com.br` ou `www` é o principal e redirecionar
  o outro (Vercel -> Domains -> Edit -> Redirect).
- **Limpeza**: o cliente OAuth do Google tem 2 client secrets; desativar o não usado.
- `next.config.ts` já desliga `output: "standalone"` quando `process.env.VERCEL`
  está setado (senão o build da Vercel quebra com ENOENT `next-server.js.nft.json`).
