# Client Baseline: Realtime Notification Foundation

Recorded 2026-08-09 before the typed HTTP authority work. Existing dirty
Contribution Request and Material changes were left untouched.

## Focused baseline

Command:

```text
npm test -- --run src/modules/notifications src/providers/notifications-provider.test.tsx src/shared/components/layout/workspace-navigation.test.ts
```

Result: 4 test files passed, 7 tests passed.

The settings route has no dedicated test file in the current client. Its
baseline is covered by the exact TypeScript and production build checks below.

## Repository baseline

| Check | Result |
|---|---|
| `npm test` | 82 test files, 459 tests passed |
| `npm run typecheck` | Passed |
| `npm run lint -- --max-warnings=0` | Passed |
| `npm run build` | Passed |

The workspace contains an empty `.git` directory without Git metadata, so
`git status --short` and `git diff --check` cannot run. No commit or push was
performed.

## Slice validation

After T002–T031, the client gates passed:

| Check | Result |
|---|---|
| `npm run generate-routes` | Passed |
| `npm test` | 96 test files, 507 tests passed |
| `npm run typecheck` | Passed |
| `npm run lint -- --max-warnings=0` | Passed |
| `npm run build` | Client and SSR builds passed |

Backend architecture validation and the Notification semantic migration
fixture also passed. The backend full suite currently has 92 passing suites /
655 passing tests and 6 suites blocked by pre-existing Materials/AI TypeScript
errors in `src/modules/ai/integrations/material-analysis.client.ts`; those
unrelated dirty Materials changes were preserved. The migration fixture needed
elevated database subprocess access and then passed.
