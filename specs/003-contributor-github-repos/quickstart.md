# Quickstart: Contributor GitHub Repositories

## Prerequisites

- Frontend dependencies installed with `pnpm install`.
- Backend available at the configured `VITE_API_URL`.
- Authenticated contributor test account.
- For loaded-state validation, the contributor has connected GitHub and the backend returns at least one repository from `GET /github/repositories`.

## Manual Validation

1. Start the frontend:

   ```bash
   pnpm dev
   ```

2. Sign in as a contributor and open `/github/repositories`.

3. Disconnected state:

   - Use a contributor without a connected GitHub account.
   - Confirm the Arabic connect-GitHub empty state appears.
   - Confirm no repository/statistics requests are made before connecting.

4. Repository list:

   - Use a contributor with a connected GitHub account.
   - Confirm returned public and private repositories appear.
   - Confirm repository full names, branches, usernames, URLs, and commit SHAs render left-to-right inside the RTL page.

5. Statistics drill-down:

   - Select a repository.
   - Confirm the statistics panel requests data for that repository full name.
   - Confirm contribution activity and commit signals render when available.
   - If GitHub reports `github_stats_pending`, confirm the panel says the statistics are still calculating rather than showing a hard error.

## Automated Validation

Run all required gates before handoff:

```bash
pnpm generate-routes
pnpm lint
pnpm test
pnpm build
```

Expected outcomes:

- Route tree includes `/github/repositories`.
- Lint passes with no new architecture/import violations.
- Tests cover GitHub service calls, query options/hooks, and main component empty/error/loaded states.
- Production build completes.
