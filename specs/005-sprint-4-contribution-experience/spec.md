# Sprint 4 Frontend — Contribution Experience

## Problem Statement

The frontend contains polished but mock-driven Project and task experiences
that still describe the superseded AI eligibility gate. Current screens show
application-attempt quotas, “eligible/ineligible/review needed” outcomes, and
automatic validation after submission. Those behaviors contradict the accepted
Sprint 4 contract.

Project owners need working interfaces for Contribution Request creation,
Application review, optional Advisory Fit Assessments, human decisions, and
Contribution Proposals. Contributors need direct submission, transparent
status, attribution, and decision-neutral assessment presentation.

The final stretch experience must support safe Materials and private AI Draft
Suggestions without implying that upload automatically authorizes AI use.

## Solution

Replace the mock Sprint 4 flow with API-backed owner and contributor
experiences using canonical domain language.

Application submission sends the Application directly to the Project owner.
Advisory Fit Assessments are optional owner actions and are presented as
evidence findings, never verdicts or recommendations. Owner Decisions remain
available regardless of assessment state.

Build Contribution Proposal experiences as a separate private workflow.
Implement Materials and AI-assisted drafting only after the complete core
frontend and backend workflow passes its release gate.

## User Stories

1. As a Project owner, I want to see my Projects and their Contribution Requests, so that I can manage collaboration work in context.
2. As a Project owner, I want to create a draft Contribution Request from a published Project, so that unpublished work remains private.
3. As a Project owner, I want to enter a title, description, Required Requirements, and Preferred Requirements, so that contributors understand the work contract.
4. As a Project owner, I want technology tags shown separately from Requirements, so that metadata is not mistaken for acceptance criteria.
5. As a Project owner, I want Applications Close Time and Target Completion Date labeled differently, so that selection and completion expectations are clear.
6. As a Project owner, I want to save, edit, discard, publish, and cancel from explicit states, so that destructive or public actions are deliberate.
7. As a Project owner, I want entitlement and validation errors explained at the action that caused them, so that I can recover without losing draft content.
8. As a contributor, I want to browse only published Contribution Requests still accepting Applications, so that the feed is actionable.
9. As a contributor, I want to filter the feed using supported structured fields, so that I can narrow relevant work.
10. As a contributor, I want to inspect Required and Preferred Requirements, close time, target date, reward, and Project context, so that I can evaluate the request.
11. As a contributor, I want advisory fit hints to remain clearly non-binding, so that they do not imply eligibility or ranking.
12. As a contributor, I want to submit a Contribution Approach and Proposed Delivery Duration, so that the owner understands my plan.
13. As a contributor, I want submission confirmation to say the Application was sent to the owner, so that no AI approval is implied.
14. As a contributor, I want no application-attempt quota or automatic validation screen during submission, so that superseded gating is removed.
15. As a contributor, I want duplicate, closed, cancelled, terminal, and authorization errors presented distinctly, so that I understand why submission failed.
16. As a contributor, I want to view my Application status and withdraw while it remains pending, so that I retain control before an Owner Decision.
17. As a Project owner, I want every pending Application listed immediately, so that no contributor is hidden by assessment status.
18. As a Project owner, I want to inspect the Contribution Approach, duration, profile context, and fixed evidence summary, so that I can make a contextual decision.
19. As a Project owner, I want accept and decline actions available without an assessment, so that AI is optional.
20. As a Project owner, I want confirmation before acceptance, so that the resulting Assignment and sibling `NOT_SELECTED` transitions are deliberate.
21. As a Project owner, I want decline feedback separated from AI findings, so that the Owner Decision remains explicitly human.
22. As a contributor, I want `NOT_SELECTED`, `DECLINED_BY_OWNER`, `EXPIRED`, `WITHDRAWN`, and `REQUEST_CANCELLED` explained distinctly, so that terminal outcomes are not conflated.
23. As a contributor, I want terminal copy to state when an outcome has no profile, eligibility, or reputation effect, so that the product does not stigmatize me.
24. As a contributor, I want to report abusive decision feedback without seeing an appeal promise, so that moderation is available without reopening the workflow.
25. As a Project owner, I want aging indicators and reminders in the decision queue, so that unattended Applications are visible.
26. As a Project owner, I want to request an Advisory Fit Assessment from one pending Application, so that I can ask for evidence analysis intentionally.
27. As a Project owner, I want request-in-progress presentation that does not block decisions, so that I can continue working.
28. As a Project owner, I want each Requirement Finding shown with citations, categorical confidence, uncertainty, and explanation, so that the evidence is inspectable.
29. As a Project owner, I want Required and Preferred findings visually separated, so that Preferred Requirements are not mistaken for Fit Band inputs.
30. As a Project owner, I want `UNKNOWN`, `UNAVAILABLE`, no-assessable-evidence, system-limit, and cancelled states explained neutrally, so that technical limits are not presented as negative fit.
31. As a Project owner, I want no score, probability, ranking, pass/fail badge, or recommendation, so that the interface preserves human judgment.
32. As a contributor, I want to submit a private Contribution Proposal from an active Project, so that I can suggest useful work.
33. As a contributor, I want a pre-submission disclosure that acceptance creates an attributed owner draft and someone else may perform the work, so that expectations are explicit.
34. As a contributor, I want to view immutable Proposal Versions and owner Revision Requests, so that negotiation history is trustworthy.
35. As a contributor, I want to submit a new version rather than letting the owner edit my words, so that authorship remains clear.
36. As a contributor, I want to withdraw before acceptance, so that I can end consideration.
37. As a Project owner, I want to accept, decline with a reason, or request revision, so that I can respond without rewriting contributor content.
38. As a contributor, I want accepted attribution visible on the published Contribution Request, so that my suggestion receives public credit.
39. As a contributor, I want attribution copy to avoid implying Assignment, ownership, or priority, so that other contributors may still apply normally.
40. As a contributor, I want to report suspected misuse from the Proposal history, so that preserved evidence can reach moderation.
41. As a Project owner, I want to upload supported Project or Request Materials, so that collaborators can access relevant context.
42. As a Project owner, I want to choose public, restricted, or Assignment visibility using clear explanations, so that I understand who receives access.
43. As a Project owner, I want quarantine, scan, upload, ready, rejected, deleted, and purge-pending states presented honestly, so that availability is never implied too early.
44. As an authorized collaborator, I want to download only Materials I can access, so that restricted content stays private.
45. As a Project owner, I want upload and AI analysis shown as separate actions, so that storage is not confused with processing consent.
46. As a Project owner with the required entitlement, I want to select exact document versions into an Analysis Set, so that the analysis sources are visible.
47. As a Project owner, I want to start an Analysis Run explicitly, so that no model call occurs merely because a file exists.
48. As a Project owner, I want source filenames and versions shown beside AI Draft Suggestions, so that I can review provenance.
49. As a Project owner, I want to adopt or dismiss each suggestion separately, so that AI cannot mutate or publish automatically.
50. As a Project owner, I want failed analysis to leave existing Project and Request data unchanged, so that retries are safe.

