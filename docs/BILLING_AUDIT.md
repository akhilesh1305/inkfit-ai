# InkFit AI — Billing Audit

**Date:** June 2026  
**Scope:** Credits, plans, Stripe integration, usage tracking, revenue protection  
**Currency:** INR (₹)

---

## Executive Summary

InkFit AI has a **functional billing system** with Stripe checkout, webhooks, workspace-owner billing, and credit metering. However, **multiple revenue leaks**, **pricing inconsistencies**, and **exploit paths** exist that would cost real money at 1,000 paying customers.

**Monetization security score: 5/10**

---

## 1. Plan Structure

| Plan | Price | Credits/mo | Seats | Billing Type |
|------|-------|------------|-------|--------------|
| Free | ₹0 | 100 | 1 | Individual |
| Creator | ₹499 | 2,000 | 1 | Individual |
| Pro | ₹1,499 | 10,000 | 3 | Team |
| Agency | ₹4,999 | Unlimited | 10 | Agency |

### Triple Source of Truth (Risk)

| Source | Path | Used For |
|--------|------|----------|
| `PLANS[].generations` | `lib/types.ts` | UI display |
| `PLAN_LIMITS.credits` | `lib/billing-plans.ts` | Enforcement |
| `CREDIT_LIMITS` | `lib/credits.ts` | **Redundant duplicate** |

**Fix:** Delete `CREDIT_LIMITS`; single source in `billing-plans.ts`.

---

## 2. Credit System

### Credit Costs

| Action | Credits | Features |
|--------|---------|----------|
| `content_generation` | 1 | Blog, LinkedIn, social, video, etc. |
| `ai_image` | 5 | Image Studio |
| `seo_article` | 3 | SEO writer, keywords, topics |
| `marketing_plan` | 10 | Marketing OS full plan |
| `agent_request` | 2 | Agent, Employee steps |

### Billing Flow

```
gateCredits(action)
  → requirePermission("ai:generate")
  → resolveBillingContext(userId)     // workspace owner pays
  → requireCredits(billingUserId, planId, action)
  → consumeCredits()                  // PRE-CHARGE before AI
  → route handler runs AI
```

### Issues

| Severity | Issue | Impact |
|----------|-------|--------|
| **High** | Credits consumed **before** AI runs | User charged on provider failure — refunds impossible today |
| **High** | No post-generation adjustment | Can't charge variable cost (3 images = 15 credits) |
| **Medium** | `agent_request` = 2 but UI says "1 credit/step" | Trust/confusion |
| **Medium** | Dev seeds 73 credits "used" in non-prod | Masks real usage testing |

---

## 3. Revenue Leaks & Exploits

### P0 — Critical

| # | Exploit | Path | Revenue Impact |
|---|---------|------|----------------|
| 1 | **Public `/api/demo`** — unauthenticated live AI | `demo/route.ts`, `middleware.ts` | Direct COGS, unbounded |
| 2 | **Demo checkout** — free paid plans when Stripe unset | `billing/route.ts`, `applyDemoCheckout()` | 100% revenue loss |
| 3 | **Workflow billing bypass** — bills member not owner | `workflow-executor.ts` | Team members exploit free plan |
| 4 | **Attribution insights ungated** — free AI calls | `attribution/route.ts` | Ongoing COGS leak |

### P1 — High

| # | Exploit | Path | Impact |
|---|---------|------|--------|
| 5 | Employee strategy step charged 2 credits, runs marketing_plan workload (10 credit value) | `employee/route.ts` | Undercharging |
| 6 | Employee images: 2 credits for 3 DALL-E images (should be 15+) | `generations.ts` | Undercharging |
| 7 | LinkedIn route: 1 credit for 4 distinct AI actions | `linkedin/route.ts` | Undercharging |
| 8 | Marketing OS section regen: 1 credit vs 10 for full plan | `marketing-os/route.ts` | Undercharging |
| 9 | `countAgencyClients()` ignores ownerId — wrong seat/client limits | `billing-service.ts` | Over/under enforcement |

### P2 — Medium

| # | Issue | Impact |
|---|-------|--------|
| 10 | JWT plan stale after Stripe upgrade | User sees old limits until re-login |
| 11 | No annual plans | Lower LTV |
| 12 | No usage-based overage billing | Hard limit = churn at ceiling |
| 13 | Referral credits not audited | Potential credit inflation |
| 14 | Demo invoice/history fallbacks | Masks empty billing state |

---

## 4. Stripe Integration

### What Works

| Feature | Status |
|---------|--------|
| Checkout sessions with metadata | ✅ |
| Customer portal | ✅ |
| Webhook signature verification | ✅ |
| Events: checkout, subscription lifecycle, invoices | ✅ |
| Stripe SDK v22 compatibility | ✅ |
| Demo fallback for dev | ✅ (dangerous in prod) |

### Gaps

