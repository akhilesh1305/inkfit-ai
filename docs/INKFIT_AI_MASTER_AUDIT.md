# InkFit AI — Master Audit Report

**Date:** June 2026  
**Prepared for:** Production launch — first 1,000 paying customers  
**Auditor role:** Senior Staff Engineer / SaaS Architect / CTO  
**Codebase:** Next.js 15 + Prisma + PostgreSQL + Stripe + OpenAI/Gemini

---

## Document Index

| Document | Scope |
|----------|-------|
| [ARCHITECTURE_AUDIT.md](./ARCHITECTURE_AUDIT.md) | Structure, API design, AI services, scalability |
| [USER_FLOW_AUDIT.md](./USER_FLOW_AUDIT.md) | Landing → billing journeys, friction points |
| [DATABASE_AUDIT.md](./DATABASE_AUDIT.md) | Schema, indexes, integrity, migrations |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Auth, RBAC, exploits, compliance |
| [PERFORMANCE_AUDIT.md](./PERFORMANCE_AUDIT.md) | Bundles, API latency, client fetches |
| [BILLING_AUDIT.md](./BILLING_AUDIT.md) | Credits, Stripe, revenue leaks |

---

## Startup Readiness Scorecard

| Dimension | Current (0–10) | Launch Target | Gap |
|-----------|----------------|---------------|-----|
| **Architecture** | 6 | 8 | Dual models, inconsistent API patterns |
| **UX / Product** | 6 | 8 | Fake dashboard data, onboarding friction |
| **Security** | 4 | 8 | Critical leaks, RBAC gaps, no rate limits |
| **Scalability** | 5 | 7 | Sync AI, JSON blobs, no job queue |
| **Monetization** | 5 | 8 | Revenue leaks, undercharging, demo bypass |
| **Product Quality** | 7 | 8 | Feature-rich, builds pass, flagship employee strong |

### Composite Scores

| Metric | Score |
|--------|-------|
| **Current Overall** | **5.5 / 10** |
| **Launch Readiness** | **4 / 10** |
| **Post-P0 Fix Estimate** | **7 / 10** |

---

## What Prevents Launch Today

1. **Public unauthenticated AI** (`/api/demo`) — unbounded provider cost
2. **Free paid plans via demo checkout** when Stripe keys missing in production
3. **Global data tables** (`AgencyClient`, `TeamMember`) — cross-tenant data exposure
4. **Onboarding overwrites any user's brand kit** — data corruption risk
5. **~22 API routes lack RBAC** — viewers can write, members bypass billing
6. **Hardcoded auth secret fallbacks** — session forgery if misconfigured
7. **Credits charged before AI succeeds** — trust and support burden
8. **No rate limiting** on login, register, or AI endpoints

**Estimated fix time for P0 items: 2–3 engineering weeks**

---

## What to Fix First (Business Impact Order)

| Week | Focus | Business Outcome |
|------|-------|------------------|
| 1 | Close revenue & security P0s | Stop bleeding money and data |
| 2 | Multi-tenant isolation + RBAC unification | Safe for real customers |
| 3 | Credit charge timing + employee pricing | Fair billing, fewer disputes |
| 4 | Dashboard real data + onboarding golden path | Activation & retention |
| 5–6 | AI engine consolidation + background jobs | Scale & maintainability |

---

## Top 10 Critical Issues

*Ranked by business impact, not engineering preference.*

| # | Issue | Domain | Impact |
|---|-------|--------|--------|
| 1 | **Public `/api/demo` burns live AI credits** | Security / Billing | Direct COGS; abuse at scale |
| 2 | **Demo checkout grants paid plans free in prod** | Billing | 100% revenue loss |
| 3 | **`AgencyClient` has no `userId` — global IDOR** | Security / DB | Any user sees/edits all clients |
| 4 | **Onboarding `syncBrandKit` overwrites wrong tenant** | UX / DB | Data corruption on signup |
| 5 | **Hardcoded `AUTH_SECRET` fallback** | Security | Session forgery in misconfigured deploy |
| 6 | **Dev auto-`super_admin` for all users** | Security | Full platform compromise in dev/staging |
| 7 | **Workflows bill member, not workspace owner** | Billing | Team members exploit free credits |
| 8 | **Credits pre-charged before AI success** | Billing / UX | Churn, support tickets, trust loss |
| 9 | **Brand kit `findFirst` without userId** | Security | Cross-tenant AI context leak |
| 10 | **No rate limiting on auth or AI** | Security | Brute force, cost attacks |

