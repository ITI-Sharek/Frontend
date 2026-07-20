# Share-k — Product State Model **v2 (approved)**

> **Contributor policy correction (DEC-030–DEC-035, 2026-07-20):** the task/application AI gate, `eligible`/`ineligible` contributor outcomes, `BLOCKED_INELIGIBLE` as an AI conclusion, contributor quotas, and Gold-only contributor guidance in this document are superseded. Use advisory fit, owner final selection, contextual access, and the contract-gated journey in `contributor-experience-brief.md`. The remaining state model must be reconciled before task/application implementation.

> **Version note**: v2 supersedes the v1 ERD-only model (DEC-021, 2026-07-12). The states below are the **approved product states** — the ERD/schema must migrate to match (`bmad/_bmad-output/ERD/_MVP-DECISION-DELTA.md`). States previously tagged [Proposed] that were approved are now normative; anything still not approved was dropped.
>
> Visual priority: **Blocking** (owns the screen) > **Attention** (badge/banner) > **Info** (chip) > **Quiet** (muted/history).
> Labels en / ar follow the controlled glossary (`arabic-glossary.md`, DEC-014). UI copy uses only the active language (DEC-008).

---

## 1. Contributor profile (DEC-002, §5)

Approved profile-level machine (persisted or deterministically derived per backend design; the *machine* is the contract):

```
NOT_STARTED → INGESTION_QUEUED → INGESTING → PENDING_ADMIN_REVIEW → APPROVED | PARTIALLY_APPROVED | REJECTED
                                   ↓                                            ↓ (re-analysis)
                              ANALYSIS_FAILED                          REANALYSIS_REQUESTED → INGESTION_QUEUED
SUSPENDED — admin action, any time
```

Plus per-skill statuses (unchanged, confirmed): `pending | approved | rejected | disputed`.
Derived `contributor_eligibility_status` for authorization: `PENDING_PROFILE_REVIEW · VERIFIED · PROFILE_REJECTED · REANALYSIS_IN_PROGRESS · SUSPENDED`.

| State | Label en / ar | Meaning · visibility | Actions / recovery | Priority | Notification |
|---|---|---|---|---|---|
| NOT_STARTED | Connect GitHub / اربط حساب GitHub | No GitHub connected; owner-only view | Connect | Blocking (onboarding) | — |
| INGESTION_QUEUED | Queued for analysis / في انتظار التحليل | Accepted, not started | Wait; leave-and-notify | Info | — |
| INGESTING | Analyzing… / جارٍ التحليل | Staged progress via ingestion contract (DEC-015) | Wait | Info / Blocking in onboarding | on completion |
| ANALYSIS_FAILED | Analysis failed / تعذّر التحليل | Terminal technical failure | **Retry**, support | Attention | `system` |
| PENDING_ADMIN_REVIEW | In review / قيد المراجعة | Human gate; copy: "Most profile reviews are completed within 48 hours." (DEC-011) | Explore meanwhile; applying gated | Attention until resolved | `skill_review` on decision |
| APPROVED | Verified / موثَّق | All reviewed skills usable; eligibility = VERIFIED | — | Positive moment | `skill_review` |
| PARTIALLY_APPROVED | Partially verified / موثَّق جزئيًا | **May apply using approved skills only** (§5 rule) | Review rejected skills → dispute or improve | Attention once | `skill_review` |
| REJECTED | Not verified / غير موثَّق | **Eligibility restriction, not account deactivation** (DEC-002): may browse, view reasons, re-analyze, dispute, edit profile; may not apply / be matched / appear verified | Dispute · re-analyze after meaningful GitHub changes | Attention | `skill_review` |
| REANALYSIS_REQUESTED | Re-analysis requested / طلب إعادة التحليل | Regeneration queued; current approved skills stay active until review completes | Wait | Info | on completion |
| SUSPENDED | Suspended / موقوف | Admin trust action (`USER.status`) | Contact support | Blocking | `system` |

**Qualification rules (§5, binding)**: only approved skills qualify. Pending, rejected, disputed, and unapproved low-confidence skills never qualify for eligibility or matching.

---

## 2. Project (unchanged from ERD)

