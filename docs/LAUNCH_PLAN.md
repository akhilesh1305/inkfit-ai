# InkFit AI — 30-Day Launch Plan

**Goal:** Achieve product-market fit signals and production readiness for the first **1,000 paying customers**.  
**Based on:** [INKFIT_AI_MASTER_AUDIT.md](./INKFIT_AI_MASTER_AUDIT.md) and companion audit reports.  
**Current readiness:** 4/10 → **Target after 30 days:** 7.5/10  
**Planning horizon:** 4 weeks (30 days)

---

## North Star Metrics (Day 30)

| Metric | Target | Why |
|--------|--------|-----|
| Paid conversion (free → paid) | ≥ 8% of activated users | PMF signal for INR SaaS |
| Activation (completes AI Employee run) | ≥ 40% of signups | Flagship value delivered |
| D7 retention | ≥ 25% | Users return after first session |
| Revenue leak incidents | 0 | No unauthenticated AI / demo checkout |
| Support tickets / billing dispute | < 2% of paid users | Fair credit charging |
| P0 security open items | 0 | Safe for paying customers |

---

## Priority Framework

Tasks are ordered within each week by:

1. **Revenue** — stop leaks, align pricing, drive upgrades  
2. **User Retention** — trust, fair billing, real data, return visits  
3. **Activation** — time-to-value, golden path, onboarding  
4. **Scalability** — indexes, jobs, performance  
5. **Security** — RBAC, secrets, rate limits, tenant isolation  

---

## Week 1 — Stop the Bleeding (Revenue + Critical Security)

**Theme:** Close every path where InkFit pays for AI or gives away paid plans without payment.  
**Exit criteria:** No unauthenticated AI spend; Stripe required in production; billing exploits patched.

### Task 1.1 — Gate or remove public `/api/demo`

| Field | Detail |
|-------|--------|
| **Priority** | Revenue · Security |
| **Impact** | Critical |
| **Difficulty** | Low |
| **Time** | 2–4 hours |
| **Why it matters** | Unauthenticated users can trigger live OpenAI/Gemini calls today. At 1,000 users with any bot traffic, COGS can exceed MRR before a single conversion. |

**Actions:** Require auth + `gateCredits("content_generation")` OR replace landing demo with static/cached samples; remove from `middleware.ts` public allowlist.

---

### Task 1.2 — Block demo checkout in production

| Field | Detail |
|-------|--------|
| **Priority** | Revenue |
| **Impact** | Critical |
| **Difficulty** | Low |
| **Time** | 1–2 hours |
| **Why it matters** | If `STRIPE_SECRET_KEY` is unset, `applyDemoCheckout()` grants Creator/Pro/Agency instantly. One misconfigured Vercel deploy = 100% revenue loss. |

**Actions:** Return 503 when Stripe unset in `NODE_ENV=production`; allow demo mode only with explicit `BILLING_DEMO_MODE=true` for staging.

---

### Task 1.3 — Fix workflow billing bypass

| Field | Detail |
|-------|--------|
| **Priority** | Revenue |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 4–6 hours |
| **Why it matters** | Workspace members run multi-step AI workflows billed to their own free plan, not the paying owner. Teams avoid upgrading. |

**Actions:** Route `workflow-executor.ts` through `resolveBillingContext()` + `gateCredits` per node.

---

### Task 1.4 — Gate attribution AI insights

| Field | Detail |
|-------|--------|
| **Priority** | Revenue |
| **Impact** | High |
| **Difficulty** | Low |
| **Time** | 2–3 hours |
| **Why it matters** | `/api/attribution` triggers strategist LLM calls on refresh with no credit check — ongoing COGS leak for every logged-in user. |

**Actions:** Add `gateCredits("content_generation")` or new `analytics_insight` action before `generateAttributionInsights`.

---

### Task 1.5 — Configure Stripe production + webhook idempotency

| Field | Detail |
|-------|--------|
| **Priority** | Revenue |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 6–8 hours |
| **Why it matters** | Without live Stripe + idempotent webhooks, upgrades fail silently or double-apply on retry — lost revenue and billing disputes. |

