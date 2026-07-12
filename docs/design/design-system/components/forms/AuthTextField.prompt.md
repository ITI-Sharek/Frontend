Labeled text input with a trailing icon (RTL-aware — icon sits at the visual "start" for Arabic reading direction).

```jsx
<AuthTextField id="email" label="البريد الإلكتروني" icon="mail" placeholder="name@company.com" />
```

Defaults to `dir="ltr"` (emails/URLs); pass `dir="rtl"` for name fields typed in Arabic. This is the field type used throughout login/register.
