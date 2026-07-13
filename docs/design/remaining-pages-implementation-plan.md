# Share-k — Remaining-Pages Implementation Plan (Part 2)

> Companion to `flow-implementation-plan.md` (Part 1 — the six core flows). Same ground rules apply verbatim (Part 1 §1): mock-first services as API contracts, teal DS tokens, Arabic-first RTL + glossary, module boundaries, `?state=` dev switches, per-step DoD, one commit per row of the ledger.
> **Execute only after Part 1 lands.** Batches are ordered by product priority; each batch is independently shippable.

## Inventory delta — exists vs. this plan

Built by Part 1 + earlier: register/login/forgot, onboarding, profile, dashboard (contributor), explore, project details, tasks feed + apply, my-projects + import stepper, GitHub repos (003), `StatusChip`.
**This plan builds:** applications (list + detail), skills, notifications, settings, owner shell + dashboard variant + project/request management, home audit, pricing, admin.

---

## Batch 1 · Contributor completion

### 1.1 `/applications` — طلبات الانضمام (screen-inventory §3.5)
- Route `src/routes/_appLayout/applications.index.tsx`; module `src/modules/applications/` (new).
- `types/application.types.ts`:
```ts
export type ApplicationStatus = "pending_validation"|"review_needed"|"pending_owner_review"|"blocked_ineligible"|"validation_failed"|"accepted"|"rejected_by_owner"|"not_selected"|"expired"|"withdrawn";
export interface ApplicationRowDto { id: string; taskTitle: string; projectName: string; status: ApplicationStatus; lastUpdateLabel: string; nextActor: "ai"|"admin"|"owner"|"you"|null }
```
- Tabs: نشطة / تحتاج إجراء / السجل (WF grouping per IA §B). Rows: task, project (mono LTR), `StatusChip` (state-model §4 labels: قيد التحقق waiting · يحتاج إلى مراجعة waiting · أُرسل إلى صاحب المشروع waiting · غير مؤهل حاليًا attention · تعذّر التحقق attention · مقبول — ابدأ العمل positive · رفض من صاحب المشروع neutral · لم يتم الاختيار neutral · منتهي الصلاحية neutral · تم السحب neutral), last update, **next actor** («بانتظار: صاحب المشروع»).
- States: loading / empty («لا توجد طلبات بعد» → CTA المهام) / populated. Sidebar «طلبات الانضمام» activates; badge = needs-action count.
- Commit: `feat(applications): applications list with status tabs (mock)`.

### 1.2 `/applications/$applicationId` — تفاصيل الطلب (§3.6, WF-05/06/12)
- The pipeline page: stepper visualization (قُدّم ✓ → التحقق ✓ → مراجعة المالك ● → التسليم ○ → المراجعة ○ → مكتمل ○) — vertical on mobile, RTL flow; current stage names the actor + expectation («يرد أصحاب المشاريع خلال ~يومين عادة», day-3/5/7 aging copy DEC-004).
- Panels (compose from Part-1 pieces): reuse `modules/tasks` `validation-result` anatomy for the AI card; **delivery panel** — PR URL input (LTR mono, format-validated) + notes → submitted → «بانتظار مراجعة صاحب المشروع» → outcomes معتمد ✓ (rating shown) / مطلوب تعديلات (feedback + resubmit, history preserved) / غير معتمد (reason + dispute); gap-guidance panel (Gold mock: sections stream-in mocked as ready) ; actions per state: سحب الطلب (before acceptance, confirm dialog), اعتراض (dispute modal), إعادة التقديم.
- NOT_SELECTED/EXPIRED/VALIDATION_FAILED copy verbatim from state-model §4 (no reputation harm lines).
- `?status=` dev switch across all 10 statuses.
- Commit: `feat(applications): application pipeline detail with delivery flow (WF-05/06, mock)`.

