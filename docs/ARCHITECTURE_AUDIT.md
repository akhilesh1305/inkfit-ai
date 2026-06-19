# InkFit AI — Architecture Audit

**Date:** June 2026  
**Scope:** Full `src/` codebase, Prisma schema, API layer, client architecture  
**Audience:** Engineering leadership preparing for production scale

---

## Executive Summary

InkFit AI is a **Next.js 15 App Router monolith** (~430+ source files) with PostgreSQL/Prisma, JWT cookie auth, Stripe billing, and a partially centralized AI layer. The architecture is **feature-rich and directionally sound** for an early-stage SaaS, but suffers from **parallel data models**, **inconsistent API guard patterns**, and **multi-tenant isolation gaps** that must be resolved before scaling to 1,000 paying customers.

**Overall architecture grade: 6/10** — good foundations, significant consolidation debt.

---

## 1. Folder Structure

### Layout

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # login, register
│   ├── dashboard/          # ~40 feature pages
│   ├── api/                # ~41 API route modules
│   ├── admin/              # platform admin
│   ├── onboarding/         # first-run wizard
│   └── pricing/            # marketing pricing
├── components/             # ~179 files, domain-organized
│   ├── billing/, employee/, integrations/, workflows/, …
│   └── ui/                 # minimal shared primitives
├── lib/                    # ~98 business-logic modules
│   ├── ai/, integrations/, attribution/, crypto/
│   └── billing*, auth*, rbac*, credits*
├── hooks/                  # 1 hook (unused)
└── middleware.ts           # edge JWT + route protection
```

### Strengths

- Clear **feature-folder** component organization scales with dashboard surface area.
- Business logic extracted into `lib/` keeps API routes thin in newer code.
- Integration adapter pattern (`integrations/registry.ts`, providers) is extensible.

### Issues

| Severity | Issue | Location |
|----------|-------|----------|
| High | Three workspace modules with overlapping concerns | `workspace.ts`, `workspaces.ts`, `workspace-context.ts` |
| High | Dual team systems (global vs per-workspace) | `team/route.ts` vs `workspaces/route.ts` |
| High | Dual publishing pipelines | `publish/` + `extensions/` vs `integrations/` |
| Medium | `workspace` vs `workspaces` API naming confusion | `api/workspace/`, `api/workspaces/` |
| Low | Unused `hooks/useOptimisticMutation.ts` | Never imported |
| Low | Unused `lib/api-route-auth.ts` (`withRouteAuth`) | Zero imports |
| Low | Broken circular export | `lib/ai/index.ts` re-exports `@/lib/ai` |

---

## 2. Component Structure

### Pattern

- **~95% of dashboard pages are `"use client"`** with local `useState` + `fetch('/api/...')`.
- No global state library (Zustand, Redux, TanStack Query).
- Layout shell: `dashboard/layout.tsx` → Sidebar, TopBar, OnboardingGate, UpgradeBanner.

### Strengths

- Consistent page shell (`PageHeader`, cards, section titles).
- Feature views co-located with routes (`MarketingEmployeeView`, `AttributionDashboardView`).

### Issues

| Severity | Issue | Impact |
|----------|-------|--------|
| Medium | No shared data cache — duplicate fetches | OnboardingGate, Sidebar, TopBar each hit APIs independently |
| Medium | Nav permissions are UI-only | `nav-access.ts` hides links; API enforcement inconsistent |
| Low | Minimal `ui/` primitives | Styling duplicated across feature components |

---

## 3. Route Organization

### API Routes (~41 modules)

| Category | Examples | Auth Pattern |
|----------|----------|--------------|
| AI generation | `blog`, `linkedin`, `seo`, `employee` | `gateCredits` (newer) |
| Auth | `login`, `register`, `me`, `context` | Public / session |
| Billing | `billing`, `billing/webhook`, `billing/status` | `requirePermission` + Stripe sig |
| Integrations | `integrations`, `oauth/*` | `requirePermission` |
| Legacy | `publish`, `projects`, `templates` | `getSession()` only |
| Public risk | `demo` | **No auth** |

### Page Routes

- Marketing: `/`, `/pricing`
- Auth: `/login`, `/register`
- Onboarding: `/onboarding` (forced via `OnboardingGate`)
- Dashboard: `/dashboard/*` (~40 features)
- Admin: `/admin`

### Anti-Patterns

1. **Three coexisting auth styles:** middleware JWT → `getSession()` → `gateAuth`/`gateCredits`/`requirePermission`
2. **No request validation layer** — no Zod/schemas; ad-hoc `String(body.x).trim()`
3. **Uniform error handling:** `catch (e) { return NextResponse.json({ error: String(e) }, { status: 500 }) }`
4. **Demo fallback on API failure** — `team`, `clients`, `brand` GET return hardcoded data when DB fails

---

## 4. API Design

### Good Patterns

- `gateCredits()` — single entry for auth + permission + billing context + credit check
- `resolveBillingContext()` — workspace members bill to owner
- `requirePermission()` — typed RBAC from `rbac.ts`
- Stripe webhook uses raw body + signature verification

### Missing Abstractions

| Gap | Recommendation |
|-----|----------------|
| No `ApiHandler` wrapper | Standardize auth, validation, errors, logging |
| No pagination contract | Some routes `take: 50`, others return full tables |
| No idempotency keys | Stripe webhooks, checkout, employee autonomous ticks |
| No job queue | Long AI runs block HTTP (employee, agent, video) |

### Code Duplication

- Route-local `enhanceWithAI()` in 5+ files (`onboarding`, `personal-brand`, `video`, `landing-pages`, `analyzer`)
- Brand kit loading duplicated with inconsistent scoping
- `getActiveWorkspaceId()` duplicated in `persistence.ts` and `workspace-context.ts`

---

## 5. Database Design (Summary)

See `DATABASE_AUDIT.md` for full analysis.

**Critical:** `AgencyClient` has no `userId`; `TeamMember`/`TeamWorkspace` are global singletons; many models lack foreign keys and indexes.

---

## 6. State Management

| Layer | Mechanism | Staleness Risk |
|-------|-----------|----------------|
| Auth | JWT in `inkfit-session` cookie | `plan`, `platformRole` stale until re-login |
| Workspace | `UserWorkspacePreference.activeWorkspaceId` | OK |
| Client UI | Per-component `useState` | No cross-page sync |
| Server | Prisma direct queries | No caching layer |

**Recommendation:** Introduce TanStack Query for client fetches; add session refresh endpoint after plan/role changes.

---

## 7. AI Services

See Phase 4 migration plan in this document and `INKFIT_AI_MASTER_AUDIT.md`.

### Current Structure

```
src/lib/ai/
  providers.ts      # OpenAI, Gemini, rate limit, generateText
  prompts.ts        # Centralized prompts (partial)
  context.ts        # Brand + knowledge assembly
  generations.ts    # Feature generators
  usage.ts          # AiGenerationLog (non-blocking)
```

### Gaps

- **Two execution paths:** `generateText()` (modern) vs deprecated `generate()` (5+ routes)
- **Prompts in 5+ locations** — `prompts.ts`, `generations.ts`, route-local, `content-agent.ts`, `prompt-library.ts`
- **No conversation memory** — agent ignores prior messages in LLM calls
- **Credits charged before AI runs** — failures still consume credits
- **`ai-legacy.ts` still active** — migration incomplete

### Centralized AI Engine — Migration Plan

#### Target Structure

```
src/lib/ai/
  providers.ts      # (existing) provider abstraction
  prompts.ts        # ALL prompts, keyed by ID
  context.ts        # (existing) brand + knowledge
  memory.ts         # NEW: conversation history, run context
  brandVoice.ts     # NEW: voice profile injection helpers
  usage.ts          # (existing) + correlation IDs
  engine.ts         # NEW: AIEngine.run() — single entry point
```

#### Phase 1 — Safety (Week 1–2)

1. Create `AIEngine.run({ feature, promptId, creditAction, userId, quantity? })`
2. Internally: `resolveBillingContext` → `requireCredits` → `buildAIContext` → `generateText` → log
3. Post-generation: refund credits on provider failure
4. Close P0 leaks: `/api/demo`, workflow billing, demo checkout in prod

#### Phase 2 — Consolidate Prompts (Week 3–4)

1. Move all route-local `enhanceWithAI` prompts to `prompts.ts` with IDs
2. Migrate `generations.ts` inline prompts
3. ESLint rule: block new `generate()` imports
4. Wire `prompt-library.ts` "use" → `AIEngine.run`

#### Phase 3 — Variable Costing (Week 5–6)

1. Employee step credit map (strategy = 10, images = 5×N, etc.)
2. LinkedIn multi-action per-action billing
3. Marketing OS section regen pricing alignment

#### Phase 4 — Memory & Observability (Ongoing)

1. Agent: pass last N `AgentMessage` rows into context
2. Replace in-memory rate limit with Redis/DB per `billingUserId`
3. Correlate `aiGenerationLog` + `creditUsage` via `requestId`

---

## 8. Authentication

### Stack

- `middleware.ts` — edge JWT verify, page/API protection
- `auth.ts` — bcrypt, JWT sign/verify, cookie management
- `auth-guard.ts` — `AuthContext`, workspace role resolution
- `rbac.ts` — permission matrix

### Issues

| Severity | Issue |
|----------|-------|
| Critical | Dev auto-`super_admin` for all users when `ADMIN_EMAILS` unset |
| High | JWT embeds `platformRole`/`plan` — stale after DB updates |
| High | Middleware admin gate uses JWT, API uses DB — inconsistency |
| Medium | `normalizePlatformRole()` defaults unknown roles to `agency_owner` |

---

## 9. Billing

See `BILLING_AUDIT.md`.

**Summary:** Solid service layer (`billing-service`, `credit-service`, `stripe`) but triple plan config sources, demo checkout bypass, and workflow billing not using `resolveBillingContext`.

---

## 10. Scalability Bottlenecks

| # | Bottleneck | Impact at 1K users |
|---|------------|---------------------|
| 1 | Synchronous AI in HTTP handlers | Timeouts, poor UX on Vercel |
| 2 | `getAuthContext()` DB round-trips per request | Latency under load |
| 3 | JSON blob columns (workflows, calendar, attribution) | No queryability, large rows |
| 4 | Seed-on-read writes (publish, images, workspace) | Race conditions |
| 5 | Global tables (`AgencyClient`, `TeamMember`) | Data leaks, no isolation |
| 6 | In-memory AI rate limit | Ineffective on serverless |
| 7 | Calendar sync: `deleteMany` + loop `create` | Slow, not transactional |
| 8 | No pagination standard | Memory pressure on list endpoints |
| 9 | N+1 seat counting in billing | Slow for agency plans |
| 10 | Duplicate client fetches | Wasted bandwidth, janky UI |

---

## 11. Dead Code & Over-Engineering

### Dead / Orphan

- Prisma models: `Usage`, `PlatformConnection` — no application references
- `hooks/useOptimisticMutation.ts` — unused
- `lib/api-route-auth.ts` — unused
- `lib/ai/index.ts` — circular export

### Over-Engineered Areas

- **Three publishing systems** for the same user action
- **Two team models** when `Workspace` + `WorkspaceMember` is the correct path
- **Attribution + Performance + Analytics** — overlapping metrics concepts with mock data

### Under-Engineered Areas

- Request validation (no Zod)
- Background jobs for AI
- Webhook idempotency
- Multi-tenant row-level security

---

## 12. Recommendations (Priority Order)

1. **Fix multi-tenant isolation** — `userId`/`workspaceId` on all tenant data
2. **Unify API auth** — migrate all routes to `gateAuth`/`gateCredits`
3. **Consolidate team + publishing models** — deprecate legacy paths
4. **Build `AIEngine.run()`** — single AI entry with correct billing
5. **Add Zod validation** on all POST bodies
6. **Introduce TanStack Query** — dedupe client fetches
7. **Background job queue** — Inngest/Trigger.dev for employee, agent, workflows
8. **Remove dead code** — orphan models, unused hooks

---

*Next: `USER_FLOW_AUDIT.md`, `DATABASE_AUDIT.md`, `SECURITY_AUDIT.md`*
