# InkFit AI — Database Audit

**Date:** June 2026  
**ORM:** Prisma 6.x  
**Database:** PostgreSQL (production); schema supports SQLite patterns in dev  
**Models:** 45+ tables

---

## Executive Summary

The Prisma schema is **broad and feature-complete** but lacks **relational integrity**, **tenant isolation**, and **performance indexes** needed for production multi-tenancy. Several models are **orphaned** or **duplicated**, and heavy use of **JSON string columns** limits queryability.

**Database readiness: 5/10**

---

## 1. Schema Overview

### Model Categories

| Category | Models | Tenant Scoped? |
|----------|--------|----------------|
| Auth & users | `User` | Yes |
| Billing | `Subscription`, `BillingEvent`, `Invoice`, `CreditUsage` | Per userId |
| Workspace | `Workspace`, `WorkspaceMember`, `UserWorkspacePreference` | Yes |
| Content | `GeneratedContent`, `WorkspaceContent`, `CalendarEvent` | Partial |
| AI & agent | `AgentConversation`, `AgentMessage`, `MarketingEmployeeRun`, `AiGenerationLog` | Per userId |
| Integrations | `IntegrationConnection`, `IntegrationPublishLog` | Per userId |
| Attribution | `ContentAttribution`, `AttributionInsight` | Per userId (indexed) |
| Legacy/orphan | `Usage`, `PlatformConnection`, `TeamWorkspace`, `TeamMember` | **No / global** |
| Agency | `AgencyClient` | **No userId** |

---

## 2. Relationship Gaps

### Missing Foreign Keys

Prisma schema uses **string IDs without `@relation`** on most models. No referential integrity at DB level.

| Model | Field | Should Reference |
|-------|-------|------------------|
| `Subscription` | `userId` | `User.id` |
| `WorkspaceMember` | `workspaceId`, `userId` | `Workspace.id`, `User.id` |
| `GeneratedContent` | `userId`, `workspaceId` | `User.id`, `Workspace.id` |
| `CalendarEvent` | `userId`, `workspaceId` | `User.id`, `Workspace.id` |
| `CampaignItem` | `campaignId` | `Campaign.id` |
| `AgentMessage` | `conversationId` | `AgentConversation.id` ✅ (only cascade) |
| `MarketingEmployeeRun` | `userId` | `User.id` |
| `IntegrationConnection` | `userId` | `User.id` |
| `CreditUsage` | `userId` | `User.id` |
| `Invoice` | `userId` | `User.id` |

**Impact:** Orphan rows on user deletion; no DB-enforced consistency.

### Only Cascade Delete

```prisma
AgentMessage → AgentConversation (onDelete: Cascade)
```

All other models require manual cleanup or will orphan.

---

## 3. Multi-Tenant Isolation Issues

### Critical

| Model | Issue | Code Reference |
|-------|-------|----------------|
| `AgencyClient` | **No `userId` or `workspaceId`** — global shared table | `api/clients/route.ts` |
| `TeamMember` | **No `userId`/workspace scope** — singleton team for all users | `api/team/route.ts` |
| `TeamWorkspace` | Global singleton | `api/team/route.ts` |
| `BrandKit` | `userId` optional — `findFirst` without filter leaks cross-tenant | `ai/context.ts` |

### High

| Model | Issue |
|-------|-------|
| `CalendarEvent` | `userId` optional |
| `WorkspaceContent` | `workspaceId` optional — content may float outside workspace |
| `GeneratedContent` | `workspaceId` optional |

---

## 4. Indexes

### Existing Indexes (Good)

```prisma
BillingEvent        @@index([userId, createdAt])
IntegrationConnection @@index([userId])
IntegrationPublishLog @@index([userId, provider])
ContentAttribution  @@index([userId]), @@index([userId, status]), @@index([userId, topic])
```

### Missing Indexes (Recommended)

| Model | Index | Reason |
|-------|-------|--------|
| `GeneratedContent` | `[userId, createdAt]` | List user content |
| `GeneratedContent` | `[workspaceId, createdAt]` | Workspace content library |
| `CalendarEvent` | `[userId, date]` | Calendar queries |
| `MarketingEmployeeRun` | `[userId, updatedAt]` | Recent missions list |
| `CreditUsage` | `[userId, month]` | Already unique — OK |
| `AiGenerationLog` | `[userId, createdAt]` | Usage analytics |
| `AiGenerationLog` | `[feature, createdAt]` | Feature cost analysis |
| `Invoice` | `[userId, createdAt]` | Billing history |
| `Workflow` | `[userId, updatedAt]` | User workflows |
| `KnowledgeDocument` | `[userId, category]` | KB filtering |
| `Subscription` | `[stripeCustomerId]` | Webhook lookups |
| `Subscription` | `[stripeSubscriptionId]` | Webhook lookups |
| `User` | `[email]` | Already unique — OK |

---

## 5. Data Integrity

### String Enums (No DB Constraint)

Status fields stored as free strings:

- `Subscription.status` — "active", "canceled", "past_due", "trialing"
- `MarketingEmployeeRun.status` — "active", "review", "completed", "paused"
- `IntegrationConnection.status` — "connected", "disconnected", etc.
- `ContentAttribution.status` — "generated", "published", etc.

