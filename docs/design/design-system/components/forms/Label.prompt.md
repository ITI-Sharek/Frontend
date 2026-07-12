Form field label — small, mono-spaced, wide letter-tracking (0.65px), muted color.

```jsx
<Label htmlFor="email">البريد الإلكتروني</Label>
```

Always paired with an `htmlFor`/input `id`. Note the label uses the *mono* font, not the sans body font — this is intentional per source (`text-[13px] tracking-[0.65px]` on `font-mono` context via Tailwind defaults inherited from body).
