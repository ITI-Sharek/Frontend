Renders a Lucide icon (the codebase's icon set) recolored via CSS mask, so it always matches surrounding text color.

```jsx
<Icon name="mail" size={16} style={{ color: "var(--muted-foreground)" }} />
```

Pass any [Lucide](https://lucide.dev) icon name in kebab-case. Used throughout forms (`mail`, `lock`, `eye`, `eye-off`, `user`), navigation (`arrow-left`, `arrow-right`, `check`), and social auth (`github`).
