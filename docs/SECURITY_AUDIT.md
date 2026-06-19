# InkFit AI — Security Audit

**Date:** June 2026  
**Scope:** Authentication, API routes, uploads, billing, admin, workspace permissions  
**Classification:** Internal — contains vulnerability details

---

## Executive Summary

InkFit AI has a **layered security design** (middleware JWT, RBAC matrix, encrypted OAuth tokens, Stripe signature verification) but **inconsistent enforcement** creates exploitable gaps. **Four critical issues** must be fixed before accepting paying customers.

**Security score: 4/10** (current) → **8/10** (target after P0 fixes)

---

## 1. Authentication

### Implementation

| Component | Path | Mechanism |
|-----------|------|-----------|
| Session | `lib/auth.ts` | HS256 JWT, 7-day expiry, httpOnly cookie |
| Password | `lib/auth.ts` | bcrypt cost 12 |
| Middleware | `middleware.ts` | Edge JWT verify on `/api/*` and protected pages |
| Context | `lib/auth-guard.ts` | DB role reload, workspace resolution |

### Vulnerabilities

| Severity | Issue | Path |
|----------|-------|------|
| **Critical** | Hardcoded `AUTH_SECRET` fallback: `"inkfit-dev-secret-change-in-production"` | `middleware.ts:29`, `auth.ts:22`, `oauth-state.ts:11` |
| **Critical** | Dev mode promotes **all users to `super_admin`** | `auth-guard.ts:36-46`, `admin.ts:173-178` |
| **High** | JWT `platformRole` stale — demoted admin retains `/admin` UI access | `middleware.ts` vs `auth-guard.ts` |
| **High** | `normalizePlatformRole()` defaults unknown → `agency_owner` | `rbac.ts:71-77` |
| **Medium** | No CSRF protection on cookie-authenticated POST | All API routes |
| **Medium** | JWT embeds `plan` — stale after Stripe upgrade | `auth.ts` |
| **Low** | No password max length (bcrypt DoS edge case) | `register/route.ts` |

---

## 2. API Route Protection Matrix

### Intentionally Public

| Route | Risk | Verdict |
|-------|------|---------|
| `/api/auth/login` | Brute force | **Needs rate limit** |
| `/api/auth/register` | Spam accounts | **Needs rate limit** |
| `/api/billing/webhook` | Forged events | ✅ Signature verified |
| `/api/demo` | **Unauthenticated AI** | **CRITICAL — remove or gate** |
| `/api/integrations/oauth/*/callback` | Token theft | ✅ State JWT verified |

### Missing RBAC (authenticated, no permission check)

Routes using `getSession()` only — **viewers can write**:

| Route | Write Actions |
|-------|---------------|
| `extensions/route.ts` | toggle-integration, add/remove website |
| `templates/route.ts` | favorite, use |
| `trends/route.ts` | generate-content |
| `projects/route.ts` | full campaign CRUD |
| `publish/route.ts` | connect, create, update, delete |
| `publish/linkedin/route.ts` | all mutations |
| `prompts/route.ts` | create/update/delete |
| `workflows/route.ts` | create/save/delete/run |
| `referrals/route.ts` | copy-track |
| `onboarding/route.ts` | save (complete is gated) |
| `workspaces/route.ts` | switch workspace |
| `clients/route.ts` | **global IDOR — no userId scope** |

### Partial Auth

| Route | Issue |
|-------|-------|
| `integrations/oauth/[provider]/route.ts` | POST has **no auth** (line 46) |

### Ungated AI (middleware auth only)

| Route | Credits | RBAC |
|-------|---------|------|
| `marketing-strategy/route.ts` | No | No |
| `website-generator/route.ts` | No | No |
| `competitor/route.ts` | No | No |
| `attribution/route.ts` | **AI insights ungated** | Partial |

**~22 routes** lack proper RBAC beyond middleware session check.

---

## 3. RBAC Implementation

### Strengths

- Typed permissions in `rbac.ts` (`ai:generate`, `platform:billing`, `settings:team`, etc.)
- `requirePermission()` used in newer routes
- Middleware blocks viewers on `VIEWER_BLOCKED_WRITE_PATHS`
- Nav filtered client-side via `nav-access.ts`

### Gaps

| Gap | Impact |
|-----|--------|
| API enforcement inconsistent with middleware | Viewer bypass via unguarded routes |
| Nav hiding ≠ API security | UI suggests safety that doesn't exist |
| No workspace-role check on many content routes | Member can access owner-only actions |
| `platform:billing` not checked on credit-consuming routes | Uses `ai:generate` instead (broader) |

---

## 4. File Uploads

No server-side multipart. Client extracts text, sends JSON.