**Actions:** Set all Stripe env vars in Vercel; add `StripeWebhookEvent` table; dedupe on `event.id`; smoke-test checkout → webhook → plan sync.

---

### Task 1.6 — Remove hardcoded auth secret fallbacks

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | Critical |
| **Difficulty** | Low |
| **Time** | 2–3 hours |
| **Why it matters** | `"inkfit-dev-secret-change-in-production"` in `middleware.ts`, `auth.ts`, and OAuth state allows session forgery if production env is misconfigured. |

**Actions:** Fail fast at boot when `AUTH_SECRET` missing in production; document in `.env.example`.

---

### Task 1.7 — Disable dev auto-super-admin outside local dev

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | Critical |
| **Difficulty** | Low |
| **Time** | 1–2 hours |
| **Why it matters** | Staging/preview deploys promote every user to `super_admin` — full platform compromise during beta testing. |

**Actions:** Restrict `loadPlatformRole()` auto-promotion to `NODE_ENV=development` only; require `ADMIN_EMAILS` in staging.

---

### Task 1.8 — Consolidate plan limits to single source

| Field | Detail |
|-------|--------|
| **Priority** | Revenue |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 2–3 hours |
| **Why it matters** | Three config sources (`types.ts`, `billing-plans.ts`, `credits.ts`) can drift — users see one limit, get enforced another. |

**Actions:** Delete `CREDIT_LIMITS` duplicate; `billing-plans.ts` becomes sole enforcement source.

---

### Week 1 Summary

| Priority area | Tasks | Est. total |
|---------------|-------|------------|
| Revenue | 1.1–1.5, 1.8 | ~20–26 hrs |
| Security | 1.6–1.7 | ~3–5 hrs |
| **Week total** | **8 tasks** | **~25–30 hrs** |

---

## Week 2 — Safe for Real Customers (Security + Tenant Isolation)

**Theme:** Every user's data is theirs alone; API permissions match UI promises.  
**Exit criteria:** No global shared tables; top write routes use RBAC; brand context scoped per user.

### Task 2.1 — Add `userId` to `AgencyClient` + scope all queries

| Field | Detail |
|-------|--------|
| **Priority** | Security · Revenue |
| **Impact** | Critical |
| **Difficulty** | Medium |
| **Time** | 6–8 hours |
| **Why it matters** | Today any authenticated user can read/create/delete any agency client. Agency billing limits (`clientLimit`) are meaningless. Legal and trust risk at scale. |

**Actions:** Prisma migration; update `api/clients/route.ts`; fix `countAgencyClients(ownerId)` in `billing-service.ts`.

---

### Task 2.2 — Fix onboarding brand kit overwrite

| Field | Detail |
|-------|--------|
| **Priority** | Security · Retention |
| **Impact** | Critical |
| **Difficulty** | Low |
| **Time** | 2–4 hours |
| **Why it matters** | `syncBrandKit()` uses `brandKit.findFirst()` — new user onboarding can overwrite another customer's brand. Corrupts AI output for existing paying users. |

**Actions:** Always scope by `userId`; use `upsertBrandKitForUser` from `persistence.ts`.

---

### Task 2.3 — Scope brand kit in all AI routes

| Field | Detail |
|-------|--------|
| **Priority** | Security · Retention |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 6–8 hours |
| **Why it matters** | `social`, `topics`, `keywords`, `analyzer`, and `ai/context.ts` use global `findFirst` — AI generates content with wrong brand voice. Paying users lose trust immediately. |

**Actions:** Audit all `brandKit.findFirst` calls; enforce `getBrandKitForUser(userId)` everywhere.

---

### Task 2.4 — Migrate top 10 write routes to `gateAuth` / `requirePermission`

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 8–12 hours |
| **Why it matters** | ~22 routes use `getSession()` only — viewers can publish, edit campaigns, run workflows. Enterprise teams won't buy without role enforcement. |

