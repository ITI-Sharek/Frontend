# Research: Contributor Profile Redirect

## Decision: Use username as the canonical profile route identifier

**Rationale**: The specification clarifies username as the stable identifier. It is human-readable, suitable for authenticated profile sharing, and aligns with the architecture's planned `profile.$username.tsx` dynamic route.

**Alternatives considered**:

- System-generated slug: rejected because it adds another identity field without a current requirement.
- Internal user ID: rejected because it exposes implementation-oriented identifiers and is less user-friendly.

## Decision: Auto-create a basic profile on first successful contributor login

**Rationale**: This guarantees the post-login redirect always has a valid destination for contributors and directly satisfies the requirement to avoid broken profile states. The auto-created profile should contain the minimum derived user identity needed to render the profile plus empty states for optional sections.

**Alternatives considered**:

- Required setup flow before profile: rejected for this feature because it delays the requested redirect outcome.
- Error-only empty state: rejected because it creates a poor first-login experience and increases support risk.

## Decision: Keep contributor profile data in a contributors feature module

**Rationale**: Contributor profile behavior belongs to the contributor domain, not auth. Auth decides the post-login destination from session role and username; contributor profile retrieval, auto-create behavior, rendering, and empty/error states belong in `modules/contributors`.

**Alternatives considered**:

- Store profile behavior in `auth`: rejected because it would make all profile logic depend on authentication internals.
- Store profile behavior in `users`: deferred because the feature is contributor-specific and includes contributor-only fields such as availability, reputation, skills, GitHub status, and contribution history.

## Decision: Use role-aware post-login destination logic

**Rationale**: Contributors go to their own profile; non-contributors preserve existing role-based destinations. This prevents owner/admin users from entering a contributor-only experience while keeping this feature scoped.

**Alternatives considered**:

- Send all users to a generic dashboard: rejected because it fails the contributor-specific requirement.
- Block non-contributor login: rejected because it changes authentication behavior outside the feature scope.

## Decision: Require authentication for profile viewing

**Rationale**: The clarification states authenticated users can view profiles by username with private fields hidden. This supports project-owner discovery without exposing profiles to unauthenticated visitors.

**Alternatives considered**:

- Owner-only private profiles: rejected because authenticated cross-user viewing is required.
- Public unauthenticated profiles: rejected because it broadens privacy exposure beyond the clarified scope.

## Decision: Represent privacy as view-mode-specific fields

**Rationale**: Owner views may show completion prompts and private account-adjacent details; non-owner authenticated views show public contributor information only. The UI can be driven by a `viewerRelationship` or equivalent response field without duplicating pages.

**Alternatives considered**:

- Separate owner/public profile pages: rejected because it risks duplicated layout and inconsistent rendering.
- Client-only filtering of private fields: rejected because privacy should be enforced before display and testable through the contract.
