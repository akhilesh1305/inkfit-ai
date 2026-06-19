# InkFit AI — Beta Cohort (50–100 users)

Controlled launch to validate activation, pricing, and willingness to pay before paid acquisition.

## Goals (Week 4)

| Signal | Target |
|--------|--------|
| Activation (completes AI Employee run) | ≥ 40% of beta signups |
| Would pay (survey) | ≥ 30% "yes" or "probably" |
| NPS | ≥ 30 |
| Critical bugs | 0 open P0 at end of beta week |

## Cohort profile

- **Size**: 50–100 founders, creators, or small agency leads
- **Geo**: India-first (INR pricing); English UI
- **Invite**: Personal email + unique signup link with `?plan=creator` optional

## Onboarding script

1. Welcome email with link: `https://inkfit-ai-livid.vercel.app/register`
2. Ask them to complete **Quick Onboarding** (2 min)
3. Run **AI Marketing Employee** with a real business goal
4. Optional: schedule 15-min feedback call for first 20 users

## What to measure

Track in spreadsheet or analytics:

| Event | Definition |
|-------|------------|
| Signup | Account created |
| Onboarding complete | `quick_complete` or onboarding API `completed: true` |
| Employee started | First `POST /api/employee` |
| Employee finished | Run status `completed` or published |
| Upgrade intent | Visited `/dashboard/billing` |
| Paid | Stripe checkout or demo upgrade in staging only |

## Weekly survey (Google Form / Typeform)

1. NPS: 0–10 — How likely to recommend InkFit AI?
2. Did the AI Employee deliver value on your first session? (Yes / Partially / No)
3. Would you pay ₹999/mo for Creator? (Yes / Maybe / No)
4. Biggest friction (free text)
5. Missing feature (free text)

## Feedback loop

- **Monday**: Review top 3 friction points from survey + support
- **Wednesday**: Ship one small fix or copy change
- **Friday**: Share changelog with beta cohort

## Support

- Single channel: email or Slack community
- Response SLA: < 24h weekdays
- Escalate billing bugs to on-call (see [PRODUCTION_RUNBOOK.md](./PRODUCTION_RUNBOOK.md))

## Exit criteria (graduate from beta)

- [ ] ≥ 40% activation on AI Employee
- [ ] ≥ 5 paid conversions (or strong "would pay" signal)
- [ ] No open P0 security/revenue leaks
- [ ] Runbook dry-run completed on staging

## Do not

- Enable `BILLING_DEMO_MODE` on production for beta users
- Share super-admin credentials
- Commit `.env` or API keys to the repo
