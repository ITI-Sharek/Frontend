# Feature Specification: Registration — Platform Username & Role Selection

**Feature Branch**: `002-register-username-roles`

**Created**: 2026-07-12

**Status**: Draft

**Input**: User description: "Contributor and owner registration gains a platform-owned username field with availability checking, and role-selection cards use the approved DEC-001 copy (role changeable later via admin, never described as permanent)."

**Grounded in**: `../docs/product/governance/decision-log.md` DEC-001 (account roles), DEC-016 (canonical username); `../docs/architecture/contracts/api-contract-additions.md` §2 (registration/username-availability contract); `../docs/design/screen-inventory.md` §1.5; `../docs/product/user-journeys.md` CJ-1 step 1. This is backlog item **FE-1** in `../docs/architecture/implementation-impact.md`.

**Scope note**: This spec may be authored and refined now under the frontend safe-scope rule (DEC-028). Implementation (code) waits on the backend endpoints in the "Assumptions" section below — writing the spec does not require them to exist yet.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Confirm a platform username at registration (Priority: P1)

A new user (contributor or owner) fills out the registration form and must choose a platform-owned Share-k username — the identifier that will appear in their profile URL and everywhere else on the platform — separate from their email and separate from any GitHub username (GitHub isn't connected yet at this point in the flow; that happens during onboarding, see CJ-1). The form tells them in real time whether the name they typed is available.

**Why this priority**: Every other approved decision that depends on a canonical username (public profile URLs, DEC-016) is blocked until an account has one. Without this story, no account can be created correctly under the new identity model.

**Independent Test**: Can be fully tested by typing a series of usernames into the registration form and confirming the availability indicator updates correctly for each (available / taken / invalid format), independent of role selection or any other form field.

**Acceptance Scenarios**:

1. **Given** the registration form is open, **When** the user types a username that is well-formed and not already taken, **Then** the field shows an "available" state and the form allows submission.
2. **Given** the user types a username already taken by another account, **When** the availability check returns, **Then** the field shows an "unavailable" state with a suggested alternative (e.g., `sara-dev-1`) and blocks submission until changed.
3. **Given** the user types a username that violates the format rules (too short, disallowed characters, leading/trailing punctuation, or a reserved word), **Then** the field shows a specific format error before any network check is made.
4. **Given** an availability check is in flight, **When** the user submits the form, **Then** submission is held until the check resolves rather than optimistically succeeding.
5. **Given** the user edits the username again after a check has resolved, **When** a stale response for the previous value arrives late, **Then** the stale result is discarded and only the result matching the current field value is shown.

---

### User Story 2 - Choose an initial role without being told it's permanent (Priority: P1)

A new user picks whether they're joining as a Contributor or a Project Owner, using two explicit, outcome-framed cards rather than a dropdown. The copy tells them this is their *initial* choice and that additional roles may be supported later — it never claims the choice can't change.

**Why this priority**: This is the exact behavior DEC-001 was written to correct (the previous draft language implied an irreversible choice). It's equally foundational to registration as the username, so it shares P1.

**Independent Test**: Can be fully tested by rendering the registration form and verifying (a) the role control is two selectable cards, not a `<select>`, (b) the DEC-001 copy is present verbatim, and (c) no wording anywhere in the flow says the role can never change — independent of the username field's state.

**Acceptance Scenarios**:

1. **Given** the registration form, **When** it renders, **Then** both role cards are visible with outcome-framed descriptions (what a Contributor gets vs. what a Project Owner gets) and neither is preselected.
2. **Given** the user selects a role card, **When** they change their mind and select the other card, **Then** the selection updates immediately with no confirmation dialog (this is not a destructive, irreversible action at this step).
3. **Given** the role selection area, **When** rendered, **Then** it displays the copy "Choose how you want to use Share-k initially. Additional roles may be supported later." (or its approved Arabic translation) and nothing implying permanence.
4. **Given** the form is submitted without a role selected, **Then** submission is blocked with a validation message (role is required).

---

### User Story 3 - Register correctly in Arabic with RTL layout (Priority: P2)

A user with `preferred_language: ar` completes the same registration flow with the interface fully mirrored, using the controlled glossary terms, while the username value itself stays LTR inside the RTL form (per the glossary's technical-token rule).

**Why this priority**: Bilingual support is a locked NFR (NFR-004) and a stated product experience principle, but it is a rendering/localization concern layered on top of Stories 1–2 rather than a independent new behavior — it can ship right after the LTR version is correct.

**Independent Test**: Can be fully tested by switching the form's language to Arabic and confirming layout mirroring, glossary term usage, and that the username input renders its LTR value correctly inside the RTL form, independent of which specific username or role was chosen.

**Acceptance Scenarios**:

1. **Given** the language toggle is set to Arabic, **When** the registration form renders, **Then** labels, role-card copy, and availability messages appear in Arabic per `../docs/design/arabic-glossary.md`, with layout mirrored (field order, button alignment, icon direction).
2. **Given** an Arabic-rendered form, **When** the user types a username, **Then** the username text itself renders left-to-right within the right-to-left form (technical tokens stay LTR).

### Edge Cases

- Username collides with a **reserved word** (e.g., `admin`, `support`) → rejected with a clear reason; no "suggested alternative" is offered for reserved-word collisions (distinguish from an ordinary taken-username collision).
- Username differs from an existing one **only by case** (`Sara-Dev` vs `sara-dev`) → treated as the same username; the availability check is case-insensitive per DEC-016.
- **Backend/network failure** during the availability check → the field shows a neutral "couldn't check availability right now" state; typing is never blocked, and the form allows a submit attempt (the backend is the authoritative validator and will reject a genuine conflict at submit time with a distinguishable error).
- **Rapid typing** produces many overlapping availability requests → requests are debounced and out-of-order responses are discarded (see US1 scenario 5); no UI flicker between available/unavailable states.
- User submits the whole form with a valid, available username but a **taken email** → the two conflicts (`EMAIL_TAKEN` vs a hypothetical username race lost between check and submit) must surface as distinct, specific messages, never one generic "registration failed."
- **Keyboard-only / screen-reader users** must be able to select a role card via keyboard and hear the availability status change through an `aria-live` region — the availability indicator must not be conveyed by color alone.
- User leaves the username field **empty** → treated as a required-field validation error, not an availability check (no network call for an empty value).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The registration form MUST collect a platform username in addition to the existing fields (email, password, first name, last name, preferred language).
- **FR-002**: The system MUST validate username format client-side before any network check: 3–30 characters; letters, numbers, hyphens, underscores only; no leading or trailing punctuation. This is a UX pre-check only — the backend remains the authoritative validator.
- **FR-003**: The system MUST check username availability as the user types, debounced, and reflect one of: available, unavailable (+ suggested alternative when applicable), invalid format, or check-unavailable (network/service failure).
- **FR-004**: The system MUST prevent form submission while the current username is in a confirmed-unavailable or check-still-pending state.
- **FR-005**: The system MUST discard availability results that do not correspond to the field's current value (race-condition guard against fast edits).
- **FR-006**: The system MUST present role selection as two explicit, outcome-framed cards (Contributor / Project Owner) rather than a dropdown or radio list, with neither preselected.
- **FR-007**: The system MUST display the DEC-001 copy adjacent to role selection: "Choose how you want to use Share-k initially. Additional roles may be supported later." (localized per the Arabic glossary in `ar` mode) — and MUST NOT use language implying the choice is permanent or unchangeable.
- **FR-008**: The system MUST NOT present any role-switching control within this flow — a role change is out of scope here and requires admin intervention (DEC-001) — while still not describing the initial choice as final.
- **FR-009**: The system MUST require a role selection before allowing submission, with a clear validation message if omitted.
- **FR-010**: On submit, the system MUST send `username` and the selected role (mapped to the backend's `primary_role` value) together with the existing registration payload.
- **FR-011**: The system MUST surface `USERNAME_TAKEN` and `EMAIL_TAKEN` (or equivalent) as distinct, specifically worded errors — never a single generic "registration failed" message — consistent with the constitution's rule that backend error shapes are normalized once and components never parse them ad hoc.
- **FR-012**: The system MUST render correctly in both LTR (English) and RTL (Arabic) layouts, with the username value itself always rendered left-to-right regardless of form direction (glossary rule: technical tokens stay LTR in RTL text).
- **FR-013**: Username changes after registration are explicitly **out of scope** for this feature (DEC-016: username changes are disabled for MVP) — no in-app rename UI is included.
- **FR-014**: GitHub-based username prefill is explicitly **out of scope** for this feature: in the current registration→onboarding order (CJ-1), no GitHub account is connected yet at registration time, so the username is entered manually and confirmed here.

### Key Entities *(include if feature involves data)*

- **Registration payload**: the existing fields (email, password, first name, last name, preferred language) plus the new `username` and the selected role — a client-side form/request shape, not a new persisted entity in this feature's scope (the backend's `USER.username` column is defined in `../docs/architecture/domain-model/_MVP-DECISION-DELTA.md` §1).
- **Username availability check**: an ephemeral, non-persisted query result (`available: boolean`, `suggestion?: string`) used only to drive the form's live feedback; it is never cached beyond the current form session and is not trusted as a submission guarantee (the backend re-validates at submit time).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration (all existing fields + username + role) in under 60 seconds on a first attempt, with no more than one username retry on average.
- **SC-002**: 100% of username-taken conflicts (whether caught live by the availability check or at submit time) surface a message specifically about the username, never a generic failure message.
- **SC-003**: A copy review confirms the role-selection area contains the exact DEC-001 sentence (or its approved Arabic equivalent) and contains no language implying the role choice is permanent.
- **SC-004**: The registration form is fully usable — all copy, layout, and availability feedback — in both English and Arabic without layout breakage or truncated text, verified at the 360px and 1440px breakpoints.
- **SC-005**: In a component test simulating rapid sequential edits to the username field, the displayed availability state always matches the current field value (zero stale-result regressions).
- **SC-006**: A keyboard-only pass through the form (no pointer) can select a role card, type and evaluate a username, and submit successfully, with the availability status change announced to assistive technology.

## Assumptions

- **Backend dependency (blocks implementation, not spec work)**: this feature's implementation depends on `POST /auth/register` accepting `username` and `GET /auth/username-availability` existing per `../docs/architecture/contracts/api-contract-additions.md` §2. Per `../docs/architecture/implementation-impact.md`, FE-1 implementation is queued behind that backend work; this spec is written now so implementation can start the moment the endpoints land, without a design gap in between.
- Registration continues to happen before GitHub connection (per the current IA/CJ-1 order): username is entered manually here; a future GitHub-driven username *suggestion* (mentioned in DEC-016 for GitHub-connected flows) would apply during onboarding or profile setup, not registration, and is out of scope for this feature.
- The existing `src/modules/auth/` module, `/register` route, and `auth.service.ts` remain the implementation surface — no new module is created (constitution: modules own their domain; `auth` already owns registration).
- Role values sent by the frontend map directly to the backend's `primary_role` enum (`owner | contributor | admin`); `admin` is never offered as a selectable card (admin accounts are provisioned, never self-registered, per the root CLAUDE.md cross-repo contract).
- This feature does not implement the reserved-word list, the suggestion algorithm, or the case-insensitive uniqueness index themselves — those are backend behaviors (ERD delta §1); this feature only consumes their API surface and renders the resulting states.
- Password, first/last name, and language fields are unchanged from the current implementation and are out of scope for this feature except where they share the same form submission.