---

## Top 10 Revenue Opportunities

| # | Opportunity | Effort | Revenue Impact |
|---|-------------|--------|----------------|
| 1 | **Fix all billing leaks** (demo, workflows, attribution) | Low | Stop COGS > revenue |
| 2 | **AI Employee as primary upgrade driver** — gate autonomous behind Creator | Low | Higher conversion on flagship |
| 3 | **Correct employee/image/strategy credit pricing** | Medium | Align COGS with revenue |
| 4 | **Annual plans (2 months free)** | Low | +40% LTV, lower churn |
| 5 | **Usage overage packs** (₹199 per 500 credits) | Medium | Expansion revenue at ceiling |
| 6 | **Agency white-label as ₹9,999 tier** | Medium | 2× ARPU on agency segment |
| 7 | **Team seat add-ons** (₹299/seat/mo above limit) | Low | Natural expansion |
| 8 | **Onboarding → Employee → upgrade in first session** | Medium | Activation-to-paid funnel |
| 9 | **Stripe Tax + international pricing** | Medium | Global TAM |
| 10 | **Integration publishing as Pro+ feature** | Low | Clear plan differentiation |

---

## Top 10 UX Improvements

| # | Improvement | Priority | Outcome |
|---|-------------|----------|---------|
| 1 | **Golden path: goal → AI Employee → approve → publish** | Critical | Time-to-value < 5 min |
| 2 | **Replace fake dashboard stats with real user data** | Critical | Trust |
| 3 | **Shorten onboarding to goal-only; defer rest** | High | Reduce signup drop-off |
| 4 | **Show "demo mode" badge when AI keys missing** | High | Honest expectations |
| 5 | **Credit cost preview before generation** | High | Fewer 402 surprises |
| 6 | **Unify publishing into one "Publishing" hub** | High | Reduce confusion |
| 7 | **Progressive sidebar disclosure for new users** | Medium | Less overwhelm |
| 8 | **Post-upgrade session refresh** — show new plan immediately | Medium | Billing clarity |
| 9 | **Empty states with CTAs** (not demo data seeding) | Medium | Honest product |
| 10 | **Employee on landing page hero** — match dashboard flagship | Medium | Consistent positioning |

---

## Top 10 Technical Improvements

| # | Improvement | Priority | Outcome |
|---|-------------|----------|---------|
| 1 | **`AIEngine.run()` — single AI entry with billing** | High | Correct costs, maintainability |
| 2 | **Unify API auth on `gateAuth`/`gateCredits`** | High | Security consistency |
| 3 | **Add Zod validation on all POST routes** | High | Fewer bugs, safer admin |
| 4 | **Prisma relations + cascade deletes from User** | High | Data integrity |
| 5 | **TanStack Query for client data layer** | High | Performance, deduped fetches |
| 6 | **Background job queue for AI** (Inngest/Trigger.dev) | High | No Vercel timeouts |
| 7 | **Deprecate TeamMember/PublishConnection legacy models** | Medium | Architecture clarity |
| 8 | **Stripe webhook idempotency table** | Medium | Billing correctness |
| 9 | **Database indexes on hot paths** | Medium | Query performance |
| 10 | **Sentry + Vercel Analytics** | Medium | Observability |

---

## AI System — Centralized Engine Migration

### Current State

- Partial centralization in `src/lib/ai/`
- Prompts split across 5+ files
- Two execution paths (`generateText` vs deprecated `generate()`)
- No conversation memory in agent
- Credits charged at gate, not on success

### Target State

```
src/lib/ai/
  providers.ts      # Provider abstraction (existing)
  prompts.ts        # ALL prompts, keyed by ID (expand)
  context.ts        # Brand + knowledge (existing)
  memory.ts         # NEW: conversation history, run context
  brandVoice.ts     # NEW: voice injection helpers
  usage.ts          # Logging + correlation IDs (expand)
  engine.ts         # NEW: AIEngine.run() — single entry
```