**Actions:** Priority routes: `publish`, `publish/linkedin`, `projects`, `workflows`, `prompts`, `extensions`, `templates`, `trends`, `clients`, `referrals`.

---

### Task 2.5 — Add login/register rate limiting

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 4–6 hours |
| **Why it matters** | No brute-force protection on auth endpoints. Credential stuffing and spam registrations pollute funnel metrics and increase infra cost. |

**Actions:** Vercel KV or Upstash Redis — 10 attempts / 15 min per IP on login; 5 registrations / hour per IP.

---

### Task 2.6 — SSRF blocklist on knowledge URL import

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 3–4 hours |
| **Why it matters** | Server fetches arbitrary URLs — attackers can reach internal metadata endpoints (`169.254.169.254`) from production server. |

**Actions:** Block private IP ranges, localhost, and non-HTTP(S) schemes in `knowledge/route.ts`.

---

### Task 2.7 — Add critical database indexes + run `prisma db push`

| Field | Detail |
|-------|--------|
| **Priority** | Scalability |
| **Impact** | High |
| **Difficulty** | Low |
| **Time** | 3–4 hours |
| **Why it matters** | Missing indexes on `GeneratedContent`, `CalendarEvent`, `MarketingEmployeeRun`, `Invoice` cause slow queries as user count grows. Launch day slowdown kills conversion. |

**Actions:** Apply indexes from [DATABASE_AUDIT.md](./DATABASE_AUDIT.md); verify on staging with 10K seed rows.

---

### Task 2.8 — Deprecate global `TeamMember` in favor of `WorkspaceMember`

| Field | Detail |
|-------|--------|
| **Priority** | Security · Revenue |
| **Impact** | High |
| **Difficulty** | High |
| **Time** | 12–16 hours |
| **Why it matters** | `/dashboard/team` shows a global singleton team — all users see the same members. Seat billing (`canInviteTeamMember`) counts wrong entity. Blocks team plan sales. |

**Actions:** Point team UI at `Workspace` + `WorkspaceMember`; migrate or hide legacy `TeamMember` route; align seat counting.

---

### Week 2 Summary

| Priority area | Tasks | Est. total |
|---------------|-------|------------|
| Security | 2.1–2.6, 2.8 | ~35–48 hrs |
| Retention | 2.2–2.3 | (included above) |
| Scalability | 2.7 | ~3–4 hrs |
| **Week total** | **8 tasks** | **~40–50 hrs** |

---

## Week 3 — Activation & Retention (PMF Loop)

**Theme:** Get users to value in under 5 minutes; keep them coming back with fair, transparent billing.  
**Exit criteria:** Golden path live; real dashboard data; credits charged fairly; upgrade funnel wired.

### Task 3.1 — Ship golden path: goal → AI Employee → approve → publish

| Field | Detail |
|-------|--------|
| **Priority** | Activation |
| **Impact** | Critical |
| **Difficulty** | Medium |
| **Time** | 8–12 hours |
| **Why it matters** | PMF requires one repeatable "aha" moment. AI Employee autonomous mode is the flagship — users who complete a run are 3–5× more likely to convert (industry benchmark for workflow completion). |

**Actions:** Shorten onboarding to goal-only (skip full wizard); redirect new users to `/dashboard/employee`; post-run CTA to publish calendar; track completion event.

---

### Task 3.2 — Charge credits after successful AI generation

| Field | Detail |
|-------|--------|
| **Priority** | Revenue · Retention |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 8–10 hours |
| **Why it matters** | Pre-charging on failure causes support tickets and churn. Paying users who lose credits to provider errors will not renew. |

**Actions:** Split `gateCredits` into `checkCredits` + `consumeCredits` after success; refund on caught provider errors in `AIEngine.run()` skeleton.

---

### Task 3.3 — Fix employee & image credit pricing

| Field | Detail |
|-------|--------|
| **Priority** | Revenue |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 6–8 hours |
| **Why it matters** | Strategy step runs marketing_plan workload for 2 credits (should be 10); images charge 2 credits for 3 DALL-E calls (should be 15+). COGS exceeds revenue on heavy users. |