`draft → published → archived`, with transient import UI states (importing, import-failed with distinct causes). The previously proposed `paused` and `unarchive` states were **not approved** — dropped from the model. Reopening/major lifecycle additions are post-MVP.

---

## 3. Contribution request (§5 approved)

```
DRAFT → PUBLISHED → ASSIGNED → IN_PROGRESS → AWAITING_DELIVERY → DELIVERY_SUBMITTED → COMPLETED
   └──────────────┴─── CANCELLED (owner, any pre-completion point; reopen = explicit owner action)
PUBLISHED → EXPIRED (deadline passes unassigned — approved state)
```

| State | Label en / ar | Rules · actions | Priority | Notification |
|---|---|---|---|---|
| DRAFT | Draft / مسودة | Owner-only; edit, publish (quota-checked), delete | Info | — |
| PUBLISHED | Open for applications / متاح للتقديم | Only state accepting applications | Info | owner: eligible application arrives |
| ASSIGNED | Assigned / تم إسناده | Acceptance moment; **other pending applications → NOT_SELECTED automatically** (DEC-005); closed to new applications | Attention (accepted contributor) | `application_status` all applicants |
| IN_PROGRESS / AWAITING_DELIVERY | In progress / قيد التنفيذ · Awaiting delivery / بانتظار التسليم | Work phase; UI may render these as one composed phase with the delivery panel | Info | — |
| DELIVERY_SUBMITTED | Delivery submitted / تم تسليم العمل | Owner review pending (delivery machine §4 drives detail) | Attention (owner) | `delivery_update` |
| COMPLETED | Completed / مكتمل | Requires approved delivery; reputation event fires | Quiet | `delivery_update` |
| CANCELLED | Cancelled / ملغى | Any pre-completion point; applicants notified with impact; **reopen requires explicit owner action** | Quiet / Attention to affected | `application_status` |
| EXPIRED | Expired / منتهي الصلاحية | Deadline passed without assignment | Owner: republish with new deadline | Quiet | owner `system` |

---

## 4. Application (DEC-004/005/006/013, §5 approved)

```
(submit → quota consumed when validation starts, DEC-006)
PENDING_VALIDATION ─ eligible ──────→ PENDING_OWNER_REVIEW ─ accept → ACCEPTED
        │                                  │                  ├ reject → REJECTED_BY_OWNER
        ├─ ineligible → BLOCKED_INELIGIBLE │                  ├ another chosen → NOT_SELECTED
        ├─ low confidence → REVIEW_NEEDED ─┤ (admin resolves) └ 7 days → EXPIRED
        │        └ REJECT_ELIGIBILITY → BLOCKED_INELIGIBLE
        └─ technical failure → VALIDATION_FAILED (quota refunded)
WITHDRAWN — contributor, before acceptance
```

| State | Label en / ar | Meaning · rules | Actions | Priority | Notification |
|---|---|---|---|---|---|
| PENDING_VALIDATION | Checking eligibility / قيد التحقق | AI validating; quota already consumed (copy shown pre-submit: "uses 1 of your daily application attempts, even if the eligibility check does not pass") | Wait | Info (live) | — |
| REVIEW_NEEDED | Needs review / يحتاج إلى مراجعة | **Persisted status** (DEC-013). Low-confidence → admin/support queue, never the owner. Attempt stays reserved (DEC-006). Fields: review_reason, review_queue_entered_at, reviewed_by, review_resolution | Wait; admin resolves → PENDING_OWNER_REVIEW or BLOCKED_INELIGIBLE | Info | on resolution |
| PENDING_OWNER_REVIEW | Sent to owner / أُرسل إلى صاحب المشروع | The only state in the owner's normal review queue. Aging: day-3 owner nudge, day-5 overdue in dashboard, day-7 expiry (DEC-004). `review_due_at` set on entry | Contributor: withdraw · Owner: accept/reject | Info / **Attention (owner, escalating)** | `application_status` |
| BLOCKED_INELIGIBLE | Not eligible yet / غير مؤهل حاليًا | Never reaches owner; reason always shown; Gold → gap guidance | See why + alternatives · dispute | Attention | `application_status` |
| VALIDATION_FAILED | Check failed — try again / تعذّر التحقق — حاول مجددًا | **Technical outcome, not an eligibility rejection**; quota auto-refunded (DEC-006) | Retry (new attempt, refunded) | Attention | `system` |
| ACCEPTED | Accepted — start working / مقبول — ابدأ العمل | Assignment; delivery expected | Submit PR link | **Attention (contributor)** | `application_status` |
| REJECTED_BY_OWNER | Not selected by owner / رفض من صاحب المشروع | Explicit owner decision; optional reason | Apply elsewhere | Info → Quiet | `application_status` |
| NOT_SELECTED | Not selected / لم يتم الاختيار | **Distinct from rejection** (DEC-005): another contributor chosen; copy: "Another contributor was selected for this request. This does not affect your eligibility status or reputation." | Apply elsewhere | Info → Quiet | `application_status` |
| EXPIRED | Expired / منتهي الصلاحية | 7-day owner silence or request closed (DEC-004); no reputation harm; not restorable; may reapply (new quota) if still open | Reapply if open | Info → Quiet | `application_status` (contributor) |
| WITHDRAWN | Withdrawn / تم السحب | Contributor exit before acceptance | — | Quiet | owner informed |

