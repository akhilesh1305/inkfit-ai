# InkFit AI — Performance Audit

**Date:** June 2026  
**Stack:** Next.js 15, React 19, Prisma, PostgreSQL, Vercel deployment target

---

## Executive Summary

InkFit AI builds successfully with **108 static/dynamic routes**. Performance is adequate for development and early beta but has **client-heavy architecture**, **synchronous AI blocking**, and **duplicate data fetching** that will degrade at scale.

**Performance score: 5/10**

---

## 1. Build & Bundle Analysis

### Build Output (Latest)

- **108 routes** generated
- Shared JS: **103 kB** first load
- Largest pages:
  - `personal-brand` — 271 kB
  - `marketing-os`, `website-generator`, `seo` — 260–263 kB
  - `analytics` — 220 kB (recharts)
  - `employee` — 121 kB

### Heavy Dependencies

| Package | Used By | Impact |
|---------|---------|--------|
| `recharts` | Analytics, performance dashboards | Large chart bundle |
| `framer-motion` | Landing page animations | Marketing only — OK |
| `jspdf` | Export features | Loaded on demand? Verify |
| `pdfjs-dist` | Knowledge/brand voice parsing | Heavy; client-side |
| `mammoth` | DOCX parsing | Client-side |

### Recommendations

| Priority | Action |
|----------|--------|
| High | `dynamic import()` for recharts, jspdf, pdfjs on feature pages |
| Medium | Audit `framer-motion` — scope to landing only |
| Medium | Route-based code splitting for dashboard features (already partial via App Router) |
| Low | Replace `<img>` with `next/image` in `EmployeeStepCard` (ESLint warning) |

---

## 2. Server vs Client Components

### Pattern

- **Dashboard pages: overwhelmingly `"use client"`**
- Layout is server component; children are client
- Little use of RSC for initial data loading
- No `loading.tsx` or `Suspense` boundaries on most routes

### Impact

| Issue | Effect |
|-------|--------|
| Full client hydration per page | Larger JS, slower TTI |
| Data fetched post-mount | Loading spinners, layout shift |
| No streaming | User sees blank → spinner → content |

### Recommendations

1. Convert read-only dashboard shells to Server Components with data prefetch
2. Add `loading.tsx` for dashboard routes
3. Pass initial data as props from server pages to client views

---

## 3. API Performance

### Slow Patterns

| Pattern | Location | Latency Risk |
|---------|----------|--------------|
| Synchronous AI in HTTP handler | `employee`, `agent`, `blog`, `video` | 5–60s requests |
| `getAuthContext()` multiple DB queries | Every gated request | +50–200ms |
| Seed-on-read writes | `publish`, `images`, `workspace` | First visit slow + race |
| `syncCalendarPlan` deleteMany + N creates | `persistence.ts` | O(n) writes |
| `countSeatsForUser` N+1 | `billing-service.ts` | Scales with workspaces |
| Full table returns | `clients`, `team` | Memory + serialization |

### Missing

- Response caching (`Cache-Control`, `unstable_cache`)
- Database query caching (Prisma Accelerate not configured)
- Connection pooling documentation (Neon pooler required)
- Request timeouts on AI calls

### Vercel Serverless Limits

| Limit | Impact |
|-------|--------|
| 10s hobby / 60s pro timeout | Employee autonomous 6-step may timeout if batched server-side |
| Cold starts | First request slow after idle |
| No persistent in-memory | AI rate limit ineffective |

**Current mitigation:** Employee autonomous uses client-driven `autonomous_tick` — good pattern.

---

## 4. Database Query Performance

### Missing Indexes

See `DATABASE_AUDIT.md` — `GeneratedContent`, `CalendarEvent`, `MarketingEmployeeRun`, `Invoice` lack indexes.

### N+1 Queries

```typescript
// billing-service.ts — countSeatsForUser
ownedWorkspaces.map(ws => prisma.workspaceMember.count(...))  // N+1
```

### Large Row Reads

