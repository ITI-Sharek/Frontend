# Quickstart: Contributor Profile Redirect

## Prerequisites

- Frontend dependencies installed with `pnpm install`.
- Backend API available at `http://localhost:4000` (approved standard port,
  DEC-019/023 in `../docs/product/governance/decision-log.md`), or at the configured
  `VITE_API_URL`.
- At least one contributor account with a unique username.
- At least one non-contributor account for role-based redirect validation.

The frontend dev server runs on `http://localhost:3001` by default (DEC-023) and
the backend on `http://localhost:4000`:

```bash
pnpm dev
```

If your backend runs on a different port, point the frontend to it explicitly:

```bash
VITE_API_URL=http://localhost:<backend-port> pnpm dev
```

## Static Validation

```bash
pnpm lint
```

Expected outcome: lint completes without errors.

```bash
pnpm test
```

Expected outcome: unit/component tests pass, including redirect decision and contributor profile state coverage once implemented.

## Manual Validation Scenarios

### Scenario 1: Contributor login redirects to own profile

1. Open the login page.
2. Sign in with a contributor account.
3. Confirm the first authenticated destination is the contributor profile for that user's username.
4. Confirm the page displays contributor identity and profile sections.

Expected outcome: Contributor lands on their own profile, not the home page or generic dashboard.

### Scenario 2: Missing profile is auto-created

1. Use a contributor account that has no contributor profile yet.
2. Sign in successfully.
3. Confirm the profile destination loads instead of a broken screen.
4. Confirm missing optional sections show completion prompts or empty states.

Expected outcome: A basic profile exists and can be reviewed immediately after login.

### Scenario 3: Authenticated user views another contributor profile

1. Sign in as any authenticated user.
2. Navigate directly to another contributor's profile by username.
3. Confirm public contributor information is visible.
4. Confirm private account, authentication, and security-sensitive fields are not visible.

Expected outcome: Authenticated cross-user viewing works with private fields hidden.

### Scenario 4: Non-contributor login keeps role destination

1. Open the login page.
2. Sign in as an owner or admin account.
3. Confirm the user follows the existing role-based destination.

Expected outcome: Non-contributor users are not redirected to contributor profiles.

### Scenario 5: Unknown username

1. Sign in as an authenticated user.
2. Navigate to a contributor profile URL with a username that does not exist.

Expected outcome: The UI shows a clear not-found or recovery state.

### Scenario 6: Unauthenticated profile access

1. Sign out.
2. Open a contributor profile URL directly.

Expected outcome: The user is required to authenticate before the profile is shown.

## Artifact References

- Data model: [data-model.md](./data-model.md)
- Contract: [contracts/contributor-profile.md](./contracts/contributor-profile.md)
- Feature spec: [spec.md](./spec.md)

## Validation Evidence

- 2026-07-11: `pnpm lint` passed.
- 2026-07-11: `pnpm exec tsc --noEmit` passed after generating TanStack routes.
- 2026-07-11: `pnpm test` passed with 5 test files and 18 tests covering route helper behavior, route-level unauthenticated redirect wiring, contributor profile section visibility, privacy prompts, retryable errors, and profile route states.
- 2026-07-11: `pnpm generate-routes` passed.
- 2026-07-11: `pnpm build` passed for client and SSR bundles.
- Live manual login/profile scenarios are pending because they require a running backend API and test accounts at `VITE_API_URL`.
- Login-to-meaningful-profile timing against the 5-second target is pending until the backend profile endpoints are available.
