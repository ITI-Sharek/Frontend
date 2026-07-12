import React from "react";

/** ForgotPasswordScreen — email-only recovery form. */
export function ForgotPasswordScreen({ ds, onNavigate }) {
  const { Card, AuthHero, AuthTextField, Button, Icon } = ds;
  return (
    <div style={{ display: "flex", width: "100%", maxWidth: 440, flexDirection: "column", gap: 24, margin: "0 auto" }} dir="rtl">
      <AuthHero
        heading="نسيت كلمة المرور"
        subtext="أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور."
        logoSrc="../../assets/logo-mark.png"
      />
      <Card>
        <form style={{ display: "flex", width: "100%", flexDirection: "column", gap: 24 }} onSubmit={(e) => e.preventDefault()}>
          <AuthTextField id="forgot-email" label="البريد الإلكتروني" icon="mail" placeholder="name@company.com" autoComplete="email" />
          <Button type="submit" style={{ width: "100%" }}>
            <Icon name="arrow-left" size={16} />
            <span>إرسال رابط إعادة التعيين</span>
          </Button>
        </form>
      </Card>
      <p style={{ width: "100%", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 16, margin: 0 }}>
        <span style={{ color: "var(--muted-foreground)" }}>العودة الي </span>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("login"); }} style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
          تسجيل الدخول
        </a>
      </p>
    </div>
  );
}

window.ForgotPasswordScreen = ForgotPasswordScreen;
