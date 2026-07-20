# Contributor Experience Implementation Readiness

> Status: CURRENT REPOSITORY ASSESSMENT
>
> Assessed: 2026-07-20
>
> Product policy: DEC-030–DEC-035 and `contributor-experience-brief.md`

## Recommendation

Do not build production contributor screens over invented backend behavior.

Use this delivery rule:

1. **Build now** when the route, typed contract, authorization behavior, and backend endpoint exist and agree with current product policy.
2. **Build conditionally** when an endpoint exists but its privacy, authorization, or product semantics require a contract correction first.
3. **Defer** when the surface is mock-powered, has no route/API, or depends on an unresolved state machine.
4. Fixtures are allowed only in isolated component tests, visual previews, and explicit development stories. They must never appear as apparently live production data or unlock production navigation.

Design, information architecture, DTO proposals, API contracts, tests, and reusable presentation components may be prepared before an endpoint exists. Mutations, realtime behavior, permissions, public claims, and workflow transitions may not be simulated as if the backend supports them.

## Readiness matrix

| Contributor surface | Current frontend | Current backend/data | Decision | Required before production redesign |
|---|---|---|---|---|
| Shared app shell, theme, skip link, member/contributor route guards | Built | `/auth/me` and session endpoints are real | **Build now** | Remove legacy contributor plan/attempt copy during the next authorized code phase; keep server authorization authoritative |
| Authentication and role-aware entry | Built | Register, login, refresh, logout, social auth, and current-user APIs are real | **Build now** | Preserve contributor-only route checks and non-enumerating auth errors |
| Contributor profile read and ensure | Built | `GET /contributors/profiles/:username` and `POST /contributors/profiles/me/ensure` are used by real services | **Conditional** | Confirm public/private serializer behavior and move public profile out of the authenticated layout only when the public contract is verified |
| Contributor profile editing | UI built | `updateContributorProfileDetails` is a mock; fields are documented as missing backend persistence | **Defer mutation** | Implement and approve the profile update endpoint and DTO; retain local form design/test work only |
| GitHub linked identity | Built | OAuth start/callback, account read, and disconnect endpoints are real | **Conditional** | Present it strictly as linked identity per DEC-032; do not imply repository evidence authorization |
| GitHub repository list and statistics | Built | Repository list/statistics/activity/commit-signal endpoints are real | **Conditional / legacy diagnostic surface** | Add GitHub App installation and explicit selection contracts before using repositories as the final evidence-consent model; revise spec 003 |
| Skill-profile generation request/status | Built service and queries | `POST /skill-profiles/me/generations` and generation status reads are used | **Conditional** | Confirm evidence visibility/redaction and generation DTO alignment with DEC-033 before expanding contributor presentation |
| Contributor onboarding aggregate flow | Built UI | `onboarding.service.ts` is explicitly mock-only | **Defer** | Define onboarding read model that composes identity, GitHub App selection, evidence sources, analysis, review state, and recovery actions |
| Contributor dashboard | Built UI | `dashboard.service.ts` is explicitly mock-only | **Defer** | Define action-ranked dashboard endpoint/read model without contributor quotas or AI-gated applications |
| Project discovery | Built UI | `explore.service.ts` is explicitly mock-only | **Defer** | Add list/search/filter contract, pagination, public serializer, and advisory fit fields |
| Project details | Built UI | `project-details.service.ts` is explicitly mock-only | **Defer** | Add slug-based public details contract, task summaries, activity freshness, and audience-safe fit |
| Task feed and details | Built UI | `tasks.service.ts` is explicitly mock-only | **Defer** | Add task list/detail contracts and replace gate vocabulary with advisory fit fields |
| Application submission and AI fit result | Built mock UI | Submission and `eligible/ineligible/review_needed` outcomes are mock-only and conflict with DEC-030/031 | **Defer and redesign contract first** | Approve owner-routed application state machine, real non-AI blockers, advisory fit result, idempotency, and relationship-aware response fields |
| My applications (`/applications`) | No route | No complete client service/API contract | **Defer; proposed IA only** | Approve list/detail DTOs, pagination, owner-decision states, applicant visibility, terminal capabilities, and router mapping |
| Application detail (`/applications/:applicationId`) | No route | No complete client service/API contract | **Defer; proposed IA only** | Approve applicant-scoped detail serializer, owner-decision status, accepted-context transition, and permitted actions |
| Accepted-contributor private collaboration | No contributor route/module | No verified workspace/discussion contract in this repository; older general chat/PM ideas are post-MVP | **Defer** | Define the minimum contribution-specific collaboration contract and relationship authorization without creating Jira/Slack-like scope |
| Evidence submission and review | No complete contributor surface | No source-agnostic evidence DTO, upload/storage contract, or review API | **Defer** | Define evidence item schema, upload rules, owner attestation, verification methods, visibility, redaction, review states, and revocation |
| My skills and evidence (`/skills`) | No route; generation/admin review pieces exist | No complete contributor skill/evidence read model | **Defer; proposed IA only** | Add contributor-facing skills/evidence endpoint with source, method, visibility, freshness, review state, confidence, uncertainty, and dispute capabilities |
| Non-GitHub evidence | Not implemented | No approved client/backend contract | **Defer** | Define supported evidence types, validation, upload limits, storage, malware/content checks, privacy, and public serialization |
| Notifications center and read state | UI and socket provider built | Socket events are held in memory; no REST history/read persistence is used by the frontend | **Defer full center; retain shell plumbing** | Add notification feed, pagination, mark-read persistence, reconnect/refetch, privacy filtering, and screen-reader announcement preference |
| Contributor settings | Built composition | GitHub account operations are real; profile persistence and several account sections are incomplete/mocked | **Build only API-backed subsections** | Split linked identity from evidence authorization; defer controls without persistence or contract support |

