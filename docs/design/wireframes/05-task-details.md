# 05 · Contribution-task details (`/tasks/$taskId`)

> **Correction (DEC-030–DEC-035):** AI fit is advisory, owner selection is final, and contributor quotas/Gold restrictions are removed. The application flow below is not implementation-ready and must be replaced by the contract-first flow in `../contributor-experience-brief.md`.

**Job**: the product's most important screen. It must (1) present requirements honestly against the contributor's verified skills *before* they spend a limited application, and (2) run the apply → AI-validation moment without anxiety. Applications are scarce (2–4/day [Confirmed]) — this screen protects them.

```
┌────────────────────────────────────────────────────────────────────┐
│ Tasks / Add JWT authentication                                     │
│ in sharek-backend · @karim                    ((Open for applications))│
├───────────────────────────────────┬────────────────────────────────┤
│ DESCRIPTION                       │ YOUR FIT              [?]      │
│ Implement JWT-based auth for the  │ ┌────────────────────────────┐ │
│ REST API: login, refresh,         │ │ Node.js   ✓ Verified·Interm│ │
│ guards…                           │ │ REST APIs ✓ Verified·Adv   │ │
│                                   │ │ JWT       ✗ not in your    │ │
│ REQUIREMENTS                      │ │            verified profile│ │
│ • Node.js (Intermediate)          │ └────────────────────────────┘ │
│ • REST APIs                       │ Based on your admin-reviewed   │
│ • JWT                             │ skills. The AI check on apply  │
│                                   │ uses the same profile.         │
│ DETAILS                           │                                │
│ difficulty ((Intermediate))        │ ┌────────────────────────────┐ │
│ deadline   Jul 30 (18 days)       │ │ [Apply — 1 of 2 today left]│ │
│ reward     $120                   │ │ or: 4 tasks fully match    │ │
│ applicants 1 slot                 │ │ you today →                │ │
│                                   │ └────────────────────────────┘ │
│ PROJECT CONTEXT (collapsed card)  │ (sticky rail)                  │
└───────────────────────────────────┴────────────────────────────────┘
```

**The honesty contract** [APPROVED — DEC-010]: the fit hint is backend-computed and deterministic (approved skills ∩ required technologies), displayed as "Verified skill coverage: 2 of 3 required technologies" with coverage buckets — 3/3 "Strong requirement coverage" · 2/3 "Partial requirement coverage" · 0–1/3 "Requirements may not be met" · unknown "Full validation required". **No percentages.** Mandatory disclaimer: *"This is an early indication based on your approved skills, not the final AI eligibility decision."* The final AI validation may weigh proficiency, evidence, confidence, related technologies, task difficulty, and repository activity.

**Quota copy on submit** [DEC-006, required]: *"Submitting this application uses 1 of your daily application attempts, even if the eligibility check does not pass."* On technical failure (`VALIDATION_FAILED`) the attempt is automatically refunded and the UI says so.

## Apply flow (modal over this screen)

```
Step 1 — compose         Step 2 — validating          Step 3 — outcome
┌ Apply to this task ┐   ┌ Checking eligibility ┐    eligible ────────────┐
│ cover message      │   │ ▓▓▓▓░░ comparing      │    │ ✓ Sent to @karim  │
│ (optional)         │ → │ requirements against  │ →  │ justification ▸   │
│ [Submit]           │   │ your verified skills… │    │ [Track it →]      │
└────────────────────┘   │ (takes ~10s — you can │    review_needed ──────┤
                         │  close; we'll notify) │    │ 🕐 A human will    │
                         └───────────────────────┘    │ take a look. Why ▸│
                                                      ineligible → WF-12  │
```

**Gate states on the Apply button (evaluated pre-click, Principle 7)**
| Condition | Button state |
|---|---|
| OK | `[Apply — 1 of 2 today left]` |
| Quota exhausted | disabled + "resets at midnight · Silver = 3/day →" |
| Profile not approved | disabled + "applying unlocks after skill review ((In review))" |
| Already applied | replaced by inline application status + [View application] |
| Task assigned/completed/cancelled | header chip explains; button hidden |

**States**: open · already-applied · read-only terminal states · the 3 validation outcomes · validation-error (retry; draft preserved).
**Mobile**: fit panel collapses to "Your fit: 2/3 ▸" directly under title (must be seen before description); sticky bottom apply bar.
**RTL**: fit panel ✓/✗ column mirrors; requirement names LTR; modal stepper flows RTL.