## Implementation Decisions

- Canonical user-facing terminology is Project, Contribution Request,
  Application, Contribution Proposal, Advisory Fit Assessment, Owner Decision,
  Assignment, and Material. Existing route URLs may retain `/tasks` for
  transport compatibility, but visible copy and new frontend types do not call
  Contribution Requests jobs, opportunities, or AI-validated tasks.
- The current mock task service is replaced behind the existing frontend
  service boundary with authenticated API calls and TanStack Query state.
  Components do not call HTTP clients directly.
- Existing task and Project visual foundations are reused where they match the
  accepted experience. Superseded validation-result screens, quota copy,
  automatic validation delays, eligibility verdicts, and admin-review states
  are removed rather than adapted.
- The owner Project workspace gains Contribution Request list, create, edit,
  discard, publish, and cancel experiences. Forms preserve unsaved user input
  after recoverable API errors.
- Requirement editing supports an ordered list of explicit text Requirements
  with Required or Preferred classification. Technology tags are managed in a
  separate control.
- Applications Close Time and optional Target Completion Date use distinct
  labels and validation. Proposed Delivery Duration is collected during
  Application submission.
- The contributor feed and details consume server-authoritative publication and
  close state. The UI does not infer authorization or terminal state from time
  alone.
- Application submission displays a direct-owner confirmation and navigates to
  the contributor's Application status. No automatic assessment request, quota
  decrement, pass state, or failure verdict is displayed.
- Application status presentation covers `PENDING_OWNER_REVIEW`, `ACCEPTED`,
  `DECLINED_BY_OWNER`, `NOT_SELECTED`, `EXPIRED`, `WITHDRAWN`, and
  `REQUEST_CANCELLED` from day one.
- Error presentation is driven by stable backend codes, not message-text
  matching. Closed, duplicate, unauthorized, terminal, and conflict outcomes
  have distinct recovery behavior.
- The owner queue shows every pending Application and remains usable when an
  assessment is absent, queued, limited, failed, or unavailable.
- Accept and decline are explicit owner actions with confirmation. Assessment
  controls and results are visually subordinate to those actions.
- Assessment presentation shows findings per Requirement, evidence citations,
  categorical confidence, uncertainty, and explanation. It never uses
  percentage confidence, scores, ranking, pass/fail language, traffic-light
  eligibility, or model recommendations.
- `UNKNOWN`, `UNAVAILABLE`, `NOT_STARTED_SYSTEM_LIMIT`,
  `NOT_STARTED_NO_ASSESSABLE_EVIDENCE`, and `CANCELLED_NOT_NEEDED` receive
  separate decision-neutral states.
- The first completed-assessment presentation may trigger the backend
  presentation record, but the UI never calls it a read receipt.
- Proposal UI is a separate module and flow from Application UI. A contributor
  cannot accidentally submit one from the other.
