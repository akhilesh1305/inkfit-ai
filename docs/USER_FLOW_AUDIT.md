# InkFit AI — User Flow Audit

**Date:** June 2026  
**Scope:** End-to-end user journeys from landing to billing  
**Method:** Code review of pages, gates, APIs, and empty states

---

## Journey Map

```
Landing (/) → Register → Onboarding → Dashboard → First AI Gen → Workspace → Publishing → Billing
```

---

## 1. Landing Page (`/`)

### What Works

- Polished marketing page with hero, features, testimonials, FAQ, pricing CTA
- `MarketingHeader` with login/register links
- `AiDemoSection` showcases product capability

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **High** | AI demo may call live providers | Public `/api/demo` — cost/abuse risk; user sees "live" without account |
| **Medium** | Value prop scattered | Many sections; flagship AI Employee not hero-positioned on landing (only on dashboard) |
| **Medium** | CTA inconsistency | "Get Started" vs "Dashboard" vs "Sign up" — paths differ |
| **Low** | No social proof data | Testimonials appear static/hardcoded |

### Empty States

- N/A (marketing page)

---

## 2. Registration (`/register`)

### What Works

- Email/password registration
- Sets JWT cookie, redirects to dashboard/onboarding
- bcrypt cost 12

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **High** | No email verification | Anyone can register with any email |
| **Medium** | Default role `agency_owner` | New users get elevated platform role in DB |
| **Medium** | No plan selection at signup | User lands on free plan with no upgrade prompt context |
| **Low** | No password strength UI | Only server-side minimum |
| **Low** | `?plan=` query from pricing not wired | Pricing CTA passes plan param but register may ignore it |

### Dead Ends

- None — always redirects forward

---

## 3. Onboarding (`/onboarding`)

### What Works

- Multi-step wizard (business info, goals, brand voice)
- `OnboardingGate` forces completion before dashboard access
- AI-enhanced profile on `complete` action (credit-gated)

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **Critical** | `syncBrandKit` updates global `brandKit.findFirst()` | New user's onboarding can overwrite another user's brand kit |
| **High** | Forced onboarding blocks power users | No skip option; returning users with incomplete profile stuck |
| **High** | Extra network round-trip on every dashboard load | `OnboardingGate` fetches `/api/onboarding` on mount |
| **Medium** | Onboarding ≠ first value moment | User completes forms before seeing AI output |
| **Medium** | `save` action ungated | Partial saves work; `complete` costs 10 credits — unclear UX |
| **Low** | On API failure, gate allows through | `catch(() => setReady(true))` bypasses onboarding |

### Missing Onboarding

- No guided "generate your first post" step
- No connection to AI Employee flagship flow
- No workspace creation prompt

### Recommended Flow

```
Register → 30-second onboarding (goal only) → AI Employee autonomous demo → Full onboarding optional
```

---

## 4. Dashboard (`/dashboard`)

### What Works

- AI Employee flagship hero CTA (recent addition)
- Quick action cards to features
- Upgrade banner + credits banner in layout

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **High** | Stats are hardcoded/demo | "12 generations", "84 SEO score" — not real user data |
| **High** | Upcoming content is demo data | `getDemoCalendarEvents()` — misleading for new users |
| **Medium** | 40+ sidebar links — overwhelming | No progressive disclosure for new users |
| **Medium** | No "what to do next" for empty accounts | Beyond employee CTA, no personalized checklist |
| **Low** | Two agent-like features | Content Agent + AI Employee — confusing positioning |

### Empty States

| Screen | Empty State Quality |
|--------|---------------------|
| Dashboard stats | **Poor** — shows fake numbers |
| Calendar | Demo events mask empty state |
| Workspace | Seeds demo content on first visit |
| Clients | Global list, not user-scoped |

---

## 5. First AI Generation

### Paths Users Take

1. **AI Employee** (flagship) — goal → autonomous pipeline
2. **Content Agent** — chat-based
3. **Feature-specific** — Blog, LinkedIn, SEO, etc.

### What Works

- Credit gating on most generation routes
- Upgrade prompts on 402 responses
- Brand context injected in newer AI paths

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **Critical** | Credits charged before generation | Failed AI still burns credits — trust killer |
| **High** | No API keys → silent mock mode | User may think AI is live when seeing template output |
| **High** | Free plan = 100 credits | Full AI Employee autonomous run = ~12 credits; user may not understand costs |
| **Medium** | No generation progress for long ops | Blog/video/agent block UI with spinner only |
| **Medium** | Brand kit may be wrong tenant's | `findFirst` without userId in several routes |
| **Low** | Employee UI says "1 credit/step" but charges 2 | Misleading copy |

