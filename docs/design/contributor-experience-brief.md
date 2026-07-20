# Share-k Contributor Experience Design Brief

> Status: APPROVED FOR IMPLEMENTATION
>
> Approved: 2026-07-20
>
> Scope: design and information architecture only; no implementation was started by this shape pass.

## Authority and decision boundary

This brief captures the user-approved contributor experience direction. The implemented system, current typed contracts, and approved backend capabilities remain the implementation source of truth. Before building a proposed route or workflow, map it to the existing router, API surface, authorization rules, and DTOs.

Older local documents still describe AI as an application gate, daily application attempts, subscription-tier restrictions, Gold guidance, and broad GitHub OAuth repository access. Those concepts are superseded for this contributor brief and must not be copied into implementation. Where a higher-ranked governance record or current backend contract conflicts with this brief, record and resolve the conflict explicitly before changing product behavior.

Any further workflow or behavioral idea must be labeled **Optional enhancement**, with its rationale, dependency, tradeoff, and effect on current contracts. It must not be silently merged into the approved experience.

## 1. Feature Summary

Redesign the complete contributor journey:

**Onboard → discover suitable work → understand fit and requirements → apply → receive an owner decision → collaborate and complete work → submit evidence → receive review → build a credible contribution record.**

The experience serves contributors who may be exploring confidently or feeling uncertain about suitability. Every page must make the current state, relevant evidence, next actor, available action, and access boundary clear.

Profile growth and reputation are outcomes of completed, reviewed work—not engagement destinations.

## 2. Primary User Action

Help a contributor confidently choose and complete the next suitable contribution.

AI-assisted fit assessment supports this decision by explaining:

- Strong, partial, limited, unknown, or unavailable fit.
- Supporting and missing evidence.
- Confidence and uncertainty.
- Which requirements still need human judgment.

AI does not make the final selection decision and must not prevent an application solely because of its conclusion. The project owner retains the final contributor-selection decision.

Applications may be unavailable only because of a real, contract-supported product rule, such as a closed task, duplicate application, missing permission, terminal workflow state, or another explicit backend constraint. The UI must name the actual rule rather than attributing the block to AI.

## 3. Design Direction

- **Color strategy:** Restrained.
- **Creative north star:** The Human Contribution Registry.
- **Theme:** Light-first with equivalent dark-mode authority and meaning.
- **Scene:** A contributor works on a laptop in an ordinary daylight or evening workspace, focused but sometimes uncertain, needing evidence and a clear next action rather than stimulation.
- **References:** GitHub's technical familiarity and Upwork's workflow clarity, without inheriting either product's dominant model.
- **Visual character:** Registry structure, Casebook narratives for completed contributions, and Workshop warmth in language and contributor context.

Institutional Indigo represents action, navigation, links, and focus. Evidence Teal represents reviewed or otherwise confirmed evidence and outcomes. Status always includes text and, where useful, an icon; color never carries meaning alone.

The direction is already fixed by `DESIGN.md`, so separate visual-direction probes are not required.

## 4. Scope

- **Fidelity:** Production-ready.
- **Breadth:** Complete contributor surface.
- **Interactivity:** Shipped-quality responsive React behavior.
- **Languages:** Functional and content parity in Arabic RTL and English LTR.
- **Themes:** Light and dark with equivalent hierarchy, contrast, and semantics.
- **Accessibility:** WCAG 2.2 AA and the documented assistive-technology/browser matrix.
- **Time intent:** Implement in coherent phases and bring every completed phase to its acceptance standard.

Accessibility, responsive behavior, keyboard operation, focus management, bidirectional behavior, reduced motion, and theme parity are acceptance requirements in every phase. A final cross-product audit verifies consistency; it does not postpone accessibility or responsiveness.

### Proposed implementation sequence

1. Shared contributor information architecture, authorization-aware shell behavior, and reusable workflow/evidence components.
2. Onboarding and the action-first dashboard.
3. Project and task discovery, details, fit explanation, and application submission.
4. Owner-decision status, accepted collaboration, completion, and evidence submission.
5. Skills, evidence sources, contribution records, reputation, and the public profile.
6. Notifications and settings, followed by cross-product accessibility, responsive, privacy, and consistency audits.

Each phase includes its own accessibility, responsive, RTL/LTR, loading, error, and authorization acceptance criteria.

## 5. Information Architecture and Layout Strategy

### Proposed workspace map

The intended desktop contributor map is:

1. Dashboard
2. Explore projects
3. Tasks
4. My applications — proposed
5. My skills and evidence — proposed
6. Settings

