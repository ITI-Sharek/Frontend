# Share-k — Open Questions

> **Status update (2026-07-12)**: the original P/D/T/C question set was **resolved by the approved MVP decision batch** — binding summaries live in `docs/governance/decision-log.md` (DEC-001…022); conflicts in `docs/governance/conflict-register.md`. The resolution map is kept below for traceability, followed by the questions that remain genuinely open.

## Resolution map

| Question | Resolution |
|---|---|
| OQ-P1 single role | DEC-001 — one active `primary_role`, future multi-role compatible; copy never says "never" |
| OQ-P2 rejected profiles | DEC-002 — eligibility restriction, not deactivation; browse/dispute/re-analyze allowed |
| OQ-P3 owner invitations | DEC-003 — lightweight `task_invitations`; never bypasses validation/quota |
| OQ-P4 application staleness | DEC-004 — 7-day expiry; day-3 nudge, day-5 overdue, day-7 `EXPIRED`; no reputation harm |
| OQ-P5 non-selected applicants | DEC-005 — auto-close as `NOT_SELECTED`, distinct from `REJECTED_BY_OWNER` |
| OQ-P6 quota consumption | DEC-006 — consumed when AI validation starts; refund on technical failure; idempotency keys |
| OQ-P7 / OQ-D2 public read | DEC-007 — `/explore`, `/projects/:slug`, `/tasks/:id`, `/profile/:username` public; field lists locked |
| OQ-D1 visual direction | DEC-008 — **Registry** selected; bilingual copy in brand moments only |
| OQ-D3 owner inbox | DEC-009 — dashboard "Needs your decision" section; no `/inbox` route in MVP |
| OQ-D4 fit hints | DEC-010 — approved; backend-computed; coverage buckets; mandatory disclaimer; no percentages |
| OQ-D5 review SLA | DEC-011 — 48h target; aging bands to 72h+ critical; admin metrics defined |
| OQ-T1 forgot password | DEC-012 — backend endpoints approved and specified |
| OQ-T2 review_needed | DEC-013 — persisted `REVIEW_NEEDED` status + `VALIDATION_FAILED`; admin resolves, never owner |
| OQ-T3 Arabic glossary | DEC-014 — controlled glossary adopted (`arabic-glossary.md`) |
| OQ-T4 analysis progress | DEC-015 — `GET /ingestions/:id` polling contract, 13 stages, 4-state fallback |
| OQ-T5 fit-hint contract | DEC-010 — backend authoritative; response shape locked |
| OQ-T6 / C2 username | DEC-016 — platform-owned `users.username` canonical |
| C1 architecture modules | DEC-017 — post-MVP; MVP module list locked |
| C3 profile visibility | DEC-007 |
| C4 master-brief | DEC-018 — superseded notice added |
| C5 port drift | DEC-019 — backend 4000 standard; residual CR-05 below |
| C6 source hierarchy | DEC-020 — `docs/governance/source-of-truth.md` |

## Residuals — resolved by batch 2 (2026-07-12, DEC-023…028)

| Residual | Resolution |
|---|---|
| OQ-R1 frontend port | DEC-023 — frontend stays **3001** (deliberate repo decision); supersedes DEC-019's 3000 row |
| OQ-R2 `/api` prefix | DEC-024 — routes stay **unprefixed**; `API_BASE_URL=http://localhost:4000`; future prefix = explicit decision only |
| OQ-R3 payments (PRD OQ-002) | DEC-026 — no payment provider in MVP; entitlements independent of payments; `subscription_source` DEFAULT/ADMIN/DEMO; copy "Plan purchasing is not available during the MVP preview." |
| OQ-R4 Figma URL | DEC-027 — formally "Pending human confirmation" placeholder in source-of-truth.md; no URL invented |
| OQ-R5 project slug | DEC-025 — platform-owned `projects.slug` (`slug_normalized` unique, immutable after publication); `/projects/:projectSlug` stands |

## Still open

- **Canonical Figma URL value** — the *entry* is resolved (DEC-027 placeholder); the actual URL + approved page/section still needs to be supplied by a human and recorded using the DEC-027 template.
- **Post-MVP payment provider choice** — deliberately deferred behind the `PaymentProvider` interface (DEC-026).
