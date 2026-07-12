import React from "react";

/** LoginScreen — full login view: hero, social auth, email/password, remember+forgot, submit, signup link. */
export function LoginScreen({ ds, onNavigate }) {
  const { Card, AuthHero, SocialAuthButtons, AuthDivider, AuthTextField, AuthPasswordField, Checkbox, Button, Icon } = ds;
  const [remember, setRemember] = React.useState(false);

  return (
    <div style={{ display: "flex", width: "100%", maxWidth: 440, flexDirection: "column", gap: 24, margin: "0 auto" }} dir="rtl">
      <AuthHero heading="مرحباً بك مجدداً" subtext="سجل دخولك الخاصة بـ Share-k." logoSrc="../../assets/logo-mark.png" />
      <Card>
        <form
          style={{ display: "flex", width: "100%", flexDirection: "column", gap: 24 }}
          onSubmit={(e) => e.preventDefault()}
        >
          <SocialAuthButtons />
          <AuthDivider label="أو عبر البريد" />
          <AuthTextField id="email" label="البريد الإلكتروني" icon="mail" placeholder="name@company.com" autoComplete="email" />
          <AuthPasswordField label="كلمة المرور" autoComplete="current-password" />
          <div style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Checkbox checked={remember} onCheckedChange={setRemember} />
              <label style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)" }}>تذكرني</label>
            </div>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate("forgot"); }}
              style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}
            >
              نسيت كلمة المرور؟
            </a>
          </div>
          <Button type="submit" style={{ width: "100%" }}>
            <Icon name="arrow-left" size={16} />
            <span>تسجيل دخول</span>
          </Button>
        </form>
      </Card>
      <p style={{ width: "100%", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 16, margin: 0 }}>
        <span style={{ color: "var(--muted-foreground)" }}>ليس لديك حساب؟ </span>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("register"); }} style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
          إنشاء حساب جديد
        </a>
      </p>
    </div>
  );
}

window.LoginScreen = LoginScreen;