**Actions:** Per-step credit map in employee; `ai_image × count` for image steps; fix UI copy to match.

---

### Task 3.4 — Replace fake dashboard stats with real data

| Field | Detail |
|-------|--------|
| **Priority** | Retention |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 6–8 hours |
| **Why it matters** | Hardcoded "12 generations" and demo calendar events destroy trust when users notice. Paying customers expect accurate usage reflection. |

**Actions:** Wire dashboard to `/api/credits`, `/api/calendar`, attribution summary; show honest empty states when zero.

---

### Task 3.5 — Session refresh after plan upgrade

| Field | Detail |
|-------|--------|
| **Priority** | Retention · Revenue |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 3–4 hours |
| **Why it matters** | JWT embeds stale `plan` after Stripe checkout — user pays but still sees free limits until re-login. Immediate churn risk at highest-intent moment. |

**Actions:** Add `POST /api/auth/refresh` after checkout success; re-issue cookie with updated plan from DB.

---

### Task 3.6 — Credit cost preview before generation

| Field | Detail |
|-------|--------|
| **Priority** | Activation · Retention |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 4–6 hours |
| **Why it matters** | Users hit 402 mid-employee-run without warning. Showing "This will use 12 credits" before autonomous start reduces surprise and increases informed upgrades. |

**Actions:** Cost estimator component on employee, agent, and marketing-os pages; link to billing on insufficient credits.

---

### Task 3.7 — Gate autonomous AI Employee behind Creator plan

| Field | Detail |
|-------|--------|
| **Priority** | Revenue · Activation |
| **Impact** | High |
| **Difficulty** | Low |
| **Time** | 3–4 hours |
| **Why it matters** | Flagship feature is the strongest upgrade lever. Free users get guided mode (1 step); autonomous full pipeline drives Creator conversions. |

**Actions:** Check `planId !== "free"` for `mode: "autonomous"`; show upgrade modal with clear value prop.

---

### Task 3.8 — Show "Demo mode" badge when AI keys missing

| Field | Detail |
|-------|--------|
| **Priority** | Retention |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 2–3 hours |
| **Why it matters** | Users publish template/mock content believing it's AI-generated. Discovery later feels like bait-and-switch — negative reviews. |

**Actions:** Global banner when `!hasAnyAIProvider()`; per-output `live: false` indicator in UI.

---

### Task 3.9 — Wire pricing → register → billing upgrade param

| Field | Detail |
|-------|--------|
| **Priority** | Revenue · Activation |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 2–3 hours |
| **Why it matters** | Pricing page CTAs lose intent when `?plan=pro` is dropped during registration. High-intent visitors convert less. |

**Actions:** Pass plan through register → post-login redirect to `/dashboard/billing?upgrade=pro`.

---

### Week 3 Summary

| Priority area | Tasks | Est. total |
|---------------|-------|------------|
| Activation | 3.1, 3.6, 3.9 | ~14–21 hrs |
| Retention | 3.4, 3.5, 3.8 | ~11–15 hrs |
| Revenue | 3.2, 3.3, 3.7, 3.9 | ~19–25 hrs |
| **Week total** | **9 tasks** | **~42–52 hrs** |

---

## Week 4 — Scale, Polish & Launch

**Theme:** Infrastructure for 1,000 users; observability; launch ops; remaining hardening.  
**Exit criteria:** Monitoring live; beta cohort onboarded; launch checklist complete; performance acceptable.

### Task 4.1 — TanStack Query for layout-level fetches

| Field | Detail |
|-------|--------|
| **Priority** | Scalability · Retention |
| **Impact** | High |
| **Difficulty** | Medium |
| **Time** | 8–10 hours |
| **Why it matters** | 5+ duplicate API calls on every dashboard mount (onboarding, auth, billing, credits). Slow perceived load increases bounce; wastes server resources at 1,000 DAU. |

**Actions:** Shared queries for auth context, credits, billing status; dedupe `OnboardingGate` + `TopBar` + `UpgradeBanner`.

