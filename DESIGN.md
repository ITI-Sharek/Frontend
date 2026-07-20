---
name: Share-k
description: A trustworthy record of real people completing meaningful open-source work.
colors:
  institutional-indigo: "#2E3192"
  institutional-indigo-dark: "#9AA3F0"
  on-indigo: "#FFFFFF"
  on-indigo-dark: "#10132B"
  evidence-teal: "#2DD4BF"
  evidence-teal-dark: "#57F1DB"
  on-evidence: "#0E1513"
  on-evidence-dark: "#003731"
  registry-ink: "#0E1513"
  registry-paper: "#FFFFFF"
  evidence-slate: "#64748B"
  hairline-rule: "#E2E8F0"
  surface-fog: "#F8FAFC"
  dark-canvas: "#0E1513"
  dark-ink: "#DDE4E1"
  dark-slate: "#BACAC5"
  dark-rule: "#3C4A46"
  dark-card: "#1A211F"
  danger-red: "#DC2626"
  danger-red-dark: "#F87171"
  review-amber: "#D97706"
  review-amber-dark: "#FBBF24"
  advisory-violet: "#6B5CA5"
  advisory-violet-dark: "#A78BFA"
typography:
  display:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "normal"
  title:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.45
    letterSpacing: "normal"
  body:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Sans Arabic, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.65px"
  technical:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.65px"
rounded:
  social-light: "4px"
  social-dark: "2px"
  input-light: "8px"
  input-dark: "4px"
  card-light: "12px"
  card-dark: "8px"
  pill: "9999px"
spacing:
  compact: "4px"
  tight: "6px"
  small: "8px"
  medium: "12px"
  regular: "16px"
  roomy: "24px"
  large: "32px"
  section: "48px"
components:
  button-primary:
    backgroundColor: "{colors.institutional-indigo}"
    textColor: "{colors.on-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.input-light}"
    padding: "10px 16px"
    height: "44px"
  button-outline:
    backgroundColor: "{colors.registry-paper}"
    textColor: "{colors.registry-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.input-light}"
    padding: "10px 16px"
    height: "44px"
  button-danger:
    backgroundColor: "{colors.danger-red}"
    textColor: "{colors.registry-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.input-light}"
    padding: "10px 16px"
    height: "44px"
  field-default:
    backgroundColor: "{colors.registry-paper}"
    textColor: "{colors.registry-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.input-light}"
    padding: "13px 17px"
    height: "50px"
  card-default:
    backgroundColor: "{colors.registry-paper}"
    textColor: "{colors.registry-ink}"
    rounded: "{rounded.card-light}"
    padding: "32px"
  navigation-active:
    backgroundColor: "{colors.institutional-indigo}"
    textColor: "{colors.on-indigo}"
    typography: "{typography.label}"
    rounded: "{rounded.input-light}"
    padding: "10px 12px"
    height: "44px"
  evidence-verified:
    backgroundColor: "{colors.evidence-teal}"
    textColor: "{colors.on-evidence}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: Share-k

## Overview

**Creative North Star: "The Human Contribution Registry"**

Share-k is structured like a contribution registry: calm, precise, evidence-led, and durable enough to feel trustworthy. It borrows the documented narrative quality of a casebook for completed contributions and the human warmth of a workshop so the product remains encouraging rather than bureaucratic or clinical. The intended impression is a trustworthy record of real people completing meaningful work—not a cold institutional database.

The hierarchy always starts with the project or contribution, the people involved, the current state, the next action, and the supporting evidence. Completed-contribution views may tell a concise narrative, but every statement remains traceable to evidence and review outcomes. Human warmth comes from plain language, contributor context, respectful feedback, comfortable spacing, and purposeful moments of recognition—not decorative gradients, engagement mechanics, or unsupported prestige.

This document is normative for new and redesigned screens. The `--primary` token now resolves to Institutional Indigo app-wide (`src/styles/tokens.css`), and generic-action call sites that previously borrowed it for verified/accepted/confirmed states have been moved to Evidence Teal explicitly. Keep new work to that split: `--primary` for actions, navigation, and links; `--evidence-teal` only for verified evidence and confirmed outcomes.

