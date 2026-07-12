Pair of outline social-auth buttons (GitHub + Google), always LTR regardless of page direction. GitHub is listed first — this is a developer/open-source platform, GitHub identity is primary.

```jsx
<SocialAuthButtons />
```

Note: the real app renders Google's real 4-color "G" glyph via inline SVG (brand mark, not a Lucide icon) — this recreation substitutes the closest Lucide stand-in (`chrome`) since brand marks aren't redrawn from memory here; swap in the real Google "G" asset in production.