Notifications remain available from the top bar. The contributor's public profile remains available from the account menu. Mobile uses Dashboard, Explore, Tasks, Applications, and Profile/account access.

`/applications`, `/applications/$applicationId`, and `/skills` are approved as proposed information architecture, not as assertions that their backend workflows already exist. Before implementation:

- Map each route to TanStack Router ownership and the shared contributor guard.
- Identify existing DTOs and API endpoints that can support it.
- Separate present capabilities from proposed future behavior.
- Label unsupported behavior as an optional enhancement instead of mocking it as if it were live.

The existing `/github/repositories` surface must not be removed, renamed, or folded into another route until linked-account identity, GitHub App installations, selected-repository authorization, evidence browsing, and current backend endpoints are mapped.

### Page hierarchy

- **Onboarding:** one focused step at a time; the stepper replaces workspace navigation while preserving safe exits.
- **Dashboard:** actions needing attention → suitable next work → progress earned through completed contributions.
- **Explore:** search and filters → comparable project records → explained personal fit.
- **Project:** project health and public context → open work → task-level requirements.
- **Task:** requirements → fit assessment and evidence → project constraints → apply.
- **Application:** owner-decision state → current access and next action → supporting fit explanation and correspondence.
- **Accepted collaboration:** contribution context → permitted private workspace → work state → evidence submission.
- **Skills and evidence:** review state → evidence sources and authorization → findings → correction, dispute, or improvement path where supported.
- **Profile:** identity → reviewed capability → completed-contribution narratives → reviews and reputation.
- **Settings:** account, language, linked identity, evidence authorization, privacy, and source management.

Structured rows and sections replace unnecessary card grids. Cards remain appropriate for discrete tasks, temporary summaries, and mobile recomposition, but nested cards are prohibited.

## 6. Authorization and Privacy Model

### Contextual access

Contributor access depends on relationship to the project and current workflow state:

- An applicant can access their own application plus permitted public or applicant-visible project information.
- Applying does not grant access to private project workspaces, internal discussion, private files, or accepted-contributor collaboration tools.
- Private collaboration access begins only after owner acceptance and only for the accepted project/task context.
- Terminal states revoke capabilities where the current contract requires revocation.
- Admin is the only account-level privilege; contributor capabilities are contextual, not elevated account roles.

Frontend route guards improve navigation and disclosure behavior but never replace backend authorization. Each query, mutation, link, and realtime event must respect the same relationship boundary.

### GitHub identity versus evidence authorization

The product must represent two separate concepts:

1. **GitHub OAuth linked identity:** establishes the GitHub account associated with the Share-k user. It does not imply permission to inspect every repository.
2. **GitHub App evidence authorization:** grants read-only access to repositories explicitly selected through the installation and selection flow.

The interface must show:

- Which GitHub identity is linked.
- Which GitHub App installation or organization supplies access.
- Which repositories are selected.
- Whether each source is public or private.
- What Share-k may read from the source.
- Whether evidence may inform private analysis, public claims, or both.
- Last successful synchronization and any source failure.
- How to change selection, revoke access, or disconnect identity.
- The consequence of revocation for existing private analysis and public claims.

Identity disconnection and repository-access revocation are separate actions with separate consequences.

### Audience-safe evidence and AI explanations

Every evidence-backed statement is filtered for the current audience before it reaches UI copy or AI context.

- Public profiles and contribution narratives expose only public claims and evidence summaries authorized for public visibility.
- Private repository names, filenames, paths, excerpts, commit details, screenshots, source metadata, and inferred private facts must not leak through a public skill claim or AI summary.
- Applicant-visible, accepted-collaborator, owner, reviewer, and public audiences may receive different summaries of the same underlying record.
- A redacted explanation must remain honest: state that supporting private evidence exists without revealing it, or mark detail as unavailable to that audience.
- Revoked or newly private evidence must be re-evaluated before it continues supporting a public claim.

## 7. Evidence Model

The contribution record is source-agnostic. GitHub repositories are one evidence source, not the evidence journey itself.

Supported evidence presentations may include, when allowed by current contracts:

- Repository or Pull Request references.
- Owner-attested work and review outcomes.
- File attachments.
- Contributor descriptions or completion notes.
- Screenshots.
- Demo or deployment links.
- Repository-free work products.
- Other reviewed evidence types exposed by the backend.

Every evidence item or summary distinguishes:

