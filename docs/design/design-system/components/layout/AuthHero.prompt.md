Centered logo + big 48px heading + muted subtext — sits above the card on every auth screen (login, register, forgot-password).

```jsx
<AuthHero heading="مرحباً بك مجدداً" subtext="سجل دخولك" logoSrc="/assets/logo-mark.png" />
```

Pass `logoSrc` relative to your page's location — default assumes two directories deep (`ui_kits/<x>/`).
