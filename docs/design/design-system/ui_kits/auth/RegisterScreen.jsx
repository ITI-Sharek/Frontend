import React from "react";

const ROLE_OPTIONS = [
  { value: "contributor", title: "مساهم", description: "أرغب في المساهمة في مشاريع مفتوحة المصدر وتطوير مهاراتي", icon: "users" },
  { value: "owner", title: "صاحب مشروع", description: "أمتلك مشروعًا أو فكرة وأبحث عن مساهمين لبنائها", icon: "briefcase" },
];
const EXPERIENCE_OPTIONS = [
  { value: "junior", label: "أقل من سنة" },
  { value: "mid", label: "1 - 3 سنوات" },
  { value: "senior", label: "3 - 5 سنوات" },
  { value: "expert", label: "أكثر من 5 سنوات" },
];
const TEAM_SIZE_OPTIONS = [
  { value: "solo", label: "أعمل بمفردي" },
  { value: "small", label: "2 - 10" },
  { value: "medium", label: "11 - 50" },
  { value: "large", label: "أكثر من 50" },
];
const INTEREST_OPTIONS = [
  { value: "web", label: "تطوير الويب" },
  { value: "mobile", label: "تطبيقات الجوال" },
  { value: "ai", label: "الذكاء الاصطناعي" },
  { value: "design", label: "تصميم UI/UX" },
  { value: "devops", label: "DevOps" },
  { value: "docs", label: "توثيق ومحتوى" },
];
const STEPS = ["الدور", "بيانات الحساب", "التفاصيل"];

/** RegisterScreen — 3-step signup: role pick, account details, role-specific extra details + terms. */
export function RegisterScreen({ ds, onNavigate }) {
  const { Card, StepIndicator, RoleOptionCard, AuthTextField, AuthPasswordField, SocialAuthButtons, AuthDivider, ChipSelect, Checkbox, Button, Icon } = ds;
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    role: null, firstName: "", lastName: "", email: "", password: "",
    contributorExperience: "", contributorInterests: [], ownerTeamSize: "", agreedToTerms: false,
  });

  function setField(field, value) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  const valid = [
    data.role !== null,
    data.firstName.trim() !== "" && data.lastName.trim() !== "" && data.email.trim() !== "" && data.password.trim() !== "",
    data.agreedToTerms,
  ][step];
  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (!valid) return;
    if (!isLast) { setStep((s) => s + 1); return; }
    onNavigate("login");
  }

  return (
    <div style={{ display: "flex", width: "100%", maxWidth: 480, flexDirection: "column", gap: 24, margin: "0 auto" }} dir="rtl">
      <Card style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <StepIndicator steps={STEPS} currentStep={step} />
        <form style={{ display: "flex", width: "100%", flexDirection: "column", gap: 24 }} onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "right" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>ما هو دورك في Share-k؟</h2>
                <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)" }}>سيساعدنا هذا في تخصيص تجربتك وعرض الحقول المناسبة لك.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {ROLE_OPTIONS.map((opt) => (
                  <RoleOptionCard key={opt.value} title={opt.title} description={opt.description} icon={opt.icon}
                    selected={data.role === opt.value} onSelect={() => setField("role", opt.value)} />
                ))}
              </div>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "right" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>بيانات الحساب</h2>
                <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)" }}>أنشئ بيانات الدخول الخاصة بحسابك.</p>
              </div>
              <SocialAuthButtons />
              <AuthDivider label="أو عبر البريد" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <AuthTextField id="firstName" label="الاسم الأول" icon="user" dir="rtl" placeholder="محمد" value={data.firstName} onChange={(e) => setField("firstName", e.target.value)} />
                <AuthTextField id="lastName" label="الاسم الأخير" icon="user" dir="rtl" placeholder="أحمد" value={data.lastName} onChange={(e) => setField("lastName", e.target.value)} />
              </div>
              <AuthTextField id="email" label="البريد الإلكتروني" icon="mail" placeholder="name@company.com" value={data.email} onChange={(e) => setField("email", e.target.value)} />
              <AuthPasswordField label="كلمة المرور" value={data.password} onChange={(e) => setField("password", e.target.value)} />
            </div>
          )}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, textAlign: "right" }}>
                <h2 style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>أخبرنا المزيد عنك</h2>
                <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)" }}>حقول مخصصة بناءً على دورك المختار لمساعدتك في العثور على الفرص المناسبة.</p>
              </div>
              {data.role === "contributor" && (
                <>
                  <ChipSelect label="سنوات الخبرة" options={EXPERIENCE_OPTIONS} value={data.contributorExperience} onChange={(v) => setField("contributorExperience", v)} />
                  <ChipSelect label="مجالات الاهتمام" options={INTEREST_OPTIONS} value={data.contributorInterests} onChange={(v) => setField("contributorInterests", v)} multiple />
                </>
              )}
              {data.role === "owner" && (
                <ChipSelect label="حجم الفريق" options={TEAM_SIZE_OPTIONS} value={data.ownerTeamSize} onChange={(v) => setField("ownerTeamSize", v)} />
              )}
              <div style={{ display: "flex", width: "100%", alignItems: "flex-start", gap: 8 }}>
                <Checkbox checked={data.agreedToTerms} onCheckedChange={(c) => setField("agreedToTerms", c)} style={{ marginTop: 4 }} />
                <label style={{ flex: 1, textAlign: "right", fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--muted-foreground)" }}>
                  أوافق على <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>شروط الخدمة</a> و <a href="#" style={{ color: "var(--primary)", fontWeight: 600 }}>سياسة الخصوصية</a> الخاصة بـ Share-k.
                </label>
              </div>
            </div>
          )}

          <div style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, paddingTop: 8 }}>
            {step > 0 && (
              <Button type="button" variant="outline" style={{ flex: 1 }} onClick={() => setStep((s) => Math.max(0, s - 1))}>
                <Icon name="arrow-right" size={16} /><span>رجوع</span>
              </Button>
            )}
            <Button type="submit" style={{ flex: 1 }} disabled={!valid}>
              <Icon name="arrow-left" size={16} />
              <span>{isLast ? "إنشاء حسابي المجاني" : "التالي"}</span>
            </Button>
          </div>
        </form>
      </Card>
      <p style={{ width: "100%", textAlign: "center", fontFamily: "var(--font-sans)", fontSize: 16, margin: 0 }}>
        <span style={{ color: "var(--muted-foreground)" }}>لديك حساب بالفعل؟ </span>
        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate("login"); }} style={{ fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
          تسجيل الدخول
        </a>
      </p>
    </div>
  );
}

window.RegisterScreen = RegisterScreen;
