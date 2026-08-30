# Deploy

Alvo: **Vercel** (app) + **Neon** (Postgres). O deploy de produção ainda não está
liberado - ver "Antes de abrir ao público" no fim.

## Staging (primeiro deploy)

### 1. GitHub

Repositório **privado** `petroprep`. No projeto:

```bash
git remote add origin git@github.com:<voce>/petroprep.git
git push -u origin master
```

`.env` está no `.gitignore` - nenhum segredo vai pro repo.

### 2. Banco (Neon)

1. Criar projeto em https://neon.tech (região mais próxima da que a Vercel usar).
2. Copiar a **connection string** (inclui `?sslmode=require`).
3. Aplicar o schema e popular, uma vez, do seu terminal:

```bash
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npx prisma db push
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npx prisma db seed
```

O seed é idempotente (41 questões + 5 simulados).

### 3. Vercel

1. **Add New Project** -> importar o repo do GitHub. Nome: `petroprep`
   (define `https://petroprep.vercel.app`).
2. Framework **Next.js** (autodetectado). Build e install: padrão.
3. **Environment Variables** (Production + Preview):

   | Variável | Valor |
   | --- | --- |
   | `DATABASE_URL` | string do Neon |
   | `AUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `NEXT_PUBLIC_SITE_URL` | `https://petroprep.vercel.app` (sem barra no fim) |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | as mesmas do `.env` local |
   | `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | as mesmas do `.env` local |
   | `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET` | vazio (checkout degrada) |
   | `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | vazio |

4. **Deploy**.

### 4. OAuth - redirect URIs de staging

- **Google** (console.cloud.google.com -> projeto PetroPrep -> Clientes -> PetroPrep Web):
  - URI de redirecionamento: `https://petroprep.vercel.app/api/auth/google/callback`
  - Origem JavaScript: `https://petroprep.vercel.app`
- **Facebook** (developers.facebook.com -> app PetroPrep -> Login do Facebook -> Configurações):
  - URI de redirecionamento válido: `https://petroprep.vercel.app/api/auth/facebook/callback`

### 5. Conferir

```bash
curl https://petroprep.vercel.app/api/health   # {"ok":true,"db":true,...}
```

Depois: home carrega, `/cadastro` cria conta, login Google e Facebook na URL de
staging caem logado em `/minha-conta`, simulado Diagnóstico roda de ponta a ponta.

### 6. (Opcional) Subdomínio

`staging.petroprep.com.br` -> CNAME para `cname.vercel-dns.com`; adicionar em
Project -> Domains. Repetir os passos 3 (`NEXT_PUBLIC_SITE_URL`) e 4 com essa URL.

---

## Antes de abrir ao público (produção)

- **Mercado Pago**: chaves de produção em `MP_ACCESS_TOKEN` / `MP_WEBHOOK_SECRET`;
  `notification_url` do webhook aponta para a URL pública automaticamente.
- **Google OAuth**: publicar a tela de consentimento (sem verificação: teto ~100
  usuários; com verificação: política de privacidade + verificação de domínio).
- **Facebook OAuth**: App Review + verificação de negócio para a permissão `email`
  (até lá, só admins/testadores recebem e-mail).
- **Região**: plano Vercel pago + `gru1` (São Paulo) e Neon na mesma região.
- **Prisma**: endpoint *pooled* do Neon em `DATABASE_URL`, `directUrl` no schema
  apontando pro não-pooled, e trocar `prisma db push` por `prisma migrate deploy`
  com uma migration inicial commitada em `prisma/migrations/`.
- **Domínio**: apontar `petroprep.com.br` (apex) para a Vercel (registro A/ALIAS)
  e `www` via CNAME.