## Build-now scope

The next authorized frontend phase may safely focus on:

- Shared contributor shell and navigation semantics that do not expose proposed routes prematurely.
- Reusable accessible primitives: status language, evidence metadata rows, audience/visibility labels, fit explanation structure, loading/empty/error patterns, and bidirectional technical tokens.
- Authentication, session, role routing, and contributor-only guards.
- API-backed contributor profile read/ensure behavior, subject to public/private serializer verification.
- GitHub linked-identity status as identity only.
- Existing GitHub repository diagnostics without presenting them as the final consent/evidence-authorization model.
- Skill generation status only after its evidence/privacy fields are checked against DEC-033.

## Deferred production scope

Keep these out of production navigation and shipped workflows until their prerequisites land:

- Aggregate onboarding.
- Dashboard data.
- Explore and project details.
- Task feed/details and application submission.
- Applications list/detail.
- Accepted-contributor collaboration.
- Evidence submission/review.
- My skills/evidence.
- Non-GitHub evidence.
- Persistent notification center.
- Profile settings mutations without backend persistence.

## Contract-first backlog

Backend/API work should be sequenced by the contributor journey rather than by isolated screens:

1. **Identity and evidence authorization:** GitHub App installation, selected repositories, scopes, consent, revocation, synchronization, and redaction.
2. **Source-agnostic evidence:** evidence item, visibility, verification method, freshness, review state, confidence/uncertainty, upload/attestation, and public serializer.
3. **Discovery:** projects, tasks, filters, pagination, freshness, and advisory fit.
4. **Applications:** submit, owner decision, applicant-scoped list/detail, non-AI blockers, terminal states, and contextual capabilities.
5. **Accepted contribution:** minimum private collaboration, evidence submission, owner review, revisions, and completion.
6. **Contributor record:** skills/evidence read model, completed contribution record, reputation derived from reviewed work, and public/private presentation.
7. **Operational support:** dashboard aggregation, onboarding aggregation, notifications persistence, and settings mutations.

## Definition of API-ready

A contributor screen is API-ready only when all of the following are true:

- Endpoint and method are approved and implemented.
- Request, success, error, empty, stale, and pagination contracts are typed.
- Authorization is defined for anonymous, applicant, accepted contributor, owner, admin, and terminal relationships as applicable.
- Public, relationship-limited, reviewer-only, and private fields are enumerated.
- AI output is advisory, attributable, audience-safe, and uncertainty-aware.
- Arabic/English content and technical bidirectional fields are defined.
- Loading, retry, idempotency, reconnect, and partial-failure behavior are known.
- Accessibility-relevant state changes and focus outcomes are specified.
- Tests can distinguish real backend data from fixtures.

If any item is missing, the surface remains contract design or isolated component work—not production implementation.
