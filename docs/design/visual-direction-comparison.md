# Share-k — Visual Direction Comparison (Phase 2)

> Scored after building the Phase 2 visual concepts (`docs/design/visual-exploration/` — style tile + Explore Projects desktop 1440 / mobile 390 per direction, identical content across all three).
> Scale 1–5, higher is better. For "Implementation complexity" and "Performance risk," higher = **less** complex / **less** risky, so totals stay comparable.
> Scores were assigned from the built artifacts, not from the Phase 1 recommendation. Ties are allowed where directions genuinely tie.
> Note: DEC-008 recorded **Registry** as the paper decision before this visual validation. This matrix is the check on that call — it was scored honestly, and the human decision below (see `visual-direction-recommendation.md`) may confirm or revise DEC-008.

| # | Criterion | A · Registry | B · Workbench | C · Weave |
|---|---|:---:|:---:|:---:|
| 1 | Share-k brand distinctiveness | **4** | **3** | **5** |
| 2 | Trustworthiness | **5** | **3** | **4** |
| 3 | Developer relevance | **4** | **5** | **3** |
| 4 | AI explainability | **5** | **5** | **4** |
| 5 | Open-source character | **3** | **5** | **4** |
| 6 | Community feeling | **2** | **3** | **5** |
| 7 | Dense product interfaces | **5** | **5** | **3** |
| 8 | Marketing website | **4** | **2** | **5** |
| 9 | Accessibility | **5** | **3** | **4** |
| 10 | Arabic & RTL suitability | **4** | **2** | **5** |
| 11 | Mobile scalability | **4** | **3** | **4** |
| 12 | Motion potential | **3** | **4** | **5** |
| 13 | React Bits compatibility | **3** | **4** | **4** |
| 14 | Implementation complexity (5 = simplest) | **5** | **4** | **2** |
| 15 | Performance risk (5 = safest) | **5** | **3** | **4** |
| 16 | Long-term maintainability | **5** | **4** | **2** |
| | **Total (max 80)** | **66** | **58** | **63** |

## Score explanations

**1 · Brand distinctiveness** — Registry (4): a paper-and-ink registry is rare in dev products, but the genre "calm institutional docs site" exists. Workbench (3): excellent execution still gravitates toward the Linear/GitHub-dark family — the concept screens confirm the "GitHub clone gravity" the brief warns about. Weave (5): no competitor looks like this; the identity is derived from the logo's own interweaving idea and can't be copied without copying Share-k.

**2 · Trustworthiness** — Registry (5): the certified-entry edges, rationed green, and ledger typography *are* the trust story; the built explore page reads like official records. Workbench (3): credible as tooling, but dark syntax-glow aesthetics read "product," not "institution" — trust rests on copy alone. Weave (4): warm and honest, and the tightening-thread metaphor expresses earned trust well, though warmth reads slightly less authoritative for admin/dispute surfaces.

**3 · Developer relevance** — Workbench (5): diff-style `+/−` fit indicators, terminal loading, ⌘K — developers read this instantly. Registry (4): mono-for-artifacts and evidence language speak developer clearly, in a quieter register. Weave (3): threads communicate to everyone, but nothing in the visual language is developer-native; tags and repo names do that work alone.

**4 · AI explainability** — Registry (5): the WF-06 ExplanationCard renders naturally as an annotated ledger entry; labeled confidence bands look like certification levels. Workbench (5): matched/missing as a diff is arguably the single clearest fit-explanation grammar of the three. Weave (4): solid/dashed threads explain fit elegantly at card level but get strained for dense evidence lists (admin review, disputes).

**5 · Open-source character** — Workbench (5): looks like the tools open-source is built with. Weave (4): communal fabric is philosophically the closest to what open source *is*. Registry (3): institutional register can read "certification body" more than "community of practice."

**6 · Community feeling** — Weave (5): the entire metaphor is people interlacing; the warm palette carries it. Workbench (3): insider camaraderie ("built by people like you"), not warmth. Registry (2): deliberately impersonal — its weakest criterion, needs designed moments of warmth.

**7 · Dense product interfaces** — Registry (5): hairline rules and aligned columns are made for tables and queues (admin workspace, applications list). Workbench (5): panel seams and compact density equally strong; best keyboard-throughput story. Weave (3): pill shapes, 12px radius, and generous spacing cost vertical density; the metaphor must be dropped on dense surfaces (already conceded in Phase 1).

