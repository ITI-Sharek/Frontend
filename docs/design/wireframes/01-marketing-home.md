# 01 · Marketing home (`/`)

**Job**: in 10 seconds a visitor understands "verified open-source experience, AI-matched" and picks a door (contribute / own a project). The page argues with *product evidence*, not adjectives.

```
┌────────────────────────────────────────────────────────────────────┐
│ Share-k ⌂   Explore  How it works  Pricing        [ع/EN] Sign in [Get started] │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  Build experience that           ┌───────────────────────────────┐ │
│  can be verified.                │  PRODUCT EVIDENCE PANEL       │ │
│                                  │  a real skill-profile card:   │ │
│  Connect GitHub. Get an          │  ┌─────────────────────────┐  │ │
│  evidence-based skill profile,   │  │ @sara-dev               │  │ │
│  reviewed by humans. Contribute  │  │ React ((Verified ✓))     │  │ │
│  to projects matched to what     │  │  └ evidence: 3 repos    │  │ │
│  you can actually do.            │  │ Node.js ((Verified ✓))   │  │ │
│                                  │  │ rating 4.8 · 18 tasks   │  │ │
│  [Start contributing]            │  └─────────────────────────┘  │ │
│  [I have a project →]            │  (animates through pipeline)  │ │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS — one connected pipeline, not 5 cards                │
│  GitHub ──▶ AI analysis ──▶ Human review ──▶ Verified ──▶ Matched  │
│  connect    skills+evidence  admin approves   profile     tasks    │
│  (step detail expands on hover/tap; mirrors real product states)   │
├────────────────────────────────────────────────────────────────────┤
│  TRUST BLOCK — "AI proposes. People decide."                       │
│  Every AI skill is human-reviewed before it counts. Every AI       │
│  decision shows its reasoning and can be disputed. (links: how     │
│  validation works)                                                 │
├────────────────────────────────────────────────────────────────────┤
│  FEATURED PROJECTS (real published data; else "sample" labeled)    │
│  ┌ project card ┐ ┌ project card ┐ ┌ project card ┐  [Explore →]  │
├────────────────────────────────────────────────────────────────────┤
│  TWO AUDIENCES — editorial split, not twin card columns            │
│  ┌ For contributors ────────────┐┌ For project owners ───────────┐ │
│  │ narrative: from first PR to  ││ narrative: only pre-qualified │ │
│  │ verified reputation… example ││ applicants… example: "12      │ │
│  │ profile strip                ││ applied · you review 4"       │ │
│  └──────────────────────────────┘└───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────┤
│  PRICING TEASER (3 tiers × role toggle)          [See pricing]     │
├────────────────────────────────────────────────────────────────────┤
│  FINAL CTA  "Your next meaningful contribution is waiting."        │
│  [Start contributing]   [Publish a project]                        │
│  FOOTER: product / resources / legal / GitHub / language           │
└────────────────────────────────────────────────────────────────────┘
```

**Hierarchy**: hero value prop → proof (how-it-works + trust) → inventory (projects) → segmentation (two audiences) → price → close. Trust block sits high: human review is the differentiator competitors can't claim.

**Decision support**: the two doors (contribute/own) appear in hero and final CTA; everything between answers the two audiences' respective objections ("is my skill judged fairly?" / "will I waste time on unqualified applicants?").

**States**: featured projects loading (skeleton) / no published projects (hide section, never fake); metrics only when real or explicitly "sample data".

**Mobile**: hero stacks (text → evidence panel); pipeline rotates vertical; audience split stacks; sticky bottom [Get started].
**RTL**: full mirror; pipeline flows right→left; evidence-panel code/repo tokens stay LTR.