- Proposal submission includes a mandatory disclosure that acceptance creates
  an attributed owner-controlled draft, grants no Assignment or selection
  priority, and may result in another contributor performing the work.
- Pending Proposal details are private routes available only to the proposer
  and Project owner. Immutable versions and owner Revision Requests are shown
  as a chronological history.
- Only the contributor can submit a new Proposal Version. The owner can accept,
  decline with a required reason, or request revision.
- Accepted Proposal attribution appears on the resulting published
  Contribution Request as “Suggested by @username” or its approved localized
  equivalent. It is not rendered as ownership or assignment.
- Proposal Misuse Report UI preserves a factual reporting tone and never
  promises an automatic copying, theft, or legal determination.
- Materials are a final stretch module and are not included in the core release
  path until the complete core frontend integration gate passes.
- Material upload surfaces supported formats and server-provided limits.
  Visibility options explain public, Restricted Project, and Assignment access
  in plain language.
- Material state is server-authoritative. Quarantined or unscanned content is
  never rendered as downloadable.
- Upload, access sharing, Analysis Set selection, Analysis Run start, and Draft
  Suggestion adoption are separate user actions.
- The Analysis Set UI identifies exact filenames and Material Versions. It does
  not silently follow later replacements.
- AI Draft Suggestions are private, visibly labeled as generated, linked to
  their source versions, and individually adoptable. No suggestion is selected
  or published automatically.
- Material-analysis entitlement failure uses MVP preview copy and does not
  present a working purchase or checkout action.
- Accessibility covers keyboard operation, focus management for dialogs,
  semantic form errors, status announcements, and non-color-only state
  communication. Existing RTL and responsive design conventions remain.
- API-derived private evidence, assessment details, pending Proposals, and
  restricted Material metadata are never included in public Project or
  Contribution Request views.

## Testing Decisions

- The highest frontend seam is route or feature behavior through the public
  service adapter. Vitest tests render the relevant page or workflow component,
  stub the HTTP adapter, perform user-visible actions where the current test
  environment supports them, and assert observable copy, actions, and states.
- Service contract tests verify request and response mapping against
  version-controlled backend examples. Components are not tested against
  private helper implementation.
- Contribution Request tests cover draft preservation, Required and Preferred
  Requirements, separate dates, publication confirmation, cancellation, feed
  filtering, and closed-state actions.
- Application tests prove immediate owner-review confirmation, no AI or quota
  copy, stable error-code handling, withdrawal, every terminal status, and
  owner decisions without assessments.
- Assessment tests cover pending, complete, unknown, unavailable,
  no-assessable-evidence, system-limit, cancelled, low-confidence, and
  inconclusive findings. They assert the absence of scores, rankings, verdicts,
  recommendations, and decision gating.
- Proposal tests cover disclosure, privacy, immutable versions, revision
  requests, contributor confirmation, withdrawal, required decline reason,
  attribution, discarded resulting drafts, and misuse reporting.
- Material tests cover visibility explanations, quarantine, revoked access,
  version selection, upload without AI activity, explicit run start,
  source-linked suggestions, per-suggestion adoption, entitlement messaging,
  and failure without partial mutation.
- Accessibility tests assert labels, error associations, focus behavior,
  keyboard access, and status text. State meaning cannot depend on color alone.
- Prior art includes the repository's Vitest static-render component tests,
  service mapping tests, route helper tests, TanStack Query service boundaries,
  and existing GitHub App workflow component tests.
- No new browser automation framework is required by this specification. A
  human or deployment-level smoke exercise may supplement, but not replace,
  deterministic repository tests.
- The core frontend release gate covers owner request creation, contributor
  discovery and Application, owner decision with and without assessment, and
  Contribution Proposal acceptance. The Material flow has a separate final
  stretch gate.

## Out of Scope

- AI eligibility results, automatic validation progress, Application
  pass/fail, ranking, contributor-attempt quotas, or admin eligibility queues.
- Rebuilding the existing design system or changing the approved Registry
  visual direction.
- Chat, direct messaging, negotiation threads, kanban, discussions, or a
  general project management workspace.
- Multiple assignees for one Contribution Request.
- Proposal ownership adjudication, plagiarism comparison, or legal claims.
- Payment checkout or billing-provider UI. Material analysis uses seeded,
  demo, or admin-assigned entitlement during the MVP.
- OCR, image analysis, scanned-PDF analysis, audio, video, executable, archive,
  or macro-enabled content.
- Public document search, Material-powered matching, model training, or use of
  Materials as Advisory Fit evidence.
- Shipping partial Material or embedding UI when the complete stretch slice is
  unavailable.

## Further Notes

- The backend HTTP contract is the integration seam for this specification.
  The frontend must not invent business state that the backend does not return.
- Current mock screens are useful visual prior art but are not authoritative
  behavior. Accepted domain docs and the backend contract supersede their
  eligibility-gate copy.
- Frontend implementation must update API documentation and remove stale
  comments that describe AI validation, quotas, or eligibility.
- No production behavior is implemented by this specification issue.
