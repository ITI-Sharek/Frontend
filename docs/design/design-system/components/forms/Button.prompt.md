Primary call-to-action button with three variants; use when the shadcn-style `Button` from the real app would appear.

```jsx
<Button variant="primary">تسجيل دخول</Button>
<Button variant="outline" size="sm"><span>GitHub</span><Icon name="github" size={16} /></Button>
<Button variant="ghost" size="icon"><Icon name="moon" size={16} /></Button>
```

Variants: `primary` (teal fill, glow shadow — main CTAs), `outline` (bordered, card background — social auth, secondary actions), `ghost` (no chrome — icon-only toggles like theme switch). Sizes: `default` (16px pad, 16px text), `sm` (mono-tracked 13px label, used for social buttons), `icon` (36×36 square).