**Risk:** Typos in application code create invalid states.  
**Fix:** Prisma enums or check constraints.

### JSON-in-String Columns

| Model | Field | Problem |
|-------|-------|---------|
| `Workflow` | `nodes`, `edges`, `input` | Can't query workflow content |
| `MarketingEmployeeRun` | `messages`, `steps` | Large blobs, no partial update |
| `BrandVoiceProfile` | `profileData` | |
| `MarketingOSPlan` | `data` | |
| `OnboardingProfile` | `generatedData`, `contentGoals` | |
| `CalendarEvent` | `metadata` | |
| `GeneratedContent` | `metadata` | |
| `WhiteLabelSettings` | `logoDataUrl` | Up to 600KB in row |
| `AttributionInsight` | `highlights` | |

**Impact:** No indexing, parse failures, large row sizes, migration difficulty.

### Duplicate / Conflicting Models

| Concept | Model A | Model B | Model C |
|---------|---------|---------|---------|
| Team | `TeamWorkspace` + `TeamMember` | `Workspace` + `WorkspaceMember` | — |
| Publishing | `PublishConnection` + `ScheduledPost` | `IntegrationConnection` + `IntegrationPublishLog` | `ExtensionIntegration` |
| Connections | `PlatformConnection` (orphan) | `PublishConnection` | `IntegrationConnection` |
| Usage tracking | `Usage` (global monthly) | `CreditUsage` (per user) | `AiGenerationLog` |

---

## 6. Cascade Delete Strategy

### Recommended on User Delete

```
User deleted →
  CASCADE: Subscription, CreditUsage, Invoice, BillingEvent,
           AgentConversation (+ messages), MarketingEmployeeRun,
           IntegrationConnection, GeneratedContent, BrandKit,
           OnboardingProfile, ReferralProfile, WhiteLabelSettings
  SET NULL: CalendarEvent.workspaceId (or CASCADE)
  BLOCK: If workspace owner with members (require transfer)
```

### Current State

No `onDelete` policies — user deletion would orphan all related data or fail if FKs added without strategy.

---

## 7. Performance Concerns

| Pattern | Location | Issue |
|---------|----------|-------|
| `deleteMany` + loop `create` | `syncCalendarPlan()` | Not transactional; slow |
| `findFirst` without index | Brand kit, many routes | Full table scan |
| No pagination | `clients`, `team` members | Returns all rows |
| N+1 queries | `countSeatsForUser()` | Loops workspaces |
| Large JSON parse | Employee run load | Parse entire steps/messages blob |

---

## 8. Orphan / Dead Models

| Model | Status | Recommendation |
|-------|--------|----------------|
| `Usage` | No code references | Delete or migrate to `CreditUsage` |
| `PlatformConnection` | No code references | Delete |
| `TeamWorkspace` | Used only by legacy team route | Deprecate after migration |
| `TeamMember` | Global singleton | Deprecate after migration |

---

## 9. Schema Improvement Recommendations

### P0 — Before Launch

1. **Add `userId` to `AgencyClient`** with `@@index([userId])`
2. **Deprecate `TeamMember`/`TeamWorkspace`** — migrate to `WorkspaceMember`
3. **Make `BrandKit.userId` required** — remove global fallback queries
4. **Add indexes** on `GeneratedContent`, `CalendarEvent`, `MarketingEmployeeRun`, `Invoice`
5. **Add `StripeWebhookEvent` table** for idempotency (`eventId` unique)

### P1 — First Month Post-Launch

6. Add Prisma `enum` types for status fields
7. Add `onDelete: Cascade` relations from `User`
8. Add `workspaceId` to `AgencyClient`, `Campaign`, `ImageStudioItem`
9. Normalize `MarketingEmployeeRun.steps` into `EmployeeRunStep` table (optional, for analytics)
10. Add `@@index([stripeCustomerId])` on `Subscription`

### P2 — Scale Phase

11. Extract workflow `nodes`/`edges` to relational tables
12. Move `logoDataUrl` to object storage (S3), store URL only
13. Partition `AiGenerationLog` by month
14. Read replicas for analytics queries
15. Materialized views for attribution dashboards

---

## 10. Migration Script Priorities

```sql
-- Example P0 migrations (conceptual)

ALTER TABLE "AgencyClient" ADD COLUMN "userId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "AgencyClient_userId_idx" ON "AgencyClient"("userId");

CREATE TABLE "StripeWebhookEvent" (
  "id" TEXT PRIMARY KEY,
  "eventId" TEXT UNIQUE NOT NULL,
  "processedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "GeneratedContent_userId_createdAt_idx"
  ON "GeneratedContent"("userId", "createdAt" DESC);

CREATE INDEX "MarketingEmployeeRun_userId_updatedAt_idx"
  ON "MarketingEmployeeRun"("userId", "updatedAt" DESC);
```

Run via `prisma db push` or proper migrations before production deploy.

---

## 11. Future Scalability

| Scale Trigger | Action |
|---------------|--------|
| 1K users | Indexes + tenant isolation fixes |
| 10K users | Background jobs, connection pooling (PgBouncer) |
| 50K users | JSON column normalization, read replicas |
| 100K+ users | Workspace-level sharding, separate analytics DB |

---

*See `INKFIT_AI_MASTER_AUDIT.md` for prioritized action items.*
