# Share-k Design System

Share-k is an AI-powered open-source collaboration platform: it analyzes GitHub activity,
validates technical skills, and matches developers to real open-source projects — helping
project owners find qualified contributors and giving developers a trusted path to build
experience, reputation, and career growth through open source.

**Sources used to build this system**
- Figma file "Sharek.fig" (mounted read-only) — pages: Authentication, Layout. Component
  families: Badges/Light, Notification_Badge, PP/light, Search Light Mode English, Filter,
  Iconly, Button, Button language, plus several standalone symbols (chevron-down, slider,
  user-profile-02, Profile-Detail/light...). Explore further with Figma's own file browser if
  you have file access — this project only had read-only VFS access, no live share link.
- GitHub repo [ITI-Sharek/Frontend](https://github.com/ITI-Sharek/Frontend) (branch `master`)
  — the actual Next.js/Tailwind/shadcn codebase. This was treated as the primary source of
  truth for token values and component markup because it's real shipped code, not a Figma
  reconstruction. Explore `docs/ARCHITECTURE.md` in that repo for the intended full-app folder
  structure (most of it — projects, kanban, chat, dashboard, etc. — is still greenfield/unbuilt;
  only the auth flow and a handful of shared UI primitives exist today).
- `uploads/logo.png` — the Share-k logo mark (provided directly by the user).

## What actually exists today vs. what's designed

The GitHub repo currently ships **one real surface: the authentication flow** (login,
register, forgot-password) plus five shared primitives (`Button`, `Input`, `Card`,
`Checkbox`, `Label`). `docs/ARCHITECTURE.md` describes a much larger target app (projects,
kanban, chat, roadmaps, AI assistant, admin panel) that has not been built yet. The Figma
file's "Layout" page sketches a sidebar + navbar app shell (light & dark) for that future
product, with small chrome symbols (notification badge, avatar/profile, search, filter,
language button). This design system reflects that reality: the **Auth UI kit** is a full,
faithful recreation of shipped code; the sidebar/navbar chrome symbols are captured as
components (`Avatar`, `NotificationBadge`) for future use, but a full dashboard/app-shell
screen was intentionally not invented from a sketch-stage Figma page — see "Caveats" below.

## Components

**Forms** (`components/forms/`): `Button`, `Input`, `Label`, `Checkbox`, `AuthTextField`,
`AuthPasswordField`, `ChipSelect`.
**Data display** (`components/data-display/`): `Card`, `RoleOptionCard`, `Avatar`,
`NotificationBadge`.
**Navigation** (`components/navigation/`): `StepIndicator`.
**Layout** (`components/layout/`): `AuthHeader`, `SiteFooter`, `AuthHero`, `AuthDivider`,
`SocialAuthButtons`.
**Icons** (`components/icons/`): `Icon` (Lucide wrapper, see Iconography).

### Intentional additions
- `Icon` — the real app imports `lucide-react` per-icon; this system needs one reusable
  wrapper since npm imports aren't available here. See Iconography below.
- `Avatar`, `NotificationBadge` — the Figma file defines these as one-off symbol instances
  inside the sidebar mockup (`PP/light`, `Notification_Badge` families); promoted to reusable
  components since they're generically useful chrome, not page-specific content.

## UI Kits

- `ui_kits/auth/` — interactive recreation of the shipped login / 3-step register / forgot-
  password flow. Open `index.html`. Toggle dark mode with the floating button (bottom-left);
  navigate via the in-flow links exactly as the real app would.

## Tokens

`tokens/colors.css` (light + `.dark` semantic + brand scale), `tokens/radius-spacing.css`
(radius tokens shrink in dark mode — verbatim from source, not a design choice to "fix"),
`tokens/typography.css` (font stacks + the type scale actually used in the auth flow).
`styles.css` is the single entry point consumers should link.

## Content fundamentals

- **Language & direction**: the entire product is Arabic-first, RTL (`dir="rtl"` on forms,
  labels right-aligned) with LTR islands for anything inherently Latin/technical — email
  addresses, passwords, the "Sharek" wordmark, GitHub URLs, and the language switcher itself
  render LTR even inside an RTL page.
- **Voice**: direct and encouraging, second person ("سجل دخولك" — "sign yourself in",
  "أخبرنا المزيد عنك" — "tell us more about yourself"). Short sentences, no marketing fluff.
  Error/empty copy is apologetic and actionable ("تعذر إنشاء الحساب، حاول مرة أخرى" — "couldn't
  create the account, try again").
- **Casing**: sentence case throughout; no ALL-CAPS labels, no title-case English overrides.
- **Emoji**: none anywhere in the shipped code or Figma content.
- **Field labels are terse nouns**, not full sentences ("البريد الإلكتروني", "كلمة المرور") —
  helper/subtext carries the sentence-level explanation instead.
- **Role-aware copy**: registration step 3 changes its questions entirely based on the
  chosen role (contributor gets skills/experience/interests; project owner gets
  organization/industry/team size) — copy is written to feel custom-tailored, not generic.

## Visual foundations

- **Color**: one brand hue — teal (`#2DD4BF` light / `#57F1DB` dark, deliberately *brighter*
  in dark mode, not the same value dimmed). Everything else is neutral gray-green
  (`#0E1513`/`#DDE4E1` ink, `#64748B`/`#BACAC5` muted). No secondary brand color, no
  gradients anywhere in the real app CSS (the Figma sidebar mockup uses soft radial glows and
  blurred warm-tinted panels as background texture, not the UI's semantic color system —
  treat those as page dressing, not tokens).
- **Type**: IBM Plex Sans Arabic for all UI copy (Arabic-first, handles Latin gracefully).
  Geist reserved *only* for the "Sharek" wordmark. Geist Mono for labels, footer text, and
  the small social/secondary button variant — this mono-for-labels choice is a deliberate,
  distinctive system trait (most apps use mono only for code).
- **Spacing/radius**: not on a 4/8px grid — copy exact values (33px card padding, 17px input
  padding, 0.65px label letter-spacing). Radius tokens actually *shrink* in dark mode
  (12→8px card, 8→4px input, 4→2px social) rather than staying constant — an intentional,
  unusual system trait, not noise.
- **Backgrounds**: flat and solid in the shipped auth UI — no photography, no illustration,
  no pattern/texture. The unbuilt Figma dashboard sketch uses soft warm-tinted radial glows
  and heavy backdrop blur behind the sidebar, suggesting a "glass panel over warm ambient
  light" treatment for the eventual app shell — not yet present in shipped code.
- **Shadows**: two families — a very soft double drop-shadow for cards (`0 4px 6px -1px
  rgba(0,0,0,.05), 0 2px 4px -2px rgba(0,0,0,.05)`, deeper single shadow in dark mode), and a
  colored "glow" shadow tinted to the primary teal under primary buttons only.
- **Hover/press**: primary buttons drop to 90% opacity on hover (no color shift); outline
  buttons tint their background toward the border color at 20%; ghost buttons (icon-only,
  e.g. theme toggle) just brighten text color from muted to full foreground. No press/active
  shrink effect anywhere in source — states are opacity/color only.
- **Borders**: 1px, always `var(--border)`, used liberally (every input, card, divider,
  footer/header rule) — this is a bordered system, not a shadow-only one.
- **Transparency/blur**: none in the shipped auth UI. Reserved for the unbuilt dashboard
  sidebar (heavy `backdrop-filter: blur(160-180px)` panels) — don't apply blur/glass
  treatments to auth or forms.
- **Animation**: minimal — CSS `transition-colors` only (hover/checked state fades), no
  entrance animation, no bounce/spring easing anywhere in source.
- **Corner radii**: three named radii, not ad hoc — `--radius-card` (12/8px), `--radius-input`
  (8/4px), `--radius-social` (4/2px, used for checkbox + outline/social buttons). Chips and
  role-badge circles use full pill/circle radius.
- **Cards**: bordered, no dividers inside, soft shadow, 33px padding — see `guidelines/`.

## Iconography

The real app uses **Lucide** (`lucide-react`, per `README.md`'s tech stack) — an open MIT
icon set available on Google Fonts' sibling CDN, `unpkg`. This system's `Icon` component
loads individual glyphs from `lucide-static` over CDN and recolors them via CSS mask, so
consumers get the exact same icon family without an npm install step. No icon font, no
emoji, no unicode glyphs-as-icons anywhere in source. One exception: `SocialAuthButtons`'
Google button uses a real multi-color brand SVG in the shipped app (not a Lucide glyph) —
since brand marks aren't redrawn from memory here, this system substitutes the closest
Lucide stand-in (`chrome`) and flags it in that component's prompt doc; swap in the real
Google "G" asset before shipping.

## Fonts

No missing fonts — IBM Plex Sans Arabic, Geist, and Geist Mono are all available directly on
Google Fonts under their real names (loaded in `tokens/typography.css`). No substitution
needed.

## Caveats / asks for the user

- **Figma access was read-only VFS**, not a live Figma link — some finer details (exact
  per-character text styles, a couple of nested instance overrides in the sidebar mockup)
  couldn't be fully resolved; the GitHub repo's real code was treated as the tiebreaker
  wherever the two disagreed.
- **Only the auth flow is real, shipped UI.** The dashboard/sidebar/kanban/chat/etc. described
  in `docs/ARCHITECTURE.md` and sketched loosely in Figma's "Layout" page do not have real
  component code yet — I deliberately did not invent full screens for them. If you'd like a
  first-pass "App Shell" UI kit (sidebar + navbar, light/dark) built from the Figma sketch as
  a starting point for that future work, tell me and I'll build it as a clearly-labeled
  concept, not a "real screen."
- **Google's icon** in `SocialAuthButtons` is a Lucide stand-in, not the real Google mark —
  swap in the actual brand SVG for production use.
- Please push back on any color/spacing value that looks off — several numbers here (33px
  padding, 0.65px tracking, shrinking dark-mode radii) are unusual and worth double-checking
  against the live Figma file if you have edit access.

## Index

- `styles.css`, `tokens/` — global tokens (colors, radius/spacing, typography)
- `assets/` — `logo.png` (provided), `logo-mark.png` + `favicon.ico` (from repo `public/`)
- `components/forms/`, `components/data-display/`, `components/navigation/`,
  `components/layout/`, `components/icons/` — see "Components" above
- `guidelines/` — 13 foundation specimen cards (color, type, spacing/radius, shadow, brand)
- `ui_kits/auth/` — interactive login/register/forgot-password recreation
- `SKILL.md` — portable skill definition for Claude Code / other agents