### Migration Phases

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **1 — Safety** | Week 1–2 | `AIEngine.run()`, close P0 leaks, refund on failure |
| **2 — Prompts** | Week 3–4 | Consolidate all prompts, deprecate `generate()` |
| **3 — Costing** | Week 5–6 | Variable credits (images, employee steps) |
| **4 — Memory** | Ongoing | Agent history, Redis rate limits, cost dashboard |

See full detail in [ARCHITECTURE_AUDIT.md § AI Services](./ARCHITECTURE_AUDIT.md).

---

## Launch Checklist (Minimum Viable Production)

### Must Have (P0)

- [ ] Remove/gate `/api/demo`
- [ ] Block demo checkout in `NODE_ENV=production`
- [ ] Add `userId` to `AgencyClient` + scope queries
- [ ] Fix onboarding brand kit scoping
- [ ] Remove hardcoded secret fallbacks
- [ ] Disable dev auto-super-admin in staging/production
- [ ] Migrate top 10 write routes to `gateAuth`/`gateCredits`
- [ ] `npx prisma db push` with new indexes
- [ ] Stripe keys + webhook configured in Vercel
- [ ] `AUTH_SECRET` + `INTEGRATION_ENCRYPTION_KEY` set

### Should Have (P1)

- [ ] Login/register rate limiting
- [ ] SSRF blocklist on knowledge import
- [ ] Credits charged after AI success
- [ ] Workflow billing via `resolveBillingContext`
- [ ] Real dashboard stats
- [ ] Sentry error tracking

### Nice to Have (P2)

- [ ] TanStack Query
- [ ] Background jobs for employee
- [ ] Annual plans in Stripe
- [ ] Email verification

---

## Risk Matrix

```
                    IMPACT
                Low    Med    High   Critical
         ┌──────┬──────┬──────┬──────────┐
  High   │      │      │ RBAC │ Demo API │
         │      │      │ gaps │ Demo chk │
LIKELI-  ├──────┼──────┼──────┼──────────┤
  HOOD   │      │Stale │Credit│ Agency   │
         │      │ JWT  │pre-ch│ IDOR     │
  Low    │Dead  │      │      │          │
         │code  │      │      │          │
         └──────┴──────┴──────┴──────────┘
```

---

## Conclusion

InkFit AI is a **feature-complete early-stage SaaS** with impressive surface area (40+ dashboard tools, flagship AI Employee, Stripe billing, OAuth integrations, attribution engine). The product quality and vision score well.

However, it is **not yet safe for 1,000 paying customers** due to:

- Revenue leaks that could make COGS exceed revenue
- Multi-tenant isolation failures that create data exposure liability
- Inconsistent security enforcement across API routes

**Recommendation:** Execute the P0 checklist (2–3 weeks), then launch to a controlled beta of 50–100 users before scaling acquisition.

After P0 fixes, InkFit AI moves from **4/10 launch readiness** to approximately **7/10** — sufficient for paid beta with active monitoring.

---

## Appendix: Feature Inventory

| Category | Features | Production Ready? |
|----------|----------|-------------------|
| AI Generation | Blog, LinkedIn, SEO, Carousel, Social, Video, Images | ⚠️ Mostly (gating gaps) |
| AI Employee | Autonomous mode, approval workflow | ⚠️ Yes (pricing fix needed) |
| Agent | Conversational content | ⚠️ No memory, pre-charge |
| Marketing OS | 10-section plans | ✅ |
| Billing | Stripe, credits, team billing | ⚠️ Leaks exist |
| Integrations | LinkedIn, WordPress, Notion, Google Docs | ✅ |
| Attribution | Content tracking, insights | ⚠️ Insights ungated |
| Workflows | Visual DAG pipeline | ⚠️ Billing bypass |
| Admin | Platform admin panel | ⚠️ Stale JWT risk |
| White Label | Agency branding | ⚠️ XSS + fake domain verify |

---

*This audit is based on static code analysis and build verification. Runtime penetration testing and load testing are recommended before full launch.*