### 1.3 `/skills` — الملف المهاري (WF-07)
- Route `_appLayout/skills.tsx`; lives in `modules/contributors`.
- Top: GitHub card (متصل · آخر تحليل + «٤ مستودعات جديدة منذ التحليل» → «إعادة التحليل» with note «يعيد توليد المهارات وتدخل المراجعة مجددًا»). Summary chips (filter on tap): ٥ موثقة · ٢ قيد المراجعة · ١ غير معتمدة · ١ قيد الاعتراض.
- Table/stacked-cards: skill (mono LTR) · المستوى (with admin-adjustment disclosure «عُدّل بواسطة المراجع — تقييم الذكاء الاصطناعي: متقدم») · الحالة (`StatusChip`) · الأدلة (expander, reuse profile's evidence pattern). Rejected rows: admin note verbatim + «اعتراض» + «كيف تقوّي هذه المهارة». Disputed rows frozen note.
- States: all-pending / mixed / re-analysis-running (dim + progress) / github-disconnected / empty-honest.
- Commit: `feat(contributors): skills management page (WF-07, mock)`.

### 1.4 `/notifications` + bell popover (§3.8)
- Module `src/modules/notifications/` — types (7 ERD kinds: application_status, skill_review, delivery_update, match_found, task_recommendation, plan_limit, system → icon map), mock service, day-grouped list, mark-read/mark-all, unread count feeding the shell bell (lift count via a tiny zustand store `stores/notifications.store.ts` — UI state only).
- Popover from shell bell: top-5 + «عرض الكل». Route `_appLayout/notifications.tsx`.
- Commit: `feat(notifications): notification center + bell popover (mock)`.

### 1.5 `/settings` (§3.9)
- Route `_appLayout/settings.tsx`, module `src/modules/settings/` (thin — tabs compose others).
- Tabs: **الحساب** (name/avatar/password forms, mock save) · **اللغة** (ع/EN instant dir flip — flips `document.dir`, persists mock) · **GitHub** (connection status/disconnect/re-sync — reuse github module barrel) · **الاشتراك** (current plan card, usage meters «١ من ٢ طلبات اليوم», benefits, upgrade **disabled** with DEC-026 copy «شراء الخطط غير متاح خلال المعاينة»).
- Commit: `feat(settings): settings tabs incl. subscription usage (DEC-026, mock)`.

---

## Batch 2 · Owner core

### 2.1 Role-aware shell + owner dashboard (§4.1, nav-model §3, DEC-009)
- Shell: owner sidebar = لوحة التحكم / مشاريعي / الإعدادات + plan chip «Silver · ١٤ من ٢٠ طلب مساهمة هذا الشهر». Role source: mock `?role=owner` param on `/dashboard` + stored mock role until auth exposes it (TODO marker).
- Owner `/dashboard` composition: **«يحتاج قرارك»** section (DEC-009 — eligible applications aging with day-3/5 escalation chips, deliveries awaiting review first), per-project pipeline summary, monthly order meter, match digest (Silver/Gold; Bronze locked preview).
- Commit: `feat(dashboard): owner dashboard variant + role-aware sidebar (DEC-009, mock)`.

### 2.2 `/my-projects/$projectId` — إدارة المشروع (§4.4)
- Tabs نظرة عامة (metadata edit, publish/archive with consequence confirm, re-sync) / الطلبات (rows with pipeline counts «الطلبات ٤ · المؤهلون ٢ · المقبول ١ · المسلَّم ١» + «طلب مساهمة جديد» CTA with quota on button).
- Commit: `feat(projects): project management tabs (OJ-1/2, mock)`.

### 2.3 `requests/new` — إنشاء طلب مساهمة (§4.5)
- Quota-blocked **before** the form when exhausted (reset date + upgrade path). Form: title, description (spec guidance), required-tech chips («المبالغة في التحديد تُقصي الجميع»), difficulty, deadline, reward+currency, max applicants. Publish / save-draft.
- Commit: `feat(projects): create contribution request (Principle 7, mock)`.

### 2.4 `requests/$requestId` — إدارة الطلب (§4.6) — the owner's main surface
- Tabs: **الطلبات** (transparency line «١٢ طلبًا · ٤ اجتازوا التحقق», applicant cards = reputation strip + matched/missing + ExplanationCard compact + Gold priority flag + cover message → قبول (consequence DEC-005: «سيُغلق الطلب وتُعلَم بقية المتقدمين — لم يتم الاختيار لا يؤثر على أهليتهم») / رفض with optional reason) · **المطابقات** (Silver/Gold top-5/10 with reasoning + «دعوة للتقديم» DEC-003 copy; Bronze: honest locked preview) · **التسليم** (PR link, notes, requirements checklist → اعتماد (تقييم ١–٥ إلزامي + أثر السمعة confirm) / طلب تعديلات (feedback required) / رفض (reason required)) · **التفاصيل** (edit until assigned, cancel with impact).
- `?stage=` dev switch across lifecycle.
- Commit: `feat(projects): request management tabs — applications/matches/delivery (OJ-3/4, mock)`.

### 2.5 Owner onboarding variant (§2.2)
- `/onboarding` branches by role: connect GitHub (owner copy «لاستيراد مستودعاتك») → import first project (skippable «سأفعل لاحقًا») reusing the Part-1 import stepper.
- Commit: `feat(contributors): owner onboarding variant (OJ-1, mock)`.

---

## Batch 3 · Public

### 3.1 Home audit (WF-01) — module `home` **exists**; audit-only, no rebuild
Checklist: hero states the verifiable-experience value prop; how-it-works pipeline (اربط GitHub → التحليل → مراجعة بشرية → ملف موثق → ساهم) with the AI-transparency block (human review as trust feature); featured projects labeled sample data; tier teaser; role-split CTA («أريد أن أساهم» / «لدي مشروع»); authenticated header → «لوحة التحكم». Fix deviations only.
- Commit: `fix(home): WF-01 content audit`.

### 3.2 `/pricing` (§1.4, DEC-026)
- Route `_publicLayout`? — current app has no public layout; place at `src/routes/pricing.tsx` with the home header. Role toggle (مساهم/صاحب مشروع), 3 tiers with exact FR-073–082 limits (owner 10/20/30 orders·mo, matching top-5/10, Gold commission-free; contributor 2/3/4 apps·day, Gold recommendations+guidance), FAQ. **Never a functional purchase CTA** — disabled with DEC-026 copy.
- Commit: `feat(pricing): plans page (FR-073–082, DEC-026)`.

---

## Batch 4 · Admin

### 4.1 `_adminLayout` + `/admin` (§5.1, nav-model §4)
- New pathless layout: denser, cooler-toned shell (same tokens, tighter spacing, `bg-background` + slate accents), sidebar: نظرة عامة / مراجعات المهارات (badge+aging) / الاعتراضات / البلاغات / المستخدمون; top bar queue-jump search + admin chip. Mock role gate (TODO real guard).
- Dashboard: queue cards with counts + oldest-waiting age (DEC-011 bands: <24h عادي · 24–48 قريب الاستحقاق · 48–72 متأخر · >72 حرج).
- Commit: `feat(admin): admin shell + queue-health dashboard (mock)`.

### 4.2 `/admin/skill-reviews` + `/admin/skill-reviews/$userId` (§5.2–5.3)
- Queue: oldest-first rows (contributor, skill count, avg confidence band, waiting age chip). Workspace (desktop-first): three panes — skills table (اعتماد / تعديل المستوى (records original) / رفض بسبب إلزامي), evidence panel (sources + GitHub links), contributor context; batch «اعتماد الباقي»; «إنهاء المراجعة» summary confirm; next-in-queue (J/K keys).
- Commit: `feat(admin): skill review queue + workspace (AJ-1, mock)`.

### 4.3 `/admin/disputes` + `/admin/reports` (§5.4–5.5)
- List + side drawer pattern (shared `Drawer` overlay built here): dispute drawer shows contributor reason/evidence vs. original AI output side-by-side → تأييد / إلغاء (triggers re-evaluation note) / صرف النظر + notes required. Reports: polymorphic target preview → بدء تحقيق / حل (إيقاف مستخدم / أرشفة مشروع) / صرف النظر.
- Commit: `feat(admin): disputes + reports queues with drawers (AJ-2, mock)`.

### 4.4 `/admin/users` (§5.6)
- Search + role/status filters + user drawer (profile, skills, subscription, related reports); actions: تغيير الدور / إيقاف / إعادة تفعيل (confirm dialogs).
- Commit: `feat(admin): user management (mock)`.

---

## Shared overlays (build on first use)

`shared/components/modals/`: `confirm-dialog.tsx` (consequence copy slot — first used in 2.2 archive), `drawer.tsx` (first used in 4.3). `modules/*` own dispute-modal + report-modal (feature-specific). Notification popover lives in the shell (1.4).

## Commit ledger (order)

1. `feat(applications): applications list with status tabs (mock)`
2. `feat(applications): application pipeline detail with delivery flow (WF-05/06, mock)`
3. `feat(contributors): skills management page (WF-07, mock)`
4. `feat(notifications): notification center + bell popover (mock)`
5. `feat(settings): settings tabs incl. subscription usage (DEC-026, mock)`
6. `feat(dashboard): owner dashboard variant + role-aware sidebar (DEC-009, mock)`
7. `feat(projects): project management tabs (OJ-1/2, mock)`
8. `feat(projects): create contribution request (Principle 7, mock)`
9. `feat(projects): request management tabs (OJ-3/4, mock)`
10. `feat(contributors): owner onboarding variant (OJ-1, mock)`
11. `fix(home): WF-01 content audit`
12. `feat(pricing): plans page (FR-073–082, DEC-026)`
13. `feat(admin): admin shell + queue-health dashboard (mock)`
14. `feat(admin): skill review queue + workspace (AJ-1, mock)`
15. `feat(admin): disputes + reports queues with drawers (AJ-2, mock)`
16. `feat(admin): user management (mock)`

## Out of scope

Real API wiring, payments, chat/kanban/roadmaps/community ([Future] per IA §E), saved-projects backend, global omnisearch, role switching.