**8 · Marketing website** — Weave (5): bilingual art-directed headlines and explaining illustrations make the strongest landing page by far. Registry (4): the quiet typographic hero with a real product artifact is confident and differentiated, if sober. Workbench (2): dark dev-tool marketing converts developers but undercuts the institutional trust story for owners, and its light-theme translation is unresolved.

**9 · Accessibility** — Registry (5): ink on paper starts near-maximal contrast; `#1E6B4F` on `#FAF8F4` passes 4.5:1; icon+text chips by rule. Workbench (3): passes AA with the chosen values, but every future color decision fights dark-mode contrast; glow-on-hover must never carry meaning; mono-heavy text is harder for dyslexic readers. Weave (4): indigo-on-sand passes comfortably; risks are concentrated in decorative pattern (must stay aria-hidden) and the heavier motion budget.

**10 · Arabic & RTL** — Weave (5): Arabic is the lead script, not a mirror; the horizontal weave rhythm mirrors natively. Registry (4): Plex superfamily gives real ar/en parity; ruled layouts mirror cleanly; certified edge flips with `border-inline-start`. Workbench (2): Arabic has no monospace, so the mono-label grammar (`// section`, `$ prompts`) — the direction's signature — doesn't translate; diff `+/−` glyphs in RTL need bespoke handling.

**11 · Mobile scalability** — Registry (4): light, flat, thin borders survive small screens; only hairline-density needs coarsening. Weave (4): pills and big radii are naturally touch-friendly; motion must be cut aggressively (already specified). Workbench (3): the mobile concept works, but glow hover has no touch equivalent, mono at small sizes strains readability, and density needs the most rework per screen.

**12 · Motion potential** — Weave (5): thread-draw, knot-tying, weave-in loading — the richest coherent motion vocabulary (and the biggest reduced-motion obligation). Workbench (4): snappy tool feedback and compile-in results are satisfying and cheap. Registry (3): deliberately minimal; the stamp moment is excellent but the ceiling is low by design.

**13 · React Bits compatibility** — Workbench (4): Decrypted Text / Dot Grid / Spotlight Card fit thematically with little restyling. Weave (4): Split Text / Logo Loop / Stepper fit the metaphor (Arabic split-by-word caveat noted on the tile). Registry (3): only Count Up / Scroll Reveal / Animated List survive its restraint, all heavily restyled — low compatibility is a design choice here, not a defect.

**14 · Implementation complexity** — Registry (5): flat surfaces, 1px borders, two fonts already available, near-default shadcn/Tailwind idiom; hardest part is discipline, not build. Workbench (4): dark theme done *well* (contrast ladders, glow tuning, light-theme twin) is real work but well-trodden. Weave (2): dual-script art direction per brand moment, SVG illustration set, pattern borders, and a bespoke motion system — the highest craft bar per screen for a 6-person, 8-sprint capstone.

**15 · Performance risk** — Registry (5): no shadows, no effects, no loops — nothing to optimize. Weave (4): SVG line-draws are cheap and first-entry-only; the pattern band is pure CSS; risk is motion sprawl, mitigated by the motion governance table. Workbench (3): pointer-reactive dot grid, spotlight tracking, and glow shadows on hover are each small, but they stack on card grids and cost on low-end mobiles.

**16 · Long-term maintainability** — Registry (5): smallest token surface; new screens compose from rules + type with little bespoke design. Workbench (4): maintainable as long as the accent grammar is policed; dual light/dark upkeep. Weave (2): every new brand moment needs art direction in two scripts, and the illustration set grows with the product; quality erodes fastest under time pressure.

## Reading the totals

Totals are a summary, not the decision — the criteria are not equally weighted for Share-k. If the team weights **trust + AA accessibility + capstone deliverability** (the PRD's locked differentiators and the project's real constraint), Registry's lead widens. If it weights **brand memorability + bilingual identity + marketing impact**, Weave overtakes it. Workbench does not win under any weighting that includes the marketing site and Arabic parity, but it contributes the best evidence/diff grammar — worth borrowing.

The recommendation and the exact human decision needed are in `visual-direction-recommendation.md`.
