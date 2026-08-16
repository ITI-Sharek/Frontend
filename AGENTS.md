<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan:
`specs/007-realtime-notification-foundation/plan.md`
<!-- SPECKIT END -->

## Shared product contract

Before frontend planning or implementation, read the canonical sibling docs:

1. `../docs/CONTEXT.md`
2. `../docs/product/governance/decision-log.md`
3. relevant ADRs under `../docs/adr/`
4. the current sprint under `../docs/product/sprints/`

Repository-local specs may add frontend detail but must not contradict the
shared product contract. See `docs/SHARED-PRODUCT-DOCS.md`.

## Shared UI component rule

Before creating or changing frontend UI, inspect `src/shared/components/ui/`
for an existing shadcn-style component and reuse it whenever it covers the
need. Do not create a page- or module-local duplicate of an existing shared
component.

If no suitable shared component exists, create a reusable component in
`src/shared/components/ui/` rather than embedding a repeated control in a
page. Follow the existing shadcn/Radix patterns, Sharek design tokens,
keyboard accessibility, and RTL/LTR behavior. Clearly treat new components as
Sharek components built in the project's shadcn style; do not claim they are
official shadcn components unless they were actually generated or copied from
shadcn/ui.

When the local inventory has no suitable component, check the official
shadcn/ui documentation and registry before writing custom code. Prefer the
official registry implementation and add it from the `client/` directory with
`pnpm dlx shadcn@latest add <component>`, then review the generated files,
dependencies, aliases, and tokens before using it. Do not add a community
registry component or initialize/overwrite shadcn configuration without
explicitly confirming that it is compatible with this project. Only create a
new Sharek component after no suitable official component exists.