- `MarketingEmployeeRun.steps` — full JSON blob parsed on every GET
- `Workflow.nodes`/`edges` — same pattern
- `WhiteLabelSettings.logoDataUrl` — up to 600KB per row

---

## 5. Client-Side Performance

### Duplicate Fetches (per dashboard mount)

| Component | Endpoint |
|-----------|----------|
| `OnboardingGate` | `/api/onboarding` |
| `DashboardTopBar` | `/api/auth/me` |
| `Sidebar` | `/api/auth/context` |
| `UpgradeBanner` | `/api/billing/status` |
| `CreditsTopBarWidget` | `/api/credits` |

**5+ API calls before user sees content.** No shared cache.

### Unnecessary Renders

- `OnboardingGate` re-fetches on `pathname` change
- Most views don't memoize expensive child trees
- No virtualization on long lists (attribution, calendar, prompts)

### Recommendations

| Priority | Action |
|----------|--------|
| **High** | TanStack Query with shared cache for auth/billing/credits |
| **High** | Combine `/api/auth/me` + `/api/auth/context` into single endpoint |
| Medium | Remove `pathname` dep from OnboardingGate (check once) |
| Medium | Virtualize long lists in analytics, prompts, calendar |
| Low | `React.memo` on heavy chart components |

---

## 6. Page Load Assessment

| Page | Est. Load | Issues |
|------|-----------|--------|
| `/` (landing) | Medium | Framer motion, many sections — acceptable for marketing |
| `/dashboard` | Medium | Demo data fetch + 5 layout API calls |
| `/dashboard/employee` | Medium-High | Client-only, autonomous polling |
| `/dashboard/analytics` | High | recharts bundle |
| `/dashboard/personal-brand` | **High** | 271 kB first load |
| `/dashboard/marketing-os` | **High** | 263 kB + sync AI |
| `/login` | Low | ✅ |

### Slow Pages (Priority Fix)

1. `personal-brand` — 271 kB
2. `marketing-os` — 263 kB
3. `website-generator` — 262 kB
4. `seo` — 261 kB
5. `analytics` — 220 kB

---

## 7. AI Provider Performance

| Aspect | Current | Recommendation |
|--------|---------|----------------|
| Timeout | Not explicit | Set 30s timeout per provider call |
| Retry | Basic in providers.ts | Exponential backoff with jitter |
| Streaming | Not implemented | Stream tokens to client for agent/employee |
| Caching | None | Cache identical prompts (hash key) |
| Rate limit | In-memory 40/min | Redis per billingUserId |

---

## 8. Image & Asset Performance

- Employee step card uses raw `<img>` for AI images — no lazy load, no optimization
- White-label logos stored as base64 in DB — large payloads
- No CDN for generated images (DALL-E URLs expire)

---

## 9. Performance Recommendations (Prioritized)

### P0 — Before Launch

1. Add TanStack Query for layout-level fetches (dedupe 5 calls → 2)
2. Dynamic import recharts on analytics/performance pages
3. Add database indexes (see DATABASE_AUDIT)
4. Set explicit AI provider timeouts

### P1 — First Month

5. Server Component prefetch for dashboard home stats (real data)
6. Background jobs for employee/agent (Inngest/Trigger.dev)
7. `next/image` for all user-facing images
8. Paginate list endpoints

### P2 — Scale

9. Prisma Accelerate or PgBouncer
10. CDN for generated assets
11. Edge caching for `/api/billing/status`
12. Virtualize long lists

---

## 10. Monitoring Gaps

| Tool | Status |
|------|--------|
| Web Vitals tracking | Not configured |
| API latency metrics | Not configured |
| AI cost per request | `AiGenerationLog` exists but no dashboard |
| Error tracking (Sentry) | Not configured |
| Database slow query log | Depends on host |

**Recommendation:** Add Sentry + Vercel Analytics before launch.

---

*See `INKFIT_AI_MASTER_AUDIT.md` for business-prioritized improvements.*
