# InkFit AI — Production Runbook

Operational guide for deploying, monitoring, and recovering the production app at [inkfit-ai-livid.vercel.app](https://inkfit-ai-livid.vercel.app).

## Pre-deploy checklist

- [ ] All env vars set in Vercel (see below)
- [ ] `npx prisma db push` run against production DB after schema changes
- [ ] Stripe webhook endpoint points to `/api/stripe/webhook` with `STRIPE_WEBHOOK_SECRET`
- [ ] `AUTH_SECRET` set (no dev fallback in production)
- [ ] `ADMIN_EMAILS` configured for super-admin access
- [ ] `STRIPE_SECRET_KEY` set (`BILLING_DEMO_MODE` must **not** be enabled in production)
- [ ] Smoke test: register → onboarding → AI Employee run → billing page loads

## Required environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `AUTH_SECRET` | Session signing (32+ random bytes) |
| `OPENAI_API_KEY` / `GEMINI_API_KEY` | AI providers |
| `STRIPE_SECRET_KEY` | Live billing |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_PRICE_CREATOR` / `PRO` / `AGENCY` | Subscription price IDs |
| `STRIPE_PRICE_CREDIT_PACK` | One-time 500-credit pack (₹199) |
| `NEXT_PUBLIC_SENTRY_DSN` | Error tracking (optional but recommended) |
| `ADMIN_EMAILS` | Comma-separated super-admin emails |

## Deploy steps

1. Merge to `main` (or push branch connected to Vercel production).
2. Wait for Vercel build; confirm no TypeScript errors.
3. If `prisma/schema.prisma` changed: `npx prisma db push` on production DB.
4. Verify health:
   - `GET /api/system/status` returns `demoMode: false` in production
   - Login works
   - Stripe test checkout (or production) completes and webhook fires once (check `StripeWebhookEvent` dedupe)

## Rollback

1. In Vercel → Deployments → select last known-good deployment → **Promote to Production**.
2. If a bad migration was applied, restore DB from backup before re-deploying.
3. Post in status channel if customer-facing incident.

## Stripe webhook test

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

Confirm: user plan updates (subscription) or `bonusCredits` increments (credit pack).

## Monitoring

- **Sentry**: alert when error rate > 1% over 15 minutes (`NEXT_PUBLIC_SENTRY_DSN`).
- **Vercel Analytics**: Web Vitals on landing and `/dashboard`.
- **Credits**: watch for spike in 402 responses (billing misconfiguration).

## Incident contacts

| Role | Action |
|------|--------|
| On-call engineer | First responder, rollback, hotfix |
| Founder / product | Customer comms, billing disputes |
| Stripe dashboard | Refunds, subscription fixes |

## Database backup

- Enable automated backups on your Postgres provider (Neon/Supabase/Railway).
- Before risky migrations, take a manual snapshot.

## Common issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Free upgrades in prod | Missing `STRIPE_SECRET_KEY` | Set Stripe keys; never set `BILLING_DEMO_MODE=true` in prod |
| Double plan upgrades | Webhook retry | `StripeWebhookEvent` dedupe — verify table exists |
| 402 on all AI routes | Credit limit / missing billing context | Check `CreditUsage`, workspace billing owner |
| SVG logo not saving | Security filter | Expected — use PNG/JPEG/WebP only |

## Dry-run (staging)

1. Clone production env to preview with test Stripe keys.
2. Full golden path: signup → employee → publish CTA → upgrade → credit pack.
3. Run `npm run build` locally before merge.