### Dead Ends

- Hitting credit limit mid-employee-run — autonomous pauses with 402; recovery unclear
- Mock AI output with no indicator — user saves/publishes template content unknowingly

---

## 6. Workspace

### What Works

- `Workspace` + `WorkspaceMember` model for multi-tenant teams
- Active workspace preference switching
- Role-based nav filtering

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **Critical** | Parallel team systems | `/dashboard/team` uses global `TeamMember`; `/dashboard/workspaces` uses proper model |
| **High** | Workspace switch doesn't update all views | Client state not invalidated on switch |
| **High** | Invited members can't switch workspace | `workspaces/switch` only checks `ownerId`, not membership |
| **Medium** | `workspace` vs `workspaces` naming | User confusion |
| **Medium** | Demo content seeded on first visit | User can't tell real vs demo content |

### Empty States

- Workspace content library — seeds demo items instead of helpful empty state

---

## 7. Publishing

### What Works

- Integration OAuth flow (LinkedIn, WordPress, Notion, Google Docs)
- Publishing service with encrypted credentials
- Attribution tracking on publish

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **High** | Three publishing UIs | Publishing Center, Integrations, LinkedIn Publishing, Extensions |
| **High** | Legacy `PublishConnection` vs `IntegrationConnection` | User may connect in one place, publish from another |
| **Medium** | Publish routes lack RBAC | `getSession()` only — viewers can publish |
| **Medium** | Scheduled posts not wired to calendar sync | Employee publishes to calendar; publish center is separate |
| **Low** | Demo LinkedIn connection seeded | Hardcoded demo identity in publish seed |

### Dead Ends

- Connect integration → no clear "publish your first post" CTA
- White-label portal — domain "verification" is fake (instant verified)

---

## 8. Billing

### What Works

- Full billing page with usage meters, plan cards, invoice history
- Stripe checkout + portal + webhooks
- Demo mode for dev without Stripe keys
- Upgrade banners throughout dashboard
- Team/agency billing panels

### Friction Points

| Priority | Issue | Detail |
|----------|-------|--------|
| **Critical** | Demo checkout grants paid plans free | If `STRIPE_SECRET_KEY` unset in prod, anyone upgrades for ₹0 |
| **High** | JWT plan stale after upgrade | User may still see old limits until re-login |
| **High** | Workflow credits bill member not owner | Team member on free plan runs expensive workflows |
| **Medium** | Pricing page says "Razorpay" but only Stripe implemented | Trust issue |
| **Medium** | Downgrade to free doesn't prorate/clearly explain data limits | |
| **Low** | Demo invoice history when DB empty | Masks "no invoices yet" empty state |

### Dead Ends

- Workspace member hits billing page — may see owner's billing (correct) but can't manage (403) — needs clearer messaging

---

## Priority Matrix

### Critical (Block launch)

| # | Issue | Journey |
|---|-------|---------|
| 1 | Onboarding overwrites global brand kit | Onboarding |
| 2 | Demo checkout free upgrades in prod | Billing |
| 3 | Credits charged before AI success | First generation |
| 4 | Global clients/team data leak | Workspace |

### High

| # | Issue | Journey |
|---|-------|---------|
| 5 | Dashboard shows fake stats | Dashboard |
| 6 | No email verification | Registration |
| 7 | Three publishing systems | Publishing |
| 8 | Forced long onboarding | Onboarding |
| 9 | Mock AI without clear indicator | First generation |
| 10 | Default role `agency_owner` for all new users | Registration |

### Medium

| # | Issue | Journey |
|---|-------|---------|
| 11 | 40+ nav items overwhelm new users | Dashboard |
| 12 | No first-post guided flow | Onboarding |
| 13 | Workspace switch UX | Workspace |
| 14 | Plan param from pricing not honored | Registration |
| 15 | Employee credit copy mismatch | First generation |

### Low

| # | Issue | Journey |
|---|-------|---------|
| 16 | Static testimonials | Landing |
| 17 | Demo calendar on dashboard | Dashboard |
| 18 | Razorpay mention on pricing | Billing |
| 19 | Onboarding skip not available | Onboarding |
| 20 | White-label fake domain verify | Publishing |

---

## Recommended "Golden Path" for Launch

```
Landing → Register (email verify) → Goal-only onboarding (30s)
  → AI Employee autonomous run → Review & approve → Publish to calendar
  → Upgrade prompt at 80% credits → Stripe checkout
```

This path should be tested end-to-end weekly as the launch smoke test.

---

*See `INKFIT_AI_MASTER_AUDIT.md` for consolidated priorities.*
