# Share-k — Visual Direction Exploration (Step 9)

> ✅ **DECIDED (2026-07-12, DEC-008)**: **Registry** is the approved direction, with bilingual copy limited to brand moments (landing hero, marketing banners, selected empty states, brand introduction) — normal UI uses only the active language. Workbench and Weave remain documented as historical alternatives. The gate below is satisfied; token-set + high-fidelity work may begin.

> Three genuinely different answers to "what should trusted open-source collaboration infrastructure look like?" — none of them purple-gradient AI SaaS. Existing Figma/frontend styling is explicitly *not* a constraint (per phase brief). The existing logo (`public/logo-1.png`) is preserved in all three.
> **A recommendation is given at the end; the final choice is a human decision — no high-fidelity system will be built until a direction is selected.**

Shared non-negotiables (all directions): WCAG 2.1 AA contrast · full RTL mirroring with dual-script typography (Arabic is a first-class script, never a translated afterthought) · light + dark themes · the status-chip color grammar from `state-model.md` §6 · `prefers-reduced-motion` respected.

---

## Direction 1 — **Registry** (السجل)

**Strategic idea**: Share-k is a *system of record* for developer capability. Design it like the document infrastructure it is — a modern institutional ledger: calm surfaces, rigorous typography, evidence rendered like certified entries. The trust story ("human-reviewed, evidence-backed") becomes the aesthetic itself.

