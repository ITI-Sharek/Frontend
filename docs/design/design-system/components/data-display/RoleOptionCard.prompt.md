Large tappable card for a binary/small-set role choice — shown as a 2-up grid in registration step 1.

```jsx
<RoleOptionCard title="مساهم" description="..." icon="users" selected={role === "contributor"} onSelect={() => setRole("contributor")} />
```

Selected state: teal border, 5%-tint teal background, filled icon badge, check badge top-left (mirrors RTL "top-right" visually via `left` in a right-to-left flex).
