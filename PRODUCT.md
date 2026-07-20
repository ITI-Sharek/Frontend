# Product

## Register

product

## Platform

web

## Users

Share-k primarily serves contributors: developers who want to discover suitable open-source opportunities, complete meaningful work, and build professional records grounded in credible evidence rather than self-declaration. They may be students, junior developers, career switchers, experienced developers new to open source, or contributors expanding into a new technical area.

Project owners are the secondary audience. They need reliable contributors for specific project work, with less screening effort and uncertainty while retaining the final selection and review decisions.

Administrators are an internal operational audience. They review skill verification, moderation, and dispute cases and need transparent evidence, efficient workflows, and complete audit trails.

## Product Purpose

Share-k turns real GitHub activity and completed open-source work into human-reviewed, evidence-backed skills, then uses that record to match contributors with suitable project tasks.

Product success means:

- Contributors discover suitable opportunities, complete meaningful open-source work, and build credible, evidence-backed professional records.
- Project owners find reliable contributors with less screening effort and uncertainty while retaining the final selection decision.
- Contributors and owners collaborate clearly from application through task completion, review, and evidence creation.
- Administrators resolve verification, moderation, and dispute cases fairly and efficiently through transparent workflows and complete audit trails.
- Users understand what influenced every important AI-assisted recommendation, can inspect the supporting evidence and uncertainty, and always know the available next action.
- Evidence visibility and privacy remain understandable and predictable, with private source information never exposed through public claims.

AI remains advisory rather than acting as the final authority. Product success is measured by completed and credibly recorded contributions—not applications, clicks, messages, or engagement alone.

## Positioning

Share-k is trusted growth infrastructure for open-source contributors—not a job board—because capability is evidenced, AI-assisted, and human-reviewed.

## Brand Personality

Share-k is trustworthy, precise, and encouraging. Its voice is direct, technically literate, calm, and transparent. It respects the user's judgment, explains system behavior without hype, and treats uncertainty or rejection as information that helps the user take a productive next step.

The intended product feel combines GitHub's technical density, repository and Pull Request familiarity, and evidence-first activity with Upwork's opportunity discovery, professional profiles, reputation, and application workflow clarity. Share-k adopts those strengths without inheriting GitHub's code-hosting interface or Upwork's marketplace and competition framing.

## Anti-references

Share-k must explicitly avoid:

- **Generic AI or SaaS styling:** no excessive gradient blobs, glowing AI orbs, floating bento cards, vague “AI magic” visuals, or decoration that substitutes for product evidence.
- **Conventional job or freelance marketplace framing:** projects are collaboration spaces, not vacancies. Avoid salary-first cards, bidding language, applicant funnels, and “hire top talent” messaging.
- **A GitHub clone:** repository context supports collaboration and evidence, but file explorers, commit graphs, and Pull Request interfaces must not dominate Share-k.
- **Social-network engagement gimmicks:** no follower counts, likes, streaks, infinite feeds, popularity contests, activity bait, or meaningless achievement badges.
- **Terminal-heavy or cyberpunk aesthetics:** no neon-on-black interfaces, hacker imagery, Matrix grids, excessive monospace typography, or command-line decoration. Monospace is reserved for commits and technical evidence.
- **AI presented as unquestionable authority:** no magical scores, robot personas, or definitive qualification claims without evidence, confidence, uncertainty, advisory language, and a human review or dispute path.
- **Unverified portfolio or certificate-platform styling:** no decorative skill bars, trophy walls, unsupported badges, or self-declared expertise presented as verified. Evidence, completed work, review outcomes, and verification status lead the hierarchy.
- **Becoming Jira, Trello, or Slack:** tasks, discussion, and chat support a contribution; they do not turn Share-k into a general project-management or workplace-communication suite.
- **Recruitment-style competition:** no leaderboards, global rankings, “top 1% developer” labels, or candidate-versus-candidate framing. Show suitability for a particular task and credible history instead.
- **Dashboard overload:** do not fill every screen with KPIs, charts, cards, and scores. Keep the project, required work, people, status, next action, and supporting evidence primary.

## Design Principles

