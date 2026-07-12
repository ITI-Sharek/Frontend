16px square checkbox, `rounded-social` radius, fills teal with a check glyph when checked.

```jsx
const [agreed, setAgreed] = useState(false);
<Checkbox checked={agreed} onCheckedChange={setAgreed} />
```

Used for "remember me" and terms-agreement rows. Always pair with an adjacent `<label>` (see `terms agreement` pattern in `RegisterScreen`).
