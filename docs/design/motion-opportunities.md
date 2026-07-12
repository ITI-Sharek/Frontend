# Share-k — Motion Opportunity Map (Step 10)

> No implementation in this phase. Each entry: product purpose · trigger · duration/easing · mobile · reduced-motion fallback · performance note · React Bits suitability.
> Global rules: one easing family product-wide (standard deceleration `cubic-bezier(0.2, 0, 0, 1)`; small spring only on "settle" moments) · first-entrance-only for scroll reveals · `prefers-reduced-motion` always honored · animate transforms/opacity only · pause anything continuous off-viewport. `framer-motion` is already installed — no additional animation libraries.

## Accepted opportunities

| # | Moment | Product purpose | Trigger | Duration / easing | Mobile | Reduced-motion fallback | Performance | React Bits? |
|---|---|---|---|---|---|---|---|---|
| 1 | **Onboarding stepper advance** | Show forward progress through activation (CJ-1) | Step completion | 240ms slide+fade, decel | Same | Instant swap, step counter updates | Trivial | Stepper: suitable, restyle |
| 2 | **GitHub analysis stage feed** (WF-08) | Proof of real work during a multi-minute wait; reduces abandonment | Stage events from backend | Stage line: 180ms fade-in; bar: width transition 300ms | Same | Lines appear instantly; textual "7 of 12" | Trivial; no canvas | Animated List: suitable |
| 3 | **Skill "verified" stamp** | Make verification feel earned (activation & review-result moments) | Admin decision revealed | 320ms check scale-settle (0.8→1, slight overshoot) | Same | Static ✓ appears | Trivial | No — custom |
| 4 | **Application pipeline progression** (WF-05/06, application detail) | Explain *where you are* in the gate → owner → delivery chain (Principle 4) | Status change / first view of new stage | Connector line draws 400ms; node fills 200ms | Vertical pipeline, same | Filled states render statically | SVG stroke-dash — cheap | No — custom SVG |
| 5 | **AI validation "checking" state** | Honest processing feedback at the anxiety peak (apply moment) | Application submitted | Indeterminate shimmer on stage text, 1.2s loop, pauses on blur | Same | Static "Checking…" + spinner replaced by text updates | Loop must pause off-tab (rAF discipline) | No |
| 6 | **Ineligible → "what now" reveal** (WF-12) | Soften the hardest moment; guide eyes from verdict to recovery actions | Outcome render | Verdict first, then WHAT-NOW items stagger in 3×80ms | Same | All visible immediately | Trivial | No |
| 7 | **Gold guidance streaming** | Perceived intelligence + FR-085 streamed responses | Tokens arrive | Text streams; sections slide-fade 200ms as they complete | Same | Sections appear whole when complete | Virtualize long narrative; no per-char reflow of layout | No |
| 8 | **Reputation delta tick** (dashboard, completion moment) | Principle 8 — growth made visible | Completion screen / dashboard first load after change | Count 4.6→4.8 over 600ms, once per session | Same | Final value + "▲ +0.2" badge | Trivial | Count Up: suitable, once-only config |
| 9 | **Owner review queue item resolve** | Confirm the decision landed; keep queue rhythm satisfying (OJ-3/4, AJ-1) | Accept/reject/approve action | Card collapses 220ms; next card rises 180ms | Same | Item disappears, list reflows instantly | Height animation — use transform/clip, not layout anim on long lists | No |
| 10 | **Notification popover + badge** | System status visibility | Bell click / new notification | Popover 200ms scale-fade from anchor; badge pop 150ms | Sheet slides 260ms | Instant open; badge static | Trivial | No |
| 11 | **Home how-it-works pipeline** (WF-01) | The one marketing set-piece: the product's flow explains itself | Scroll into view, **first time only** | Sequential stage highlight, total ≤1.2s | Simplified: stages fade in, no draw | Static complete diagram | IntersectionObserver, disconnect after fire | Scroll Reveal: suitable for sections |
| 12 | **Hero evidence panel rotation** (WF-01) | Show profile→verify→match story without video | Autoplay, 4s per state, pauses on hover/focus | Crossfade 400ms between states | Static single state + manual dots | Static first state | Pause off-viewport; no WebGL | No (custom); background effects rejected |
| 13 | **Card hover affordance** | Clickability feedback on dense card grids | Hover/focus | 140ms border/elevation shift; translate ≤2px | None (touch: active state) | Border color only | CSS-only | Spotlight Card acceptable *only if* Workbench direction chosen |
| 14 | **Drawer/modal transitions** (admin drawers, apply modal, filter sheets) | Spatial continuity — where panels come from | Open/close | 260ms slide+fade decel; overlay fade 200ms | Bottom sheets 280ms | Instant with overlay fade 100ms | Transform-only | No — Radix + framer-motion |
| 15 | **Route transitions** | Continuity between major surfaces | Navigation | ≤150ms content fade; **never delay data** | Same | None | Must not block TanStack Router transitions | No |

## Rejected (decorative, distracting, or maintenance-heavy)

| Rejected | Why |
|---|---|
| Continuous hero backgrounds (Aurora, Orb, Threads, Light Rays, Grid Motion) | Compete with content; WebGL cost on mobile; trust brand ≠ ambient spectacle. At most one *static* texture per visual direction. |
| Per-heading text effects (Blur/Rotating/Shiny Text) beyond the single hero moment | Animation inflation; readability first (one hero effect max, direction-dependent). |
| Tilted Card / Glare Hover / heavy 3D tilts | Comparison surfaces (WF-03) must stay scannable; motion on every card is noise. |
| Magnet buttons on primary CTAs | Pointer-chasing harms precision and accessibility; acceptable only as micro-effect (≤4px) on the final marketing CTA, if the chosen direction wants it. |
| Circular Gallery for projects | Novelty browsing hurts comparison; grid + filters is the job. |
| Confetti/celebration explosions on approval | One tasteful stamp (row 3) carries the moment; confetti cheapens an *earned* verification. |
| Scroll-jacking / parallax sections | Blocks reading, hostile on mobile, banned by brief. |
| Animated number rolling on every dashboard visit | Metrics re-animating on each scroll = false novelty; once per real change only (row 8). |

## Governance

- Motion tokens (durations, easings, distances) defined once in the future design system; components consume tokens — no inline magic numbers.
- Every motion PR answers: *which row of this table is this?* New motion = new row proposed here first.
- QA checklist per motion: reduced-motion path exists · off-viewport pause (if looping) · no layout-property animation · mobile behavior specified · keyboard/focus parity with pointer.