- **Source:** where the material came from.
- **Verification method:** automated analysis, owner attestation, admin review, linked source, or another contract-supported method.
- **Visibility:** public, relationship-limited, reviewer-only, or private.
- **Freshness:** captured, synchronized, submitted, or reviewed date when reliable.
- **Review state:** pending, confirmed, adjusted, disputed, rejected, revoked, or another supported state.
- **Confidence and uncertainty:** expressed in text, not as an unexplained score.

Evidence upload and submission must support keyboard selection, supported-format guidance, progress, cancellation where feasible, error recovery, and alternatives to drag-and-drop. User-authored descriptions and attachments are not presented as independently verified until an approved verification method says so.

## 8. Key States

### Onboarding and evidence authorization

- GitHub identity unlinked, linking, linked, failed, or disconnected.
- GitHub App not installed, installed, selection required, repositories selected, selection changed, access revoked, or synchronization failed.
- No repository evidence selected.
- Non-GitHub evidence available or unavailable.
- Analysis queued, progressing, delayed, failed, completed, or lacking sufficient evidence.
- Findings pending review, partially confirmed, confirmed, adjusted, rejected, revoked, or disputed.
- Leave-and-notify behavior without lost progress.

No review estimate is displayed unless a reliable backend value or approved service expectation is available. Otherwise show the state, next actor, and available action only.

### Dashboard

- Onboarding incomplete.
- No reviewed contribution record yet.
- Active with no urgent action.
- Owner decision received.
- Accepted contribution awaiting contributor action.
- Revision or additional evidence requested.
- Isolated panel failure with localized retry.
- Fit or recommendation service unavailable without blocking the rest of the workspace.

### Discovery and task details

- Loading skeletons with usable surrounding controls.
- Results, filtered results, and semantic-search results.
- Empty inventory versus filters producing no matches.
- Project archived or without open work.
- Task closed, assigned, completed, cancelled, or otherwise unable to accept an application.
- Fit strong, partial, limited, unknown, or unavailable.
- Supporting evidence present, missing, stale, private, or unavailable to the current audience.
- Stale repository/project activity clearly disclosed.

Lists support zero results, ordinary collections, and large histories through pagination or explicit loading—not infinite feeds.

### Application and owner decision

- Composing, submitting, submitted, or submission failed with entered data preserved.
- Duplicate application.
- Missing permission or contract-supported application restriction.
- AI-assisted fit assessment loading, available, or unavailable.
- Strong, partial, limited, unknown, or unavailable fit with explanation.
- Awaiting owner decision.
- Accepted, not selected, withdrawn, expired, task closed, or another current terminal state.
- Owner requests clarification where supported.

AI fit never becomes the reason the application is prevented from reaching the owner. “Not selected” is a neutral owner/workflow outcome and does not use Danger Red.

### Accepted collaboration and completion

- Accepted and private workspace access granted.
- Work not started, in progress, ready for evidence, evidence submitted, review requested, revision requested, resubmitted, confirmed, rejected, cancelled, or access revoked where supported.
- Discussion or private workspace unavailable to applicants and terminal relationships.
- Evidence partially uploaded, failed, removed, or awaiting review.
- Owner review available without invented timing.

### Skills, contribution records, and profile

- No reviewed skills or records yet.
- Evidence from one or multiple source types.
- Review pending, confirmed, adjusted, rejected, disputed, revoked, or mixed.
- Evidence public, relationship-limited, reviewer-only, or private.
- Source fresh, stale, unreachable, disconnected, or revoked.
- Sparse public profile versus mature history with many completed contributions.
- Own view versus public or relationship-specific view.
- Loading, not found, forbidden, and recoverable failure.

### Notifications and settings

- Empty, unread, all read, realtime update, reconnecting, or unavailable.
- Save idle, saving, saved, validation error, or server error.
- Session-expiration warning with extension where security permits.
- Identity disconnection, repository-selection change, evidence-visibility change, and access revocation with explicit consequence confirmation.

## 9. Interaction Model

- Search, filters, and sorting persist in URL parameters and survive navigation.
- Desktop filters remain visible; mobile filters use a focus-managed sheet or dialog.
- Fit summaries expand to show supporting evidence, missing evidence, confidence, uncertainty, and audience-limited details.
- Applying uses a focused transactional surface that preserves entered data, returns focus correctly, and does not imply that AI decides whether the owner can review it.
- Application detail shows submission, owner decision, collaboration, evidence, and review as a clear sequence without claiming timing the backend cannot support.
- Private collaboration links appear only after accepted-context authorization is confirmed.
- Evidence-source selection and visibility changes show scope and consequences before confirmation.
- Status changes and realtime messages are announced programmatically without flooding screen-reader users.
- Technical identifiers use correct bidirectional isolation.
- Motion is restrained state feedback, generally 150–250ms, with reduced-motion equivalents.
- Destructive or access-revoking actions explain consequences and provide confirmation or undo where supported.
- Keyboard alternatives exist for every nonstandard interaction.
- Loading failures remain local where possible; one failed panel must not blank the page.