- **Emotional qualities**: credible, calm, precise, quietly confident — a notary, not a pitch deck.
- **Color**: warm paper neutrals (off-white `~#FAF8F4`, ink `~#1C1B18`) as the field; one institutional accent — deep green (`~#1E6B4F`, the color of approval/verification) used almost exclusively for verified/positive moments so it *earns meaning*; amber for attention; muted terracotta for negatives. Dark mode: warm charcoal, same accent logic. Color is rationed — a mostly-neutral UI where green ✓ *means something*.
- **Typography**: humanist sans for UI (e.g. **IBM Plex Sans + IBM Plex Sans Arabic** — one superfamily, both scripts, already in the repo's fonts); **IBM Plex Mono** for evidence artifacts (repo names, commits, confidence values). Generous type scale contrast: large quiet headings, dense readable tables.
- **Layout**: ruled structure — thin horizontal rules and aligned columns like a registry book; strong baseline grid; content-first max-widths (~1200); whitespace does the hierarchy work.
- **Cards**: flat, 1px borders, minimal radius (4–6px), no shadows at rest; hover = border darkens + subtle raise. Verified entities get a distinctive "certified entry" edge treatment (accent left-border LTR / right-border RTL).
- **Navigation**: quiet sidebar, text-first, small icons; active item = accent edge + filled text, no pill backgrounds.
- **Data viz**: minimal ink — proficiency as stepped bars (▓▓▓░ discrete levels, not smooth gradients — levels are discrete enums), confidence as labeled bands, reputation as plain large numerals with small-caps labels.
- **Illustration/imagery**: none decorative. The "illustrations" are real artifacts: skill cards, pipeline diagrams, evidence excerpts — the product illustrating itself (as wireframed in WF-01).
- **Motion**: restrained and archival — content settles (fade + 4–8px rise), state changes stamp (checkmark scale-settle ~180ms), analysis progress as steady typewriter-ish stage lines. Nothing loops.
- **React Bits fits**: Count Up (reputation numerals, once), Scroll Reveal (home sections, first-entry only), Animated List (analysis stages, notifications). Skip background effects entirely — this direction's hero is typographic.
- **Accessibility**: excellent baseline (high contrast ink/paper); care needed: green accent on paper must hold 4.5:1 (`#1E6B4F` passes); never color-only status (chips carry icon+text by rule).
- **Strengths**: matches "trusted infrastructure" positioning exactly; ages well; cheap to execute faithfully in Tailwind/shadcn; RTL-native (superfamily); impossible to mistake for template AI SaaS.
- **Risks**: can drift into dull/bureaucratic if spacing and type contrast aren't disciplined; needs one or two moments of warmth (activation, completion) so it doesn't feel cold; junior reviewers may read "plain" before they read "precise."

**Home page**: paper field, oversized quiet headline, the animated skill-profile evidence panel as the only "rich" object; sections separated by hairline rules; process pipeline drawn as a ruled ledger line with stations.
**Project discovery**: registry table-cards on hairline grid; language bars in ink; the accent appears only on fit hints ("3/3 ✓").
**Skill profile**: the flagship — rendered like a certificate/transcript: skills as ledger rows, verified rows carry the accent edge, admin adjustments as annotated marginalia ("approved as Intermediate — AI proposed Advanced").

---

## Direction 2 — **Workbench** (الورشة)

**Strategic idea**: Share-k is where developers *do work*, not read about it. A craft-workshop aesthetic built from developer-native materials: monospace accents, git/PR motifs, syntax-inspired color, dense purposeful panels. Feels like excellent tooling — closer to Linear/VS Code than to a marketing site.

- **Emotional qualities**: capable, energetic, insider, hands-on.
- **Color**: dark-first (deep slate `~#0F141A`, not pure black) with syntax-highlighting accent set: electric cyan (primary actions), warm yellow (attention), green (success), soft red (errors), violet reserved for AI moments (matching the state grammar). Light theme = cool workshop gray, same accents deepened.
- **Typography**: geometric sans for UI (Geist Sans — already in repo) + heavy use of **Geist Mono** for headings-as-labels (`// how it works`), data, and chips. Arabic: **IBM Plex Sans Arabic** paired carefully with Geist metrics; mono stays LTR by nature.
- **Layout**: panel-based — the app as an arrangement of toolbenches; tighter density than Registry; visible panel seams; command-palette-friendly.
- **Cards**: filled panels (elevated surface tone), 8px radius, crisp 1px inner borders; hover = accent border glow (low intensity); status expressed via left/right edge rails.
- **Navigation**: compact icon+label sidebar, keyboard-first affordances surfaced (⌘K hints, J/K in admin queues — this direction *loves* WF-11).
- **Data viz**: terminal-inspired — block-character bars (▓▓░), sparklines, diff-style +/− for reputation deltas, PR-state iconography for delivery pipeline.
- **Illustration**: ASCII/box-drawing ornaments, git-graph motifs as section dividers; zero mascots/3D.
- **Motion**: snappy tool-feedback (120–180ms), cursor-blink accents in analysis progress, panel slides for drawers; matching results "compile in" line by line.
- **React Bits fits**: Decrypted Text (hero headline — thematically earned here), Dot Grid (hero background, static-ish, one instance), Spotlight Card (featured projects), Animated List (queues/logs).
- **Accessibility**: dark themes need discipline — body text ≥ #C9D1D9 on #0F141A; glow effects must not carry meaning; mono-heavy text is harder for dyslexic readers → mono limited to tokens/labels, never body copy.
- **Strengths**: instantly credible with the developer audience; the AI-explainability content (justifications, evidence, traces) looks *native* in this language; best fit for admin/owner productivity surfaces.
- **Risks**: "GitHub clone" gravity is real (the brief warns exactly this); marketing pages are harder — dark dev-tool aesthetics convert developers but can alienate the trust/institutional story; Arabic + mono-heavy design needs extra type care (Arabic has no true monospace — use tabular-feature Plex Arabic for data).

**Home page**: dark hero with static dot-grid, decrypt-in headline, product panels as floating *workbenches* showing real UI; how-it-works as a git-graph (commit nodes = pipeline stages).
**Project discovery**: dense panel grid, filter rail as a toolbench, cards with language bars and diff-style fit indicators (`+2 matched / −1 missing`).
**Skill profile**: rendered like a lockfile/manifest — skills as verified entries with mono values, evidence expanding like a diff view.

---

## Direction 3 — **Weave** (نسيج)

**Strategic idea**: شارك means *to participate*. Collaboration is weaving — individual threads (contributors, commits, skills) interlacing into shared fabric (projects, reputation). A bilingual-first identity rooted in Arabic visual culture (geometric pattern logic, the horizontal flow of Arabic script) executed with contemporary restraint. The only direction that makes the Arabic identity a *feature* of the brand, not a localization task.

- **Emotional qualities**: warm, communal, generous, proud of its origin, optimistic.
- **Color**: deep indigo (`~#2B3A67`, woven-textile blue) + warm sand/paper field; accent pair: saffron amber (progress/attention) and oasis teal (verification/success); negatives in madder red. Dark mode: indigo-night field with sand text. Richer palette than Registry — but flat, textile-flat, never gradient-glow.
- **Typography**: dual-script pairing designed as one system — Arabic leads: a contemporary Arabic sans with real presence (IBM Plex Sans Arabic bold weights or Rubik Arabic) with Latin partner matched to its rhythm; big bilingual headlines where ar/en versions are art-directed together, not stacked as translations.
- **Layout**: woven grid — sections interlock (offset columns, alternating text/artifact bands) rather than stack; horizontal rhythm echoes script flow; generous radius (10–12px) and soft warmth.
- **Cards**: soft-filled surfaces on warm field, tactile 1px borders in indigo-tint; verified items get a subtle woven-border pattern (2px repeating geometric motif — the one place pattern appears in UI).
- **Navigation**: warm sidebar with filled-pill active state; the language toggle is celebrated in the header (ع ⇄ EN as a brand moment), not buried.
- **Data viz**: thread metaphor — skills as woven strands thickening with evidence; contribution pipeline as a thread passing through stations; reputation as an accumulating weave block. Executed as clean SVG, not literal texture.
- **Illustration**: geometric thread/knot compositions (SVG line art, 2px strokes, indigo+saffron) for empty states and onboarding — the only direction with illustrations; they explain (weaving = collaborating), never decorate randomly.
- **Motion**: threads draw in (SVG line-draw for pipelines/onboarding, 450–700ms first-entry), cards settle softly; completion moments "tie the knot" (small satisfying pull-tight animation). Most motion-forward direction — and most in need of the reduced-motion discipline.
- **React Bits fits**: Split Text (bilingual hero, once), Logo Loop (community/tech strip, slow), Stepper (onboarding), Magnet (final CTA, subtle). Background WebGL effects: none — texture comes from pattern, not shaders.
- **Accessibility**: indigo-on-sand passes AA at chosen values; pattern-borders are decorative-only (aria-hidden); Arabic-first type needs larger min sizes (Arabic readability at small sizes is worse — min 14px equivalent); line-draw animations require static fallbacks.
- **Strengths**: unmistakable identity no competitor can copy; perfect fit for a bilingual regional platform with global ambition; the warmth counterbalances AI-gate harshness (rejection screens feel humane here); strongest marketing-page potential.
- **Risks**: highest craft bar — bad execution reads as folkloric or unserious for a dev-tools audience; thread metaphor must stay subtle in dense work surfaces (admin/owner screens mostly drop it); dual-script art direction costs real design time per page.

**Home page**: bilingual woven headline (شارك / Share-k interlaced), thread-pipeline how-it-works drawing itself across the page, project cards as fabric swatches in an offset grid.
**Project discovery**: warm card grid, saffron fit-threads connecting "you" chip to matching requirement chips; filters in an indigo rail.
**Skill profile**: skills as strands entering the weave — pending strands loose (dashed), verified strands woven tight (solid, teal); the profile literally *tightens* as trust accumulates. The single best expression of Principle 8 in any direction.

---

## Recommendation

**Registry — with Weave's bilingual typographic ambition folded in** (art-directed dual-script headlines and the ع⇄EN brand moment are portable; they don't require the thread metaphor).