---

### Task 4.2 — Add Sentry + Vercel Analytics

| Field | Detail |
|-------|--------|
| **Priority** | Scalability · Retention |
| **Impact** | High |
| **Difficulty** | Low |
| **Time** | 3–4 hours |
| **Why it matters** | Launch without error tracking = flying blind. First 1,000 users will hit edge cases you can't reproduce locally. |

**Actions:** Sentry for API 500s and client errors; Vercel Analytics for Web Vitals; alert on error rate > 1%.

---

### Task 4.3 — `AIEngine.run()` skeleton + migrate 3 high-traffic routes

| Field | Detail |
|-------|--------|
| **Priority** | Scalability · Revenue |
| **Impact** | High |
| **Difficulty** | High |
| **Time** | 12–16 hours |
| **Why it matters** | Single AI entry point enables consistent billing, logging, and refunds. Migrating blog, linkedin, and employee routes proves the pattern before scaling to 20+ routes. |

**Actions:** Create `src/lib/ai/engine.ts`; migrate `blog`, `linkedin`, `employee` routes; deprecate direct `generate()` in those paths.

---

### Task 4.4 — Dynamic import heavy bundles (recharts, jspdf)

| Field | Detail |
|-------|--------|
| **Priority** | Scalability · Activation |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 4–6 hours |
| **Why it matters** | Analytics and personal-brand pages are 220–271 kB first load. Slow pages on first visit hurt activation on mobile and India market bandwidth. |

**Actions:** `next/dynamic` for recharts on analytics/performance; lazy-load export libs.

---

### Task 4.5 — Validate white-label logo uploads (block SVG XSS)

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 2–3 hours |
| **Why it matters** | Agency tier customers can inject `data:image/svg+xml` with script — stored XSS in client portal preview. |

**Actions:** Allow only `image/png`, `image/jpeg`, `image/webp`; reject SVG data URIs.

---

### Task 4.6 — Admin role assignment allowlist + Zod on billing/admin POST

| Field | Detail |
|-------|--------|
| **Priority** | Security |
| **Impact** | Medium |
| **Difficulty** | Medium |
| **Time** | 6–8 hours |
| **Why it matters** | Admin can set arbitrary `platformRole` strings; billing payloads unvalidated. First compromised admin session = platform-wide damage. |

**Actions:** Zod schemas for `api/admin` and `api/billing` POST bodies; enum allowlist for roles and plan IDs.

---

### Task 4.7 — Landing page: AI Employee as hero (match dashboard)

| Field | Detail |
|-------|--------|
| **Priority** | Activation · Revenue |
| **Impact** | Medium |
| **Difficulty** | Low |
| **Time** | 4–6 hours |
| **Why it matters** | Marketing site sells "content studio" generically; dashboard sells AI Employee. Message mismatch lowers signup quality and conversion. |

**Actions:** Hero CTA "Launch your AI Marketing Employee"; short demo video or static pipeline preview; align copy with autonomous mode.

---

### Task 4.8 — Launch beta cohort (50–100 users) + feedback loop

| Field | Detail |
|-------|--------|
| **Priority** | Activation · Retention |
| **Impact** | Critical (for PMF) |
| **Difficulty** | Low (ops) |
| **Time** | Ongoing (~8 hrs setup) |
| **Why it matters** | Code readiness ≠ product-market fit. Controlled beta validates golden path, pricing, and willingness to pay before spending on acquisition. |

**Actions:** Invite 50–100 founders/creators; weekly survey (NPS + "would you pay?"); track activation funnel; iterate on top friction point.

---

### Task 4.9 — Production launch checklist + runbook

| Field | Detail |
|-------|--------|
| **Priority** | Scalability |
| **Impact** | High |
| **Difficulty** | Low |
| **Time** | 4–6 hours |
| **Why it matters** | First production incident without a runbook costs hours of downtime and customer trust. |

**Actions:** Document deploy steps, env vars, rollback, Stripe webhook test, DB backup, incident contacts; execute full dry-run on staging.

