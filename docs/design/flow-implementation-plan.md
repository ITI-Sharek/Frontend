# Share-k — Six-Flow Implementation Plan (execution handoff)

> **Audience**: the implementing agent/developer (Sonnet) working in `sharek-frontend/`.
> **Covers TASK-1-01 flows**: registration · GitHub connection · role selection · project publishing · project discovery · task application.
> **Prime directive: do not duplicate pages.** The inventory in §2 lists what already exists — extend or audit it, never rebuild it.
> **Data**: mock-first (no real API calls for new surfaces). Every mock service is the documented handoff contract for the future endpoint — follow the existing pattern in `src/modules/dashboard/services/dashboard.service.ts` and `src/modules/projects/services/explore.service.ts`.
> **Commits**: one commit per flow-scoped change, message format below, each ending with the `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` trailer.

---

## 1 · Ground rules (read once, apply everywhere)

**Stack & conventions** — TanStack Start file routes (`src/routes/`), business logic in `src/modules/<feature>/` only, kebab-case files / PascalCase exports, barrels (`index.ts`) for cross-module imports, no module→module imports (compose in the route file). After adding any route file: `pnpm generate-routes` (never hand-edit `routeTree.gen.ts` — it's gitignored).

**Design system** (imported verbatim at `docs/design/design-system/`, tokens live in `src/styles/tokens.css`):
- Colors via semantic tokens only: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `text-primary` (teal — reserved for primary actions, verification, positive), `text-destructive`. No gradients, no glassmorphism, no new hex values.
- Radii: `rounded-card` / `rounded-input` / pills `rounded-full`. Borders 1px `border-border` everywhere (bordered system, not shadow-only).
- Type: body = default (IBM Plex Sans Arabic); **labels/meta = Geist Mono 13px/0.65px tracking** → `font-mono text-[13px] tracking-[0.65px]` (the system's signature trait); technical tokens (repo names, usernames, tech tags, counts) always `dir="ltr"` + mono inside RTL text.
- Buttons/Cards/Inputs: use `src/shared/components/ui/{button,card,input,label,checkbox,avatar}.tsx` — they already match the DS.
- Motion: `transition-colors` only; no entrance animations.

**Language** — the app is Arabic-first RTL (`lang="ar" dir="rtl"` global). One language at a time (DEC-008). Terms from `docs/design/arabic-glossary.md` are binding: application = طلب انضمام · contribution request = طلب مساهمة · eligible/ineligible = مؤهل / غير مؤهل · pending validation = قيد التحقق · verified skill = مهارة موثقة · delivery = تسليم العمل · Pull Request = طلب سحب (Pull Request) · not selected = لم يتم الاختيار.

**Product principles that gate review** (`docs/design/product-experience-principles.md`): every AI output carries its reason (never a bare score — DEC-010 buckets قوي/جزئي/منخفض/غير معروف + explanation line); quotas visible **before** the act (on the button); every wait state names the next actor; rejection screens always offer a next step; verified ≠ unverified visually, icon + text, never color-only.

**Mock pattern** — `services/<name>.service.ts` exports `async get…(): Promise<Dto>` returning `Promise.resolve(MOCK)`, with a JSDoc block naming the future endpoint; TanStack Query hook in `api/queries/`; query keys in `api/query-keys.ts`; a `?state=` search param on the route to preview alternate lifecycle states (see `src/routes/_appLayout/dashboard.tsx`).

**Definition of done, per flow** — `pnpm generate-routes` (if routes added) → `pnpm lint` → `pnpm test` green → a co-located `*.test.tsx` asserting the key Arabic copy strings render per state (pattern: `contributor-profile-view.test.tsx`) → preview each state in the browser (dev server :3001, `?state=` switches) at desktop + 390px → commit.

---

## 2 · Existing inventory — DO NOT DUPLICATE

| Surface | Route / files | Status |
|---|---|---|
| Register (3 steps + verify email) | `/register` — `modules/auth/components/register-form.tsx` + `register-steps/{account,details,role,verify-email}-step.tsx` | ✅ built, real API |
| Role selection | inside register — `role-step.tsx` + `role-option-card.tsx` | ✅ built |
| Login / forgot password / social callback | `/login`, `/forgot-password`, `/auth/callback` | ✅ built |
| Contributor profile (tabs + stats panel) | `/profile/$username` — `modules/contributors` | ✅ built, real API |
| App shell (sidebar + bottom tabs + plan chip) | `shared/components/layout/app-shell.tsx` + `routes/_appLayout.tsx` | ✅ built (contributor nav; mock plan chip) |
| Contributor dashboard (states A/B/C) | `/dashboard` — `modules/dashboard` | ✅ built, mock |
| Explore projects (filters/search/sort/fit) | `/explore` — `modules/projects` explore files | ✅ built, mock |
| GitHub repos + statistics (spec 003) | `/github/repositories` — `modules/github` | ✅ built, real API |
| GitHub OAuth connect service | `modules/github/services/github-connect.service.ts` (`startGitHubConnect`) | ✅ built |
| Design system reference | `docs/design/design-system/` | ✅ imported |

**Missing (this plan builds):** `/onboarding` · `/projects/$projectSlug` · `/tasks` · `/tasks/$taskId` + apply modal · `/my-projects` · `/my-projects/new`. Plus one shared primitive: `StatusChip`.

**Shared primitive to add first** (used by flows 4–6): `src/shared/components/data-display/status-chip.tsx` implementing the state-model §6 grammar — props `{ tone: "neutral"|"waiting"|"attention"|"positive"|"negative"|"ai"; icon: LucideIcon; children }`; tone→classes: neutral `bg-border/40 text-muted-foreground` · waiting `bg-brand-indigo/10 text-brand-indigo` · attention `bg-amber-500/15 text-amber-600 dark:text-amber-400` · positive `bg-primary/10 text-primary` · negative `bg-destructive/10 text-destructive` · ai `bg-[#6B5CA5]/10 text-[#6B5CA5]` — always icon + text.
Commit: `feat(shared): status-chip primitive (state-model §6 grammar)`.

---

## 3 · Flow 1 — Registration (audit only, one tweak)

**Exists.** Do not rebuild. Two tasks:
1. **Audit** against `docs/design/screen-inventory.md` §1.5 + DEC-001: role cards outcome-framed; copy says «اختر طريقة استخدامك لشارك مبدئيًا. قد ندعم أدوارًا إضافية لاحقًا.» (never "لن يمكن تغييره أبدًا"); username availability check present; email/password inputs LTR content inside RTL form. Fix only what fails the audit.
2. **Redirect tweak** (after Flow 2 lands): successful contributor registration/verification routes to `/onboarding` instead of the profile. Change is confined to the post-register navigation in `register-form.tsx` / verify step + `ROUTES.onboarding`.

Commit: `feat(auth): route new contributors to onboarding after registration`.

---

## 4 · Flow 2 — GitHub connection (`/onboarding`, the activation stepper)

**References**: journeys CJ-1, screen-inventory §2.1, WF-08, state-model §1, DEC-011/015.

**Route**: `src/routes/_appLayout/onboarding.tsx` — full-width page, **sidebar hidden or inert during onboarding** (nav-model: "the stepper *is* the navigation"); simplest: render inside `_appLayout` but pass a `hideNav` marker via route context is over-engineering — acceptable to keep the shell visible with all items except الملف الشخصي inert. `validateSearch`: `{ step?: "connect"|"analysis"|"preview"|"review"|"decision", outcome?: "approved"|"partial"|"rejected" }` (dev switches).

**Module**: `src/modules/contributors/` additions —
- `types/onboarding.types.ts`:
```ts
export type OnboardingStep = "connect" | "analysis" | "preview" | "review" | "decision";
export interface AnalysisStageDto { id: string; label: string; status: "done" | "running" | "todo" }
export interface GeneratedSkillDto { name: string; proficiency: "beginner"|"intermediate"|"advanced"; confidence: number; flagged?: boolean }
export interface OnboardingStateDto {
  step: OnboardingStep;
  github: { connected: boolean; username: string | null };
  analysis: { status: "queued"|"in_progress"|"completed"|"failed"; stages: AnalysisStageDto[] };
  generatedSkills: GeneratedSkillDto[];
  reviewOutcome: "approved" | "partially_approved" | "rejected" | null;
}
```
- `services/onboarding.service.ts` — mock; contract note: future `GET /contributors/onboarding` + `GET /ingestions/:id` (DEC-015 polling, 4-state fallback). Mock analysis stages (٤): «جلب المستودعات» «تحليل اللغات» «استخراج المهارات» «تجهيز الملف للمراجعة».
- `components/onboarding/onboarding-stepper.tsx` (wraps `shared/components/navigation/step-indicator.tsx` — already exists, reuse) + one component per step:
  - `github-consent-step.tsx` — consent card: what we read «المستودعات العامة، ملفات README، اللغات، نشاط الالتزامات (commits)» + «للقراءة فقط — لا نعدّل شيئًا، ويمكنك الفصل في أي وقت من الإعدادات»; CTA «ربط حساب GitHub» → calls the injected `onConnectGitHub` (route injects `startGitHubConnect` from `modules/github` — cross-module composition at route level, same as profile). States: disconnected / connecting / failed (+retry).
  - `analysis-progress-step.tsx` — staged list (reuse the checklist marker pattern from `modules/dashboard/components/onboarding-checklist.tsx` `StepMarker`), live line «يمكنك المغادرة — سنخبرك عند الانتهاء». Failure state: «تعذّر التحليل» + «إعادة المحاولة».
  - `profile-preview-step.tsx` — generated skills rows (reuse the visual language of profile's `VerifiedSkillRow` but statusless: name mono LTR + proficiency + confidence band عالية/متوسطة/منخفضة) + per-row flag toggle «الإبلاغ عن خطأ واضح» (stores `flagged`); footer «إرسال للمراجعة».
  - `pending-review-step.tsx` — banner: «ملفك المهاري قيد المراجعة — تُستكمل معظم المراجعات خلال 48 ساعة.» (DEC-011 copy) + escape hatch «استكشف المشاريع في هذه الأثناء» → `/explore` (note: «التقديم يُفتح بعد المراجعة»).
  - `decision-step.tsx` — approved: celebration card (teal ✓ stamp, «ملفك موثق — ابدأ التقديم») → `/dashboard`; partial: «موثق جزئيًا — يمكنك التقديم بالمهارات المعتمدة فقط» + list; rejected: Principle-5 layout — reasons + actions «اعتراض» / «حسّن نشاطك ثم أعد التحليل».

Commit: `feat(contributors): onboarding activation stepper — connect → analysis → preview → review → decision (CJ-1, mock)`.

---

## 5 · Flow 3 — Role selection (audit only)

**Exists** (`role-step.tsx` + `role-option-card.tsx` from the DS). Audit checklist, fix only failures:
- Two outcome-framed cards: مساهم «ساهم وابنِ خبرة موثقة» / صاحب مشروع «انشر مشاريعك واعثر على مساهمين مؤهلين».
- DEC-001 copy present; keyboard selectable; selected card border-primary.
No new files. Commit only if fixes needed: `fix(auth): role-selection copy/a11y audit (DEC-001)`.

---

## 6 · Flow 4 — Project publishing (owner: `/my-projects`, `/my-projects/new`)

**References**: journeys OJ-1, screen-inventory §4.2–4.3, IA §C.

**Routes**: `src/routes/_appLayout/my-projects.index.tsx` + `my-projects.new.tsx`. (Owner-specific sidebar comes later — for now these pages are reachable by URL and from each other; add a TODO comment referencing nav-model §3.)

**Module**: `src/modules/projects/` additions —
- `types/my-projects.types.ts`:
```ts
export interface MyProjectDto { id: string; title: string; slug: string; status: "draft"|"published"|"archived"; openRequestsCount: number; pendingApplicationsCount: number; lastActivityLabel: string }
export interface RepoPickDto { fullName: string; description: string | null; language: string | null; stars: number; isPrivate: boolean }
export interface ImportDraftDto { title: string; description: string; tags: string[]; technologies: string[]; category: ProjectCategory | null; difficulty: ProjectDifficulty | null; fetchedFields: string[] }
export interface OwnerQuotaDto { used: number; monthlyLimit: number } // e.g. 14/20
```
- `services/my-projects.service.ts` — mock list (2 projects: one published w/ counts, one draft), mock repo list (5 repos incl. one private → disabled row «خاص — غير متاح للاستيراد»), mock import that returns an `ImportDraftDto` with `fetchedFields: ["title","description","technologies"]`.
- `components/owner/my-projects-list.tsx` — rows with `StatusChip` (مسودة neutral / منشور positive / مؤرشف neutral), counts, «طلب مساهمة» terminology; empty state hero «استورد مشروعك الأول من GitHub» + CTA. «استيراد مشروع» button top-end.
- `components/owner/import-project-stepper.tsx` — 3 steps (reuse `StepIndicator`):
  1. **اختيار المستودع** — searchable mock repo list + paste fallback `owner/repo`; failure states as distinct messages: غير موجود / خاص / تجاوز حد الطلبات / مستورد مسبقًا.
  2. **مراجعة البيانات** — form (reuse `Input`/`Label`/`ChipSelect` from auth module? No — ChipSelect lives in `modules/auth`; copy the DS `components/forms/ChipSelect` into `shared/components/forms/chip-select.tsx` instead, then use it here); fetched fields labeled «من GitHub»; category + difficulty pickers with help text «تُستخدم في الاكتشاف والمطابقة — المبالغة في التحديد تُقصي المتقدمين».
  3. **النشر** — consequence copy «سيظهر المشروع لكل المساهمين في صفحة الاستكشاف وتُفهرس بياناته للبحث» + «نشر» / «حفظ كمسودة». Quota visible **on the create-request CTA** of the success screen: «١٤ من ٢٠ طلب مساهمة هذا الشهر».

**States**: repos loading skeleton / list / import-running / import-failed (4 causes) / draft-saved / published (+ next step CTA «أنشئ أول طلب مساهمة»).

Commits: `feat(projects): my-projects owner list (OJ-1, mock)` then `feat(projects): import & publish stepper (OJ-1, mock)`.

---

## 7 · Flow 5 — Project discovery (details page; explore exists)

**Exists**: `/explore` (done — WF-03). **Gap**: `/projects/$projectSlug` (WF-04, screen-inventory §1.3).

**Route**: `src/routes/_appLayout/projects.$projectSlug.tsx` (slug per DEC-025). Wire `ExploreProjectCard`'s «فتح المشروع» to it (`Link` in the card via prop injected from the view — keep the module router-free by passing `getProjectHref?: (slug: string) => string` from the route, or simply an `<a href>`).

**Module additions** (`modules/projects`):
- `types/project-details.types.ts`: `ProjectDetailsDto = ExploreProjectDto & { readmeDigest: string; ownerDisplayName: string; openTasks: ProjectTaskSummaryDto[] }`; `ProjectTaskSummaryDto { id, title, requiredTechnologies: string[], difficulty, deadlineLabel: string | null, rewardLabel: string | null, fitHint: ExploreFitHintDto | null }`.
- `services/project-details.service.ts` — mock keyed by the 6 explore slugs; unknown slug → throw `{ code: "not-found" }`; `deploy-drift` → mock `archived: true` to exercise the banner.
- `components/project-details-view.tsx` — header (name mono LTR, owner, «فتح على GitHub» link, ★/commits/updated, difficulty+category chips), overview (readmeDigest), languages bar (reuse card's bar), **open tasks list** with per-task fit hint + «عرض المهمة» → `/tasks/$taskId`, owner card, sticky mobile bottom bar «عرض المهام (3)».

**States**: loading / found / not-found (friendly 404 + «العودة للاستكشاف») / archived banner «هذا المشروع لم يعد يستقبل مساهمات — السجل محفوظ» / unauthenticated (fit hints hidden — mock flag).

Commit: `feat(projects): project details page with open tasks (WF-04, mock)`.

---

## 8 · Flow 6 — Task application (`/tasks`, `/tasks/$taskId`, apply modal)

**References**: journeys CJ-2/3/4, screen-inventory §3.2–3.4, WF-05/06/12, state-model §4, DEC-006/010/013. **The most important interaction in the product — build last, best.**

**New module**: `src/modules/tasks/` —
- `types/task.types.ts`:
```ts
export interface TaskCardDto { id: string; title: string; projectName: string; projectSlug: string; requiredTechnologies: string[]; difficulty: ProjectDifficulty; deadlineLabel: string | null; rewardLabel: string | null; applicantsLabel: string; fitHint: ExploreFitHintDto | null }
export interface RequirementMatchDto { technology: string; verified: boolean; proficiency: string | null }
export interface TaskDetailsDto extends TaskCardDto { description: string; maxApplicants: number; requirements: RequirementMatchDto[]; applicationState: "open"|"already_applied"|"assigned"|"quota_exhausted"|"profile_not_approved"; quota: { used: number; dailyLimit: number } }
export type ValidationDecision = "eligible" | "ineligible" | "review_needed";
export interface ValidationResultDto { decision: ValidationDecision; confidenceBand: "high"|"moderate"|"low"; justification: string; matched: string[]; missing: string[]; evidenceRefs: string[]; alternatives: TaskCardDto[] } // alternatives for the ineligible screen
```
- `services/tasks.service.ts` — mock feed (6 tasks across the explore projects); `getTaskDetails(id)`; `submitApplication(taskId, coverMessage)` → resolves after ~1.5s to a deterministic outcome by task id (one eligible, one ineligible, one review_needed) so all three screens are demo-able. Contract notes: `GET /tasks`, `GET /tasks/:id`, `POST /tasks/:id/applications`.
- Components:
  - `task-card.tsx` — title, project (mono LTR), tech tags, difficulty chip, deadline/reward, fit hint line (same pattern as explore).
  - `requirement-match-panel.tsx` — WF-05: per requirement ✓ «موثقة — متوسط» (teal) / ✗ «غير موجودة في ملفك الموثق» (muted); shown **before** applying; RTL: icon column at the start.
  - `apply-button.tsx` — quota on the button: «تقديم طلب انضمام (١ من ٢ متبقٍ اليوم)»; disabled variants: quota exhausted («استُنفدت محاولات اليوم — تتجدد 00:00»), profile not approved («التقديم يُفتح بعد توثيق ملفك» + link), already applied (inline status chip).
  - `apply-modal.tsx` — DEC-006 pre-submit copy: «إرسال هذا الطلب يستهلك محاولة واحدة من محاولاتك اليومية حتى لو لم يجتَز فحص الأهلية.»; optional cover message textarea; submit → **validating state** (StatusChip tone="ai", «قيد التحقق — نقارن متطلبات المهمة بمهاراتك الموثقة») → outcome view.
  - `validation-result.tsx` — the WF-06 ExplanationCard anatomy, all three outcomes:
    - **eligible**: ✓ «مؤهل — أُرسل طلبك إلى صاحب المشروع» + confidence band + justification + matched/missing chips + «ماذا بعد: صاحب المشروع يراجع خلال ~يومين».
    - **ineligible** (WF-12, Principle 5): honest reason first; then ranked actions — «مهام تطابقك اليوم» (alternatives list) → «اعتراض على القرار» → Gold teaser «أعضاء Gold يحصلون على خطة سد الفجوة» (reason itself never paywalled).
    - **review_needed** (DEC-013): «طلبك يحتاج مراجعة بشرية — سيتولاها فريق المنصة، لا شيء مطلوب منك. محاولتك محجوزة.»
- **Routes**: `src/routes/_appLayout/tasks.index.tsx` (feed: filters tech/difficulty/وجود مكافأة/الموعد، sort; reuse the explore filter components pattern — do **not** import `modules/projects` internals; duplicate the tiny filter UI locally or lift `ExploreFilters` to `shared/components/forms/` if reuse is exact) and `tasks.$taskId.tsx` (details + `?outcome=` dev switch). Activate the sidebar «المهام» item (`routes.config.ts` + `_appLayout.tsx`).

**States to demo**: feed loading/results/filtered-empty; details open/already-applied/quota-exhausted/profile-not-approved; post-submit validating/eligible/ineligible/review_needed.

Commits: `feat(tasks): task feed with filters (CJ-2, mock)` then `feat(tasks): task details + apply flow with explained AI validation (WF-05/06/12, mock)`.

---

## 9 · Execution order & commit ledger

| # | Work | Commit message |
|---|---|---|
| 0 | StatusChip primitive | `feat(shared): status-chip primitive (state-model §6 grammar)` |
| 1 | Flow 2 — onboarding stepper | `feat(contributors): onboarding activation stepper (CJ-1, mock)` |
| 2 | Flow 1 — post-register redirect + audit fixes | `feat(auth): route new contributors to onboarding after registration` |
| 3 | Flow 3 — role-step audit (only if fixes) | `fix(auth): role-selection copy/a11y audit (DEC-001)` |
| 4 | Flow 5 — project details page | `feat(projects): project details page with open tasks (WF-04, mock)` |
| 5 | Flow 6a — task feed | `feat(tasks): task feed with filters (CJ-2, mock)` |
| 6 | Flow 6b — details + apply + validation | `feat(tasks): task details + apply flow with explained AI validation (WF-05/06/12, mock)` |
| 7 | Flow 4a — my-projects list | `feat(projects): my-projects owner list (OJ-1, mock)` |
| 8 | Flow 4b — import/publish stepper | `feat(projects): import & publish stepper (OJ-1, mock)` |

Rationale: contributor journey end-to-end first (onboarding → discovery → application), owner surfaces after — matches sprint priorities and lets each commit build on stable predecessors.

## 10 · Out of scope (do not build now)

Owner request-management tabs (Applications/Matches/Delivery), admin surfaces, notifications page, settings, pricing, real API wiring, payments (DEC-026), saved-projects backend (bookmark stays visual), role-aware owner sidebar (TODO markers only).