---

## 5. Delivery (§5 approved)

```
NOT_STARTED → SUBMITTED → (owner review) → APPROVED | CHANGES_REQUESTED | REJECTED
                                CHANGES_REQUESTED → RESUBMITTED → (owner review) …
```

| State | Label en / ar | Rules | Priority | Notification |
|---|---|---|---|---|
| NOT_STARTED | Awaiting delivery / بانتظار التسليم | Accepted application, no PR yet; deadline visible | Info | — |
| SUBMITTED | Submitted / العمل المُسلَّم — بانتظار المراجعة | PR link + notes in; **a submitted PR alone never counts as completion** (§5) | Attention (owner) | `delivery_update` |
| CHANGES_REQUESTED | Changes requested / مطلوب تعديلات | Preferred before final rejection (§5); feedback required; history preserved | **Attention (contributor)** | `delivery_update` |
| RESUBMITTED | Resubmitted / أُعيد التسليم | Back to owner review | Attention (owner) | `delivery_update` |
| APPROVED | Approved ✓ / معتمد ✓ | Rating 1–5 required; **only approved deliveries create completed-contribution reputation events** | Positive moment | `delivery_update` |
| REJECTED | Not approved / غير معتمد | Reason required; dispute/report path | Attention | `delivery_update` |

---

## 6. Task invitation (DEC-003, new)

```
SENT → VIEWED → (contributor applies via normal flow — no state link) 
  ├→ DECLINED
  └→ EXPIRED
```

| State | Label en / ar | Rules |
|---|---|---|
| SENT | Invitation sent / دعوة للتقديم | Source MANUAL_MATCH or GOLD_AUTO_MATCH; copy: "Your verified skills appear to match this contribution request. Review the requirements and apply if interested." Never "You have been selected." |
| VIEWED | Viewed / تمت المشاهدة | Contributor opened it |
| DECLINED | Declined / تم الاعتذار | Contributor opted out; owner sees aggregate, not shaming detail |
| EXPIRED | Expired / منتهية الصلاحية | `expires_at` passed or request closed |

**Hard rules**: invitation ≠ assignment; does not create an application; never bypasses AI validation or daily quota; never affects reputation.

---

## 7. Cross-cutting rules (carried from v1, still binding)

1. One shared `StatusChip` grammar: neutral (draft/info) · blue (in progress/waiting) · amber (needs *your* action) · green (positive terminal) · red (negative terminal) · violet (AI processing). Icon + text always; never color-only.
2. Waiting states name the next actor (AI / admin / owner / you).
3. Negative terminal states carry the reason and one recovery action; `NOT_SELECTED`, `EXPIRED`, and `VALIDATION_FAILED` explicitly state they don't harm reputation/eligibility.
4. Notification types remain the confirmed enum (`application_status, skill_review, delivery_update, match_found, task_recommendation, plan_limit, system`); invitations ride `match_found`.
5. Arabic labels follow `arabic-glossary.md`; UI renders one language at a time (DEC-008).