1. **Evidence before claims.** Every important capability, recommendation, and status should reveal its source, freshness, visibility, and verification state. Private source information must never leak through public claims.
2. **Humans retain consequential decisions.** AI assists with analysis, matching, and prioritization; contributors, owners, and administrators make the final decisions and can inspect, challenge, or correct the system's reasoning.
3. **The contribution is the unit of progress.** Design for suitable discovery, clear collaboration, completed work, review, and durable evidence. Do not optimize for applications, clicks, messages, or engagement volume.
4. **Status, uncertainty, and next actions stay visible.** Waiting, rejection, review, and AI-assisted outcomes must state what happened, what influenced it, who acts next, and which recovery or escalation paths remain available.
5. **Collaboration without competition.** Help people judge fit for a specific contribution without popularity mechanics, global rankings, marketplace pressure, or unsupported prestige signals.

Contributor product policy:

- AI-assisted fit is advisory. It communicates strong, partial, limited, unknown, or unavailable fit with supporting and missing evidence, confidence, and uncertainty. It never prevents an application solely because of an AI conclusion; the project owner retains the final selection decision.
- Contributor applications have no legacy daily-attempt, reset-timing, plan-limit, or Gold-tier restriction unless a future approved and implemented contract explicitly introduces one.
- GitHub OAuth establishes linked-account identity only. Read-only repository evidence requires a separate GitHub App installation and explicit repository selection, with understandable consent, visibility, synchronization, and revocation.
- Contribution evidence is source-agnostic and may include repository evidence, owner attestation, attachments, descriptions, screenshots, demo links, and repository-free work where supported by approved contracts.
- Contributor access is contextual: applicants receive their own application and permitted project information; private collaboration begins after owner acceptance; terminal states revoke capabilities where required. Admin remains the only account-level privilege.
- AI explanations and public claims may use only evidence visible to their audience. Private repository details, filenames, excerpts, and source metadata never leak through public summaries or narratives.

## Accessibility & Inclusion

Share-k conforms to WCAG 2.2 Level AA. All supported core journeys must be operable with keyboard-only input and usable with the documented assistive-technology and browser matrix, verified through automated checks and manual accessibility testing in both Arabic and English.

Platform-wide requirements:

- Test with a documented matrix that includes NVDA with Firefox and Chrome, and VoiceOver with Safari.
- Maintain functional and content parity between Arabic RTL and English LTR.
- Never communicate meaning through color alone; combine color with text, icons, patterns, or shapes.
- Respect `prefers-reduced-motion` and remove non-essential animation without removing information.
- Maintain contrast of at least 4.5:1 for normal text, 3:1 for large text, and 3:1 for controls, boundaries, meaningful icons, and focus indicators.
- Support text zoom to 200% and responsive reflow without losing content or functionality.
- Provide visible, unobscured keyboard focus with a logical focus order and skip links for repeated navigation.
- Use semantic HTML with correctly ordered headings, landmarks, persistent labels, accessible names, roles, states, instructions, and validation.
- Ensure interactive targets meet the WCAG 2.2 minimum of 24×24 CSS pixels and prefer 44×44 as the Share-k design-system target.
- Never make dragging the only way to complete an action. Kanban and reorder interactions require keyboard-operable buttons, menus, or status-selection alternatives.
- Preserve entered form data after validation errors wherever possible and provide specific error messages with correction guidance.
- Support password managers, copy and paste, and standard autofill. Authentication must not require memory or cognitive puzzles.
- Announce loading states, AI results, submission outcomes, chat messages, and workflow status changes programmatically without flooding assistive technology.
- Modals, menus, dropdowns, and dialogs must manage focus correctly and never create keyboard traps.
- Images, charts, evidence visualizations, and meaningful icons require text alternatives or equivalent textual data. Product audio and video require captions or transcripts.
- Warn users before session expiration and allow extension where security permits.

Share-k-specific requirements:

- Keep GitHub usernames, repository names, URLs, code, commit hashes, and file paths LTR inside Arabic pages with correct bidirectional isolation.
- Label confidence, evidence visibility, freshness, verification, and uncertainty explicitly rather than relying on colors, badges, or tooltips.
- Explain AI-assisted recommendations in plain language, identify supporting evidence, communicate uncertainty, and provide human review or dispute paths.
- Let users control automatic screen-reader announcements for real-time chat.
- Provide keyboard and button or menu alternatives for every Kanban drag-and-drop action.
- Use consistent terminology for application, assignment, task, evidence, and review states, and announce state changes.
- Support cognitive accessibility with explained technical abbreviations, sectioned long forms, progress indication, focused dashboards, and concise instructions.
- Explain the consequences of destructive actions such as rejecting applications, deleting projects, disconnecting GitHub, or changing evidence visibility, then provide confirmation or undo where appropriate.
- Make file uploads keyboard-operable and provide supported-format guidance, progress, error recovery, and alternatives to drag and drop.