| Flow | Path | Risk |
|------|------|------|
| Knowledge upload | `knowledge/route.ts` | Text only, 100k char limit — **Low** |
| Brand voice files | Client-side PDF/DOCX parse | **Low** |
| White-label logo | `white-label/route.ts` | `logoDataUrl` stored without MIME validation — **Medium XSS** via `data:image/svg+xml` |
| Knowledge URL import | `knowledge/route.ts` | **SSRF** — fetches arbitrary URLs server-side |

### SSRF Detail

`import-url` action fetches user-supplied URLs without blocklist for:
- `169.254.169.254` (cloud metadata)
- `10.x`, `172.16.x`, `192.168.x` (internal networks)
- `localhost`, `127.0.0.1`

**Severity: High**

---

## 5. Billing Security

| Check | Status |
|-------|--------|
| Stripe webhook signature | ✅ Pass |
| Raw body before parse | ✅ Pass |
| Checkout requires auth + `platform:billing` | ✅ Pass |
| Billing owner check on mutations | ✅ Pass |
| Webhook idempotency | ❌ Missing — retries double-apply |
| Demo checkout in production | ❌ **Free paid plans if Stripe unset** |
| `userId` in checkout metadata | ✅ Server-set — not user-controlled |

---

## 6. Admin Routes

| Control | Status |
|---------|--------|
| `/admin` page | Middleware JWT role (stale risk) |
| `/api/admin` | `requireAdmin()` from DB ✅ |
| `update-role` action | **No allowlist on `platformRole` value** — High |
| `update-plan` action | No plan enum validation — Medium |
| Demo KPIs on DB error | Low (admin already authenticated) |

---

## 7. Workspace Permissions

| Check | Status |
|-------|--------|
| `resolveWorkspaceRole()` caps member below owner | ✅ |
| `requireWorkspaceMember()` | ✅ (where used) |
| Workspace switch validates membership | ❌ Owner-only check |
| Content scoped to active workspace | Partial — many queries use `userId` only |
| Billing context resolves to owner | ✅ |

---

## 8. OAuth & Credential Storage

| Aspect | Assessment |
|--------|------------|
| Algorithm | AES-256-GCM ✅ |
| Key derivation | scryptSync with static salt — Medium |
| Key fallback chain | `INTEGRATION_ENCRYPTION_KEY` → `AUTH_SECRET` → hardcoded dev string — **Critical in misconfigured prod** |
| OAuth state | Signed JWT, 15m TTL, nonce ✅ |
| Token storage | Encrypted at rest ✅ |

---

## 9. Rate Limiting

| Location | Scope | Effective? |
|----------|-------|------------|
| `ai/providers.ts` | 40 req/min in-memory | ❌ Not on API routes; not multi-instance |
| Login/register | None | ❌ Brute force possible |
| `/api/demo` | None | ❌ Critical |
| Stripe webhook | None | Low (Stripe-controlled) |
| Per-user API | None | ❌ |

---

## 10. Input Validation

- **No Zod or schema library** in dependencies
- Widespread `as Type` casts on request bodies
- AI JSON output parsed without schema validation
- Admin `platformRole` accepted from client without allowlist

---

## 11. Sensitive Data Exposure

| Vector | Detail |
|--------|--------|
| Error messages | `String(e)` returned to clients on 500s — stack/internal details |
| Stripe webhook errors | 400 with error string |
| Demo API | Exposes AI capability without auth |
| `logoDataUrl` | Stored SVG can execute in `<img>` context in some browsers |

---

## 12. Remediation Priority

### P0 — Before any paying customer

1. Remove all hardcoded secret fallbacks; fail fast in production
2. Disable dev auto-super-admin outside explicit dev config
3. Gate or remove `/api/demo`
4. Add `userId` to `AgencyClient`; scope all queries
5. Block `applyDemoCheckout` in production unless explicit flag

### P1 — First week post-launch

6. Migrate all write routes to `gateAuth`/`requirePermission`
7. Add login/register rate limiting (Upstash Redis or Vercel KV)
8. SSRF blocklist on knowledge URL import
9. Validate `logoDataUrl` MIME (png/jpeg/webp only)
10. Stripe webhook idempotency table
11. Admin role assignment allowlist

### P2 — First month

12. CSRF tokens or SameSite=Strict + custom header pattern
13. Zod schemas for all POST bodies
14. Reload `platformRole` from DB in middleware
15. Per-user API rate limits
16. Security headers (CSP, HSTS) in `next.config`

---

## 13. Compliance Notes (for 1K paying customers)

| Requirement | Status |
|-------------|--------|
| Data isolation per tenant | ❌ Critical gaps |
| Encryption at rest (tokens) | ✅ |
| Encryption in transit | ✅ (HTTPS) |
| Audit log for admin actions | ❌ |
| Data export/deletion (GDPR) | ❌ No user deletion flow |
| PCI compliance | ✅ (Stripe handles cards) |

---

*See `INKFIT_AI_MASTER_AUDIT.md` for business-prioritized action items.*
