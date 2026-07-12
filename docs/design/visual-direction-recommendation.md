# Share-k — Visual Direction Recommendation (Phase 2)

> Based on the built concepts in `docs/design/visual-exploration/` and the scored matrix in `visual-direction-comparison.md`. This document recommends; **the selection is a human decision**. DEC-008 already recorded Registry on paper — this phase either confirms it with visual evidence or gives the team grounds to revise it. No high-fidelity system work should start until the decision below is confirmed against the actual artifacts.

## Recommendation: **Direction A — Registry**, with two borrowed traits

Primary direction: **Registry (السجل)** — paper field, ink typography, hairline structure, rationed verification green.

Borrowed traits (the only two, applied within Registry's rules):

1. **From Weave — the bilingual brand layer.** Art-directed dual-script headlines at brand moments only (landing hero, marketing banners, selected empty states) and the ع ⇄ EN toggle as a visible header control. This is already scoped by DEC-008 and costs little: the Plex superfamily is shared, and Registry's ruled layouts mirror cleanly.
2. **From Workbench — the diff/terminal grammar for evidence surfaces.** Matched/missing skills rendered as `+ / −` mono lines, and the GitHub-analysis progress as an appending mono stage log. Registry already reserves IBM Plex Mono for artifacts, so this drops in without importing the dark theme or the glow.

Nothing else crosses over. In particular: no thread illustrations inside product UI, no dark-first default, no pill radii, no `//` section labels.

## Why Registry

**Why it represents Share-k.** The PRD's locked differentiator is not "AI matching" (commodity) — it is *human-reviewed, evidence-backed capability records*. Registry makes that positioning the aesthetic itself: skills render as ledger rows, verification as a certified-entry edge, admin adjustments as annotated marginalia. In the built explore concept, the one place green appears is the fit evidence — the scarcity is visible, and scarcity is the business model.

**Why it supports both contributors and project owners.** Contributors get a profile that looks like a credential worth sharing (the registry/transcript rendering). Owners get review surfaces where AI output looks like a shortlist memo awaiting *their* signature — Principle 3's "humans decide" reads directly off the visual hierarchy. The same calm register serves the admin queue without a separate visual dialect.

**Why it scales across marketing and application pages.** The marketing page is the product artifact itself on paper — no separate "marketing skin" to maintain. The identical token set drove the 1440 dense grid and the 390 single-column concepts with nothing redesigned but layout; density scales by tightening the baseline grid, not by changing the language.

**Why it supports trust and AI explainability.** The WF-06 ExplanationCard anatomy (verdict → labeled confidence band → reasoning → matched/missing → evidence → who decides next) needs a visual language where quiet text, rules, and small mono annotations feel *native* rather than like a legal disclaimer bolted onto a glossy card. That is exactly what Registry is. With trait 2 borrowed, matched/missing becomes a diff — the clearest possible rendering for the developer audience.

**Why it is suitable for English and Arabic.** IBM Plex Sans + IBM Plex Sans Arabic is one superfamily: same weights, same rhythm, both scripts first-class — and it's already in the repo. Ruled, column-aligned layouts mirror mechanically under `dir="rtl"` (the certified edge uses logical properties). The style tile demonstrates the mirrored match card with LTR technical tokens embedded per Principle 6.

**Deliverability (the honest tiebreaker).** This is an 8-sprint capstone with one designer-tester. Registry is near-default shadcn/Tailwind idiom: flat surfaces, 1px borders, two font families, no shadow system, no illustration pipeline. Weave at 70% execution would look folkloric; Registry at 95% looks institutional. The risk-adjusted quality gap is the strongest argument in the matrix.

## Risks to control

| Risk | Control |
|---|---|
| Drifts into dull/bureaucratic ("plain before precise") | Enforce large type-scale contrast (34–44px quiet headings vs 13.5px dense rows); whitespace is the hierarchy — protect the 24/32/48 rhythm in review |
| Feels cold at emotional moments | Budget exactly three designed warmth moments: profile approved (stamp), first task completed (reputation delta), onboarding welcome — nowhere else |
| Green accent inflation | Lint-level rule: `--verify` only on verified/approved/success-terminal states; primary buttons stay ink |
| Hairline rules too faint on low-quality screens / high-DPI Windows | Test `#E3DED2` at 1x; darken to `--rule-strong` where legibility fails |
| Amber attention color `#9A5B00` close to terracotta negative for color-blind users | Icon + text on every chip (already a state-model rule); never color-only |
| Borrowed diff grammar leaking Workbench styling | `+/−` lines use Registry ink/verify/terracotta colors, never cyan/glow; scoped to evidence panels only |

## Ideas explicitly *not* merged

To prevent the "inconsistent final style" failure mode: Workbench's dark-first theme, dot-grid textures, spotlight cards, and `//` labels are out; Weave's thread data-viz, woven pattern borders, illustration set, and pill geometry are out. Dark mode ships later as Registry-warm-charcoal (same tokens, inverted), not as Workbench.

## The decision needed from the team (before Phase 3)

1. **Confirm or revise DEC-008** now that the three directions exist visually: open the six explore-projects concepts side by side and pick the primary direction. If Registry is confirmed, record "DEC-008 confirmed after Phase 2 visual validation" in the decision log; if not, supersede it explicitly.
2. **Approve or trim the two borrowed traits** (bilingual brand layer; diff/terminal evidence grammar) — these define the token-set scope for Phase 3.
3. **Set the dark-mode timing** (MVP or post-MVP) — it changes the Phase 3 token budget.

Phase 3 (design-system tokens + high-fidelity screens, starting with the four high-fidelity candidates from `screen-inventory.md`) starts only after item 1 is recorded.