**Key Characteristics:**

- Evidence-first hierarchy with explicit provenance, freshness, visibility, confidence, and verification.
- Calm bordered surfaces with restrained elevation and strong typographic hierarchy.
- Institutional Indigo for interaction; Evidence Teal for verified truth.
- Plain-language summaries beside structured technical evidence.
- Consistent authority and meaning across light/dark themes and Arabic RTL/English LTR.
- AI that advises with evidence and uncertainty while humans retain consequential decisions.

## Colors

The palette separates interaction from truth: Indigo tells users what they can do, while Teal tells them what has been credibly confirmed.

### Primary

- **Institutional Indigo** (`institutional-indigo`, `institutional-indigo-dark`): primary actions, active navigation, links, and visible focus indicators. It represents agency and movement through the product, never verification.

### Secondary

- **Evidence Teal** (`evidence-teal`, `evidence-teal-dark`): verified evidence, accepted contributions, and confirmed progress. It must not become a generic call-to-action color.

### Tertiary

- **Review Amber** (`review-amber`, `review-amber-dark`): waiting, review attention, and recoverable warnings that require awareness or action.
- **Advisory Violet** (`advisory-violet`, `advisory-violet-dark`): AI-assisted analysis only. It always appears with advisory language, evidence, confidence, uncertainty, and a human path forward.
- **Danger Red** (`danger-red`, `danger-red-dark`): destructive actions, serious errors, security failures, and revoked access. A neutral outcome such as “not selected” is not danger.

### Neutral

- **Registry Ink** (`registry-ink`, `dark-ink`): primary text and high-authority labels.
- **Evidence Slate** (`evidence-slate`, `dark-slate`): secondary explanation, metadata, timestamps, and supporting context.
- **Registry Paper** (`registry-paper`, `dark-canvas`): the page canvas.
- **Surface Fog** (`surface-fog`, `dark-card`): quiet grouped regions and secondary surfaces.
- **Hairline Rule** (`hairline-rule`, `dark-rule`): boundaries, dividers, input outlines, and evidence-row structure.

### Named Rules

**The Action/Truth Split.** Institutional Indigo is interaction; Evidence Teal is verified truth. Never exchange their roles for visual variety.

**The Status Is a Sentence Rule.** Every state includes explicit text and, where useful, an icon. Color is never the only carrier of meaning.

**The Theme Parity Rule.** Light and dark palettes may use different values, but contrast, hierarchy, semantic authority, and state meaning remain equivalent.

## Typography

**Display Font:** IBM Plex Sans Arabic (with `sans-serif` fallback)  
**Body Font:** IBM Plex Sans Arabic (with `sans-serif` fallback)  
**Label/Mono Font:** Geist Mono (with `monospace` fallback)  
**Wordmark Font:** Geist, reserved for the Share-k wordmark

**Character:** IBM Plex Sans Arabic makes Arabic and English feel like one product: direct, readable, and technically literate without becoming clinical. Geist Mono isolates evidence artifacts and machine-shaped identifiers without turning the interface into a terminal.

### Hierarchy

- **Display** (700, `display`, 1.25): rare page-level or brand moments; never routine card headings.
- **Headline** (700, `headline`, 1.35): page titles and decisive workflow moments.
- **Title** (700, `title`, 1.45): section and evidence-group titles.
- **Body** (400, `body`, 1.5): explanations, project summaries, instructions, and narrative contribution context. Keep long reading lines near 65–75 characters.
- **Label** (500, `label`, 0.65px tracking): concise field labels, metadata categories, and compact workflow controls.
- **Technical** (500, `technical`, 0.65px tracking): repository names, GitHub usernames, Pull Request references, commit hashes, paths, evidence identifiers, and compact numeric data.

### Named Rules

