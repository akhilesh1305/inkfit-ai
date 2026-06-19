# InkFit AI — Content Studio

AI-powered content platform for blogs, LinkedIn, SEO, carousels, and marketing teams.

## Quick start (local)

```bash
npm install
docker compose up -d
cp .env.example .env
# Edit .env — set AUTH_SECRET and API keys
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to production (Vercel)

### 1. Database (PostgreSQL)

SQLite does not work on serverless hosts. Use one of:

| Provider | Free tier | Notes |
|----------|-----------|-------|
| [Neon](https://neon.tech) | Yes | Recommended — copy pooled + direct URLs |
| [Supabase](https://supabase.com) | Yes | Use connection pooler URL |
| [Vercel Postgres](https://vercel.com/storage/postgres) | Yes | Native Vercel integration |

Set in Vercel environment variables:

- `DATABASE_URL` — pooled connection string
- `DIRECT_URL` — direct connection (migrations / `db push`)

### 2. Required environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DIRECT_URL` | Direct PostgreSQL URL (Neon/Supabase) |
| `AUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Live URL, e.g. `https://your-domain.vercel.app` |
| `OPENAI_API_KEY` or `GEMINI_API_KEY` | At least one for AI generation |

Optional (billing): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_CREATOR`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_AGENCY`. See `.env.example`.

### 3. Deploy

```bash
git init
git add .
git commit -m "Initial production deploy"
npx vercel login
npx vercel --prod
```

Or connect the GitHub repo in the [Vercel dashboard](https://vercel.com/new) for automatic deploys on push.

### 4. Custom domain

In Vercel → Project → Settings → Domains, add your domain. Update `NEXT_PUBLIC_APP_URL` to match.

### 5. Stripe webhooks (when live billing)

Point Stripe webhook to:

```
https://your-domain.com/api/billing/webhook
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run vercel-build` | Vercel build (includes `prisma db push`) |
| `npm run db:push` | Sync Prisma schema to database |
| `npm run db:studio` | Prisma Studio GUI |

## Stack

Next.js 15 · React 19 · Prisma · PostgreSQL · Tailwind CSS · Framer Motion · Recharts
