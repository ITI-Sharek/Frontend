Bare 50px-tall text input — the foundation `AuthTextField`/`AuthPasswordField` build on.

```jsx
<Input placeholder="name@company.com" dir="ltr" />
```

Placeholder color uses `var(--input-placeholder)` (has an alpha value in dark mode). Prefer `AuthTextField`/`AuthPasswordField` for labeled, icon-decorated fields — reach for bare `Input` only for one-off unlabeled fields.