**The Technical Isolation Rule.** Technical tokens use Geist Mono and remain LTR inside Arabic layouts using semantic bidirectional isolation such as `<bdi>` or an explicitly isolated `dir="ltr"` container.

**The Mono Ration Rule.** Monospace supports technical evidence; it never becomes the default interface voice or cyberpunk decoration.

## Elevation

Share-k is flat by default. One-pixel rules, surface contrast, spacing, and typography establish structure; shadows communicate temporary lift rather than routine importance. Existing legacy cards use a soft ambient shadow, but new registry layouts should use flat bordered containers unless the surface floats above the document flow.

### Shadow Vocabulary

- **Legacy card light** (`0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)`): compatibility for existing cards while they are migrated; do not introduce it into new dense evidence layouts.
- **Legacy card dark** (`0 8px 16px rgba(0,0,0,0.37)`): compatibility for existing dark cards; test carefully because it is visually heavier than the target system.
- **Primary action tint** (`0 4px 6px -4px rgba(46,49,146,0.35)`): optional restrained separation for a primary action, never a glowing aura.
- **Overlay lift** (`0 12px 32px rgba(14,21,19,0.16)`): menus, popovers, dialogs, and other surfaces that must visibly sit above the registry plane.

### Named Rules

**The Flat-by-Default Rule.** A surface at rest is defined by a hairline border and spacing. Shadows are reserved for actual spatial elevation.

**The No Glow Rule.** A shadow may clarify depth; it must never read as an AI glow, neon effect, or decorative aura.

## Components

Components feel structured and evidence-led, with enough breathing room and plain-language context to stay humane.

### Buttons

- **Shape:** gently squared input radius (`input-light`; current dark token is `input-dark`) with a 44px system target and no control below the WCAG 2.2 minimum of 24×24 CSS pixels.
- **Primary:** Institutional Indigo with `on-indigo` text. Use for one clear next action per region.
- **Evidence:** Evidence Teal may confirm a verified or accepted state, but it is not a routine action button.
- **Danger:** Danger Red is reserved for destructive or security-significant actions and must name the consequence.
- **Outline / Ghost:** neutral surfaces and text for secondary or low-emphasis actions; they retain a visible boundary or hover surface without competing with the primary action.
- **Hover / Focus:** color transitions remain restrained. Focus uses a clearly visible, unobscured Indigo indicator with at least 3:1 contrast and sufficient offset from the control boundary.

### Chips

- **Style:** compact pills for workflow state, evidence qualities, technologies, and filters. Chips are labels or controls—not decorative badges.
- **State:** every status chip contains text and, where useful, an icon. Verification chips use Evidence Teal; review attention uses Amber; AI analysis uses Advisory Violet; neutral outcomes use Slate.
- **Interaction:** selectable chips expose pressed or selected state programmatically and target 44×44 where practical.

### Cards / Containers

- **Corner Style:** current light card radius is `card-light`; current dark card radius is `card-dark`. Preserve equivalent hierarchy between themes even where the values differ.
- **Background:** Registry Paper or Surface Fog with a Hairline Rule boundary.
- **Shadow Strategy:** flat at rest; use Overlay Lift only when the surface truly floats.
- **Internal Padding:** use the regular-to-large rhythm; evidence rows may be denser, but narrative summaries and decision areas need visible breathing room.
- **Content:** lead with contribution, people, status, next action, and evidence. Do not turn every record into an isolated dashboard card.

### Inputs / Fields

- **Style:** persistent label, Hairline Rule border, Registry Paper background, input radius, and a 50px default height.
- **Focus:** an Indigo focus indicator plus visible border change; never rely on a subtle color shift alone.
- **Error / Disabled:** errors state the problem and correction. Disabled controls explain why when the reason is not obvious. Preserve entered data after validation failures.
- **Uploads:** support keyboard selection, format guidance, progress, error recovery, and an alternative to drag-and-drop.

### Navigation