Why:
1. **Positioning fit**: the brief's target is "trusted infrastructure, not a job board." Registry *is* that sentence as an aesthetic. Workbench says "tool," Weave says "community" — both true, but trust is the differentiator the PRD locks (human review, evidence, explainability).
2. **The AI-trust content wins hardest here**: justifications, evidence trails, admin annotations look authoritative as ledger entries; the rationed green-check economy makes verification *feel* scarce and earned — which is the business model.
3. **Execution risk under an 8-sprint capstone**: lowest craft bar to hit excellently with Tailwind 4 + shadcn and fonts already in the repo (Plex family, Geist mono for artifacts). Weave done at 70% quality would hurt more than Registry done at 95%.
4. **Bilingual**: the Plex superfamily gives ar/en parity out of the box; Registry's ruled layouts mirror cleanly.

Runner-up if the team wants more visual heat: Weave, budgeted honestly (it costs the most design hours per screen).

**Gate resolved (DEC-008)**: Registry selected with the bilingual fold-in constrained to brand moments. Additional approved design guardrails: prioritize search, filters, skill badges, evidence indicators, status badges, reputation metrics, project/task cards, and clear workflow states; the product must not become a decorative social network, a project-management workbench, or an experimental artistic interface. Do not duplicate every heading in both languages.
