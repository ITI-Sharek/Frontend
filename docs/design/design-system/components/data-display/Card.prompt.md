The container every auth form sits in — 33px padding is exact (not a 32/4px-grid rounding), border + very soft double drop-shadow in light mode, deeper single shadow in dark mode.

```jsx
<Card style={{ display: "flex", flexDirection: "column", gap: 24 }}>
  ...form contents...
</Card>
```

Dark mode drops `--radius-card` from 12px to 8px per token — always read the radius from the CSS variable, never hardcode.
