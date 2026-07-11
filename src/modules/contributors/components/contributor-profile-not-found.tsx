import { Link } from "@tanstack/react-router";
import { SearchX } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

export function ContributorProfileNotFound() {
  return (
    <Card className="flex flex-col items-start gap-4">
      <span className="rounded-full bg-border/50 p-3 text-muted-foreground">
        <SearchX className="size-6" />
      </span>
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          لم يتم العثور على الملف
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          اسم المستخدم غير موجود أو لا يخص حساب مساهم.
        </p>
      </div>
      <Button asChild size="sm">
        <Link to={ROUTES.home}>العودة للرئيسية</Link>
      </Button>
    </Card>
  );
}
