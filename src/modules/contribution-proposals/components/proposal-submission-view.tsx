import { Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb } from "lucide-react";

import { ROUTES } from "@/config/routes.config";
import { Card } from "@/shared/components/ui/card";

import { ProposalEditor } from "./proposal-editor";
import type { ContributionProposalFields } from "../types/contribution-proposal.types";

export function ProposalSubmissionView({
  projectId,
  isSubmitting,
  error,
  onSubmit,
}: {
  projectId: string;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (fields: ContributionProposalFields) => Promise<void>;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6">
      <Link to={ROUTES.publicProjects} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowRight className="size-4" /> العودة إلى المشاريع
      </Link>
      <header className="mt-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-foreground">اقتراح عمل جديد للمشروع</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              مسار خاص ومنفصل عن التقديم على طلب مساهمة موجود.
            </p>
          </div>
        </div>
      </header>
      <Card className="mt-5">
        <p className="mb-5 text-xs text-muted-foreground">
          معرّف المشروع: <bdi dir="ltr" className="font-mono">{projectId}</bdi>
        </p>
        <ProposalEditor
          requiresDisclosure
          isSubmitting={isSubmitting}
          submitLabel="إرسال المقترح إلى صاحب المشروع"
          error={error}
          onSubmit={onSubmit}
        />
      </Card>
    </div>
  );
}
