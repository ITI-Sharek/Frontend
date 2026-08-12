# TASK-7-01 — Accessibility audit

Date: 2026-08-11

## Scope

The audit covered the shared authenticated shell, authentication header and
forms, root document metadata, and the core delivery/dashboard surfaces that
reuse the shared layout and feedback primitives. The audit used source review
and rendered DOM regression tests at the public component seams. A browser axe
runner is not yet part of the frontend toolchain; automated E2E accessibility
coverage belongs to TASK-7-02.

## Findings and disposition

| ID | Finding | Disposition |
| --- | --- | --- |
| A11Y-01 | The adjustable sidebar separator accepted pointer input only and had no value metadata. | Fixed: it is focusable, exposes min/max/current width, and supports Home/End plus direction-aware arrow resizing. |
| A11Y-02 | Decorative theme, field, password, and navigation icons were not consistently hidden from assistive technology. | Fixed: decorative icons now use `aria-hidden="true"`; their parent controls retain the accessible names. |
| A11Y-03 | The signed-out language affordance was a button without an action. | Fixed: it is now a labelled non-interactive current-language indicator. Authenticated language persistence remains in Settings; full runtime RTL/LTR switching is a follow-up. |
| A11Y-04 | Framer Motion animations were not centrally configured for users who prefer reduced motion. | Fixed: the app provider uses Framer Motion's `reducedMotion="user"` policy. |
| A11Y-05 | Browser theme-color metadata referenced the newer blue-neutral palette after the legacy tokens were restored. | Fixed: light/dark metadata now matches the active legacy tokens. |

## Remaining verification

- TASK-7-02 should add browser-level keyboard, responsive, RTL/LTR, and axe
  coverage for the critical demo journeys.
- Full runtime language switching remains intentionally outside this slice;
  the current UI communicates the active Arabic language without presenting a
  non-functional action.
