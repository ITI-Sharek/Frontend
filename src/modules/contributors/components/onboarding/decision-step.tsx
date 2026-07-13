import { BadgeCheck, CircleAlert, MessageSquareWarning } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import type { OnboardingOutcome } from "../../types/onboarding.types";

/**
 * CJ-1 step 5: review decision. Approved celebrates briefly then points to
 * work; partial explains the §5 rule; rejected follows Principle 5 —
 * honest reason + forward actions, never a wall.
 */
export function DecisionStep({
  outcome,
  dashboardHref,
  onReanalyze,
}: {
  outcome: OnboardingOutcome;
  dashboardHref: string;
  onReanalyze: () => void;
}) {
  if (outcome === "approved") {
    return (
      <Card className="border-primary/40 bg-primary/5">
        <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-primary">
          <BadgeCheck className="size-4" />
          موثَّق
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          ملفك موثق — يمكنك التقديم الآن
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          اعتمد فريق المراجعة مهاراتك. المهام المطابقة لمهاراتك الموثقة بانتظارك
          في لوحة التحكم.
        </p>
        <Button asChild size="sm" className="mt-4">
          <a href={dashboardHref}>الانتقال إلى لوحة التحكم</a>
        </Button>
      </Card>
    );
  }

  if (outcome === "partially_approved") {
    return (
      <Card>
        <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-amber-600 dark:text-amber-400">
          <CircleAlert className="size-4" />
          موثَّق جزئيًا
        </p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">
          اعتُمد جزء من مهاراتك
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          يمكنك التقديم باستخدام <b className="text-foreground">المهارات المعتمدة فقط</b>.
          راجع المهارات المرفوضة في صفحة مهاراتي — يمكنك الاعتراض أو تحسين نشاطك
          ثم إعادة التحليل.
        </p>
        <div className="mt-4 flex gap-2">
          <Button asChild size="sm">
            <a href={dashboardHref}>الانتقال إلى لوحة التحكم</a>
          </Button>
          <Button size="sm" variant="outline" onClick={onReanalyze}>
            إعادة التحليل لاحقًا
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <p className="flex items-center gap-2 font-mono text-[13px] tracking-[0.65px] text-destructive">
        <MessageSquareWarning className="size-4" />
        غير موثَّق
      </p>
      <h2 className="mt-2 text-2xl font-bold text-foreground">
        لم يُعتمد ملفك هذه المرة
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        هذا قيد على الأهلية لا على حسابك: يمكنك التصفح وقراءة أسباب الرفض
        والاعتراض — ولا يمكنك التقديم حتى يُعتمد ملفك. الطريق للأمام:
      </p>
      <ol className="mt-3 flex flex-col gap-2 text-sm leading-6 text-muted-foreground">
        <li>١. اقرأ ملاحظات المراجع على كل مهارة مرفوضة.</li>
        <li>٢. إن رأيت خطأً — قدّم اعتراضًا وسيراجعه فريق آخر.</li>
        <li>٣. أو حسّن نشاطك العام على GitHub ثم أعد التحليل.</li>
      </ol>
      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline">
          اعتراض على القرار
        </Button>
        <Button size="sm" variant="outline" onClick={onReanalyze}>
          إعادة التحليل بعد التحسين
        </Button>
      </div>
    </Card>
  );
}