---

### Task 4.10 — Usage overage credit packs (Stripe one-time)

| Field | Detail |
|-------|--------|
| **Priority** | Revenue · Retention |
| **Impact** | Medium |
| **Difficulty** | Medium |
| **Time** | 8–10 hours |
| **Why it matters** | Users at credit ceiling churn instead of upgrading. ₹199/500 credits captures expansion revenue without forcing plan jump. |

**Actions:** Stripe one-time price; `POST /api/billing { action: "buy_credits" }`; add to credits on `checkout.session.completed`.

---

### Week 4 Summary

| Priority area | Tasks | Est. total |
|---------------|-------|------------|
| Scalability | 4.1, 4.3, 4.4, 4.9 | ~28–38 hrs |
| Security | 4.5, 4.6 | ~8–11 hrs |
| Activation | 4.7, 4.8 | ~12–14 hrs |
| Revenue | 4.10 | ~8–10 hrs |
| Retention | 4.2, 4.8 | (included above) |
| **Week total** | **10 tasks** | **~48–58 hrs** |

---

## 30-Day Gantt Overview

```
Week 1  [████████████] Revenue leaks + auth secrets     (~30 hrs)
Week 2  [████████████████] Tenant isolation + RBAC       (~45 hrs)
Week 3  [████████████████] Activation + fair billing    (~47 hrs)
Week 4  [██████████████████] Scale + beta + launch      (~53 hrs)
                                              Total: ~175 hrs
```

*Assumes 1 full-time engineer (~40 hrs/week) + founder product/ops support. With 2 engineers, calendar time compresses to ~3 weeks.*

---

## Risk Register

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Week 2 team migration takes longer | High | Ship 2.1–2.3 first; defer 2.8 to post-launch if needed |
| Stripe webhook issues in prod | Medium | Week 1 dry-run; Stripe CLI test suite |
| AI COGS higher than projected | Medium | Week 3 pricing fixes; monitor `AiGenerationLog` daily |
| Low beta activation | Medium | Week 3 golden path; personal onboarding for beta users |
| Scope creep (new features) | High | **No new features during 30 days** — audit fixes only |

---

## What Ships vs What Waits

### In scope (30 days)

- All P0 revenue and security fixes  
- Golden path activation  
- Fair credit billing  
- Real dashboard data  
- Beta launch with monitoring  
- Credit overage packs  

### Post-launch (Days 31–60)

- Full `TeamMember` → `WorkspaceMember` migration (if deferred)  
- Background job queue (Inngest) for long AI runs  
- Annual plans  
- Email verification  
- Publishing hub unification  
- Full Zod validation on all routes  
- GDPR data export/deletion  

---

## Daily Standup Template (Launch Sprint)

1. **Revenue:** Any leak reports or billing disputes?  
2. **Activation:** How many beta users completed AI Employee?  
3. **Blockers:** Security or tenant issue discovered?  
4. **Ship:** What task ID closes today?  

---

## Success Definition — Day 30

InkFit AI is ready for paid acquisition when:

- [ ] All Week 1 exit criteria met (zero revenue leaks)  
- [ ] All Week 2 exit criteria met (tenant-safe)  
- [ ] ≥ 30 beta users completed AI Employee golden path  
- [ ] ≥ 5 beta users converted to paid (Stripe live)  
- [ ] NPS ≥ 30 from beta survey  
- [ ] Error rate < 1% (Sentry)  
- [ ] Launch checklist signed off  

**At that point, scale toward 1,000 paying customers with confidence.**

---

*Derived from: [INKFIT_AI_MASTER_AUDIT.md](./INKFIT_AI_MASTER_AUDIT.md), [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md), [USER_FLOW_AUDIT.md](./USER_FLOW_AUDIT.md), [DATABASE_AUDIT.md](./DATABASE_AUDIT.md), [SECURITY_AUDIT.md](./SECURITY_AUDIT.md), [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md), [BILLING_AUDIT.md](./BILLING_AUDIT.md)*