| Gap | Risk |
|-----|------|
| No webhook idempotency | Double plan upgrades on retry |
| No `customer.subscription.trial_will_end` handling | Missed conversion opportunity |
| No failed payment dunning flow | Silent churn |
| Invoice amounts assume cents/paise division | Currency assumption |
| No Stripe Tax | Compliance gap for global customers |

---

## 5. Upgrade / Downgrade Flows

### Upgrade

1. User clicks plan on billing page → `POST /api/billing { action: "checkout", planId }`
2. Stripe checkout OR demo instant upgrade
3. Webhook `checkout.session.completed` → `syncUserPlan()`
4. **JWT not refreshed** — user may see old plan in session

### Downgrade

1. `POST /api/billing { action: "downgrade", planId: "free" }`
2. Cancels Stripe subscription if exists
3. `syncUserPlan({ planId: "free" })`
4. No proration, no "what you'll lose" confirmation beyond UI

### Issues

| Priority | Issue |
|----------|-------|
| High | No confirmation of credit reset on downgrade |
| Medium | No grace period for past_due |
| Medium | Pricing page mentions Razorpay — not implemented |
| Low | No upgrade success email |

---

## 6. Usage Tracking

### Storage

- `CreditUsage` — per user per month, column per action type
- `AiGenerationLog` — per request, feature + provider + tokens
- `BillingEvent` — subscription lifecycle events

### Gaps

| Gap | Impact |
|-----|--------|
| No correlation between `CreditUsage` and `AiGenerationLog` | Can't audit billing disputes |
| `AiGenerationLog.userId` optional | Anonymous logs |
| No workspace-level usage rollup | Agency owners can't see team usage |
| Dashboard shows hardcoded stats | User doesn't see real usage on home |

---

## 7. Team & Agency Billing

### What Works

- `resolveBillingContext()` — members bill to workspace owner
- `canInviteTeamMember()` — seat limit enforcement
- Team billing panel on billing page
- Plan-based seat/client limits

### Gaps

| Gap | Impact |
|-----|--------|
| Workflows don't use `resolveBillingContext` | Members bypass owner billing |
| `TeamMember` global table vs `WorkspaceMember` | Seat counting may be wrong |
| `AgencyClient` not scoped per user | Client limits meaningless |
| No per-member usage breakdown for owners | Agency can't manage team costs |

---

## 8. Upgrade Prompts

### Implemented

- `UpgradeBanner` in dashboard layout
- `CreditsTopBarWidget` — low credit CTA
- `DashboardCreditsBanner`
- 402 responses include `upgradeUrl` + `recommendedPlan`
- Billing page pricing cards

### Gaps

| Gap | Recommendation |
|-----|----------------|
| No prompt at 80%/90%/100% thresholds in-product | Add progressive urgency |
| No contextual upgrade (e.g., "need team seats?") | Link feature to plan |
| Employee credit cost not shown accurately | Fix copy |

---

## 9. Billing Exploit Test Checklist

Before launch, verify these **fail closed**:

- [ ] `/api/demo` returns 401 or costs credits
- [ ] `STRIPE_SECRET_KEY` unset in production → checkout returns error, not demo upgrade
- [ ] Workspace member running workflow → bills owner
- [ ] Attribution insights refresh → costs credits
- [ ] Employee full autonomous run → charges ≥12 credits
- [ ] LinkedIn multi-action → charges per action or higher single charge
- [ ] Viewer role → cannot consume credits on any route
- [ ] Stripe webhook replay → no double upgrade
- [ ] Free plan user → cannot exceed 100 credits/month
- [ ] Agency plan → truly unlimited (no integer overflow in usage columns)

---

## 10. Recommendations

### P0 — Before Launch

1. Gate `/api/demo` or remove live AI
2. Block `applyDemoCheckout` in production
3. Route workflows through `resolveBillingContext`
4. Gate attribution insights
5. Fix employee step credit mapping

### P1 — First Month

6. Charge credits **after** successful AI generation
7. Variable costing for images (5 credits × count)
8. Stripe webhook idempotency
9. Session refresh after plan change
10. Remove `CREDIT_LIMITS` duplicate

### P2 — Growth

11. Usage-based overage (₹X per 100 credits over limit)
12. Annual plans (2 months free)
13. Agency usage dashboard per member
14. Stripe Tax integration
15. Dunning emails for failed payments

---

## 11. Revenue Model Assessment

| Metric | Current | At 1K Customers (est.) |
|--------|---------|------------------------|
| ARPU potential | ₹499–₹4,999/mo | ₹1,500 avg realistic |
| MRR potential | — | ₹15L/mo (~$18K) |
| COGS risk (ungated AI) | High | Could exceed revenue |
| Churn risk (credit confusion) | Medium | 5–10% monthly |
| Expansion revenue (seats) | Low — broken counting | Fix before agency push |

**Bottom line:** Billing infrastructure is 70% complete. Revenue protection is 40% complete. Fix P0 leaks before spending on acquisition.

---

*See `INKFIT_AI_MASTER_AUDIT.md` for consolidated business priorities.*