- **Desktop:** a bordered sidebar with grouped destinations, concise labels, and one unmistakable Indigo active state. Secondary navigation stays visually quieter.
- **Mobile:** a bottom navigation bar presents no more than five primary destinations with readable labels and a 44px-or-larger target.
- **State:** active destinations use `aria-current="page"`; badges communicate counts with accessible names and never exist only as colored dots.
- **Shell:** every authenticated workspace provides a skip link and one consistent main-content landmark.

### Evidence Record

An evidence record is Share-k’s signature pattern. It pairs a plain-language summary with contributor context, source, freshness, visibility, verification state, uncertainty, review outcome, and the next available action. Technical identifiers remain LTR and monospaced. Completed records may use a concise casebook narrative, but every important sentence remains traceable to evidence.

### AI Advisory Panel

An AI panel leads with advisory language, then explains the recommendation, supporting and missing evidence, confidence, uncertainty, and who makes the final decision. It always offers the appropriate human review, correction, or dispute path. It never presents a magical score or robot persona.

## Do's and Don'ts

### Do:

- **Do** make the contribution, people, status, evidence, and next action the primary hierarchy.
- **Do** use Institutional Indigo for primary actions, active navigation, links, and focus; use Evidence Teal only for verified evidence and confirmed outcomes.
- **Do** show provenance, freshness, visibility, verification, confidence, and uncertainty with explicit text.
- **Do** combine every meaningful status color with text and, where useful, an icon.
- **Do** pair structured evidence with plain-language summaries and contributor context so the registry remains human.
- **Do** keep AI advisory: explain supporting evidence and uncertainty and provide human review, correction, or dispute paths.
- **Do** preserve functional and content parity across light/dark themes and Arabic RTL/English LTR layouts.
- **Do** isolate usernames, repositories, URLs, code, commit hashes, and paths as LTR technical content within Arabic pages.
- **Do** meet WCAG 2.2 AA, provide visible keyboard focus, support 200% zoom and reflow, honor reduced motion, and prefer 44×44 interactive targets.
- **Do** provide keyboard and button or menu alternatives for dragging, file upload, Kanban movement, and reorder actions.
- **Do** use clear confirmation or undo for destructive actions and state their consequences before commitment.
- **Do** write rejection and waiting states as informative next steps, not dead ends.

### Don't:

- **Don't** use generic AI or SaaS styling: excessive gradient blobs, glowing AI orbs, floating bento cards, vague “AI magic” visuals, or decoration that substitutes for product evidence are prohibited.
- **Don't** make Share-k look like a conventional job or freelance marketplace: no salary-first cards, bidding language, applicant funnels, or “hire top talent” messaging.
- **Don't** become a GitHub clone: repository context supports evidence, but file explorers, commit graphs, and Pull Request interfaces must not dominate.
- **Don't** add social-network engagement gimmicks: no follower counts, likes, streaks, infinite feeds, popularity contests, activity bait, or meaningless achievement badges.
- **Don't** use terminal-heavy or cyberpunk aesthetics: no neon-on-black interfaces, hacker imagery, Matrix grids, excessive monospace typography, or command-line decoration.
- **Don't** present AI as unquestionable authority: no magical scores, robot personas, or definitive qualification claims without evidence, confidence, uncertainty, advisory language, and a human path.
- **Don't** use unverified portfolio or certificate-platform styling: no decorative skill bars, trophy walls, unsupported badges, or self-declared expertise presented as verified.
- **Don't** become Jira, Trello, or Slack: tasks, discussion, and chat support a contribution rather than turning Share-k into a general project-management or communication suite.
- **Don't** create recruitment-style competition: no leaderboards, global rankings, “top 1% developer” labels, or candidate-versus-candidate framing.
- **Don't** overload dashboards with KPIs, charts, cards, and scores; keep the required work, people, status, next action, and supporting evidence primary.
- **Don't** use Evidence Teal for generic progress or routine calls to action. Unverified activity is not verified evidence.
- **Don't** use Danger Red for a neutral outcome such as “not selected”; reserve it for destructive actions, serious failures, and revoked access.
- **Don't** make color, tooltips, dragging, hover, or motion the only way to receive information or complete an action.
