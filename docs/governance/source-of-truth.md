# Share-k — Source-of-Truth Hierarchy

> Adopted 2026-07-12 (DEC-020). When two sources disagree, the higher rank wins. Conflicts are recorded in `conflict-register.md`, never resolved silently.

## Hierarchy

1. **Approved product decision log** — `docs/governance/decision-log.md`
2. **Current PRD** — `bmad/_bmad-output/planning-artifacts/prds/prd-Grad_Project-2026-06-17/prd.md`
3. **Jira backlog** — https://karimmuhammad.atlassian.net/jira/software/projects/SK/boards/34
4. **Current UX phase brief + approved wireframes** — `docs/design/` (wireframes are approved layout intent once referenced by a decision)
5. **API / OpenAPI contract** — `docs/design/api-contract-additions.md` + backend OpenAPI when generated (implemented surface documented in `docs/API.md`)
6. **Local exported backlog** — `bmad/_bmad-output/sharek-backlog.md` (snapshot; Jira supersedes it)
7. **Historical architecture and design documents** — anything marked Superseded (e.g. `docs/design/master-brief.md`), plus pre-decision drafts

## Scope clarifications

- **Jira wins for**: task status, assignment, sprint scope, accepted implementation work.
- **Jira does not override**: approved product policy (rank 1) or PRD requirements (rank 2). A Jira ticket contradicting a decision-log entry is a conflict — register it.
- **ERD docs** (`bmad/_bmad-output/ERD/`) are the schema *reference*; where they lag the decision log, `_MVP-DECISION-DELTA.md` in that folder lists the binding changes until each entity file is updated.
- **`docs/ARCHITECTURE.md`** governs frontend code structure (with `.specify/memory/constitution.md` controlling governance). Its *feature module list* beyond the PRD is architecture intent only — outside current MVP scope (DEC-017).

## Figma (DEC-020, DEC-027)

- Canonical file URL: **Pending human confirmation**
- Current authority status: Not available
- Implementation rule: No screen is considered Figma-approved until the canonical file URL and approved page/section are recorded.

When the URL is provided, record:

```md
- Canonical file URL:
- Approved page:
- Approved section:
- Approved by:
- Approval date:
- Status: APPROVED
```

- Every Figma page/screen carries one status: `DRAFT` · `READY_FOR_REVIEW` · `APPROVED` · `SUPERSEDED`.
- Only `APPROVED` screens are implementation-ready. The pre-redesign Figma file is `SUPERSEDED` in its entirety (per the UX phase brief).
- A local `.fig` filename without an accessible canonical URL must not be treated as the active source of truth (DEC-027).