## 10. Content Requirements

Every contributor-facing AI assessment or workflow decision answers:

- What is the current state?
- What supporting and missing evidence informed the assessment?
- How confident or uncertain is it?
- Who makes or made the consequential decision?
- What can the contributor do now?
- Which details are hidden because of privacy or audience permissions?

Required content patterns include:

- Fit bands and plain-language reasoning instead of unexplained percentages or gate verdicts.
- Requirement-by-requirement comparison with supporting and missing evidence.
- Evidence source, verification method, visibility, freshness, review state, confidence, and uncertainty.
- Clear distinction between linked GitHub identity and selected-repository authorization.
- Contributor-centered completed-work narratives grounded in reviewed facts.
- Neutral, respectful owner-decision outcomes with productive next actions.
- Specific validation and upload correction guidance.
- Consistent Arabic and English workflow terminology.
- Persistent form labels and instructions rather than placeholder-only guidance.

Expected timing appears only when supplied by a reliable backend value or approved service expectation. The default waiting-state copy names the current state, next actor, and available action without estimating duration.

Real content assets include the Share-k identity, contributor avatars, GitHub-linked identity, explicitly authorized repository evidence, other submitted evidence, project and task data, and Lucide icons. Decorative generated imagery is unnecessary.

## 11. Acceptance Requirements Across Every Phase

Each implemented phase must demonstrate:

- WCAG 2.2 AA contrast, semantics, names, roles, states, and validation.
- Complete keyboard operation with visible, unobscured focus.
- Responsive reflow and text zoom to 200% without loss of content or function.
- Arabic RTL and English LTR functional and content parity.
- Bidirectional isolation for technical identifiers.
- Reduced-motion behavior that preserves information.
- Screen-reader announcements for relevant loading, submission, AI, upload, message, and workflow changes.
- Relationship-aware authorization in navigation, data fetching, actions, and realtime events.
- Audience-safe evidence serialization and display.
- Loading, empty, stale, partial, error, offline/reconnect, and terminal states appropriate to the phase.
- At least the WCAG 2.2 minimum target size, with 44×44 CSS pixels as the system target.

The final phase adds a cross-product manual and automated audit in both languages and themes; it is not the first accessibility or responsive pass.

## 12. Implementation References

Implementation should load:

- `DESIGN.md` and `PRODUCT.md` as the visual and strategic context.
- `reference/layout.md` for hierarchy and responsive recomposition.
- `reference/interaction-design.md` for forms, filters, evidence authorization, and focus behavior.
- `reference/adapt.md` for desktop/mobile and RTL/LTR structural parity.
- `reference/harden.md` for loading, empty, stale, permission, privacy, and terminal states.
- `reference/clarify.md` for fit explanations, owner decisions, privacy, and workflow copy.
- `reference/typeset.md` for dense evidence, technical identifiers, and readable contribution narratives.

Before implementation begins, reconcile the brief against current route contracts, task/application DTOs, GitHub identity endpoints, GitHub App installation and repository-selection capabilities, evidence DTOs, authorization policies, and public/private serializers.

## 13. Open Contract Conflicts

The shape direction is approved, but implementation must not silently resolve these repository conflicts:

- Current task types and UI still model `eligible`, `ineligible`, and AI-blocked outcomes.
- Current task and shell data still model daily application attempts and plan labels.
- Existing GitHub repository specifications treat OAuth scope as repository visibility authorization.
- Older wireframes and governance entries still reference Gold-tier guidance and application limits.
- Current evidence contracts are primarily repository-oriented and do not yet expose every approved non-GitHub evidence form.
- Proposed applications and skills routes do not yet have complete route/API implementations.
- Contextual accepted-contributor workspace permissions require mapping to current backend authorization.

These are pre-implementation reconciliation items, not permission to invent replacements in the frontend.

## Optional enhancements

No optional workflow or behavioral enhancement is approved by this brief. New recommendations must be documented separately with rationale, dependencies, tradeoffs, privacy implications, and contract impact before they enter implementation scope.
