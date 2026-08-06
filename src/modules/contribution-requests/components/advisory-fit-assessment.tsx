import {
  BrainCircuit,
  CircleAlert,
  FileSearch,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { StatusChip } from "@/shared/components/data-display/status-chip";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";

import { usePresentAdvisoryFitMutation } from "../api/mutations/use-present-advisory-fit-mutation";
import { useRequestAdvisoryFitMutation } from "../api/mutations/use-request-advisory-fit-mutation";
import { useAdvisoryFitQuery } from "../api/queries/use-advisory-fit-query";
import { getApplicationErrorMessage } from "../constants/application-copy";
import type { ApplicationDto } from "../types/application.types";
import type {
  AdvisoryFitAssessmentDto,
  AdvisoryFitFindingDto,
  AssessmentRequestStatus,
} from "../types/advisory-fit.types";

export function AdvisoryFitAssessment({
  application,
}: {
  application: ApplicationDto;
}) {
  const query = useAdvisoryFitQuery(application.id);
  const requestMutation = useRequestAdvisoryFitMutation();
  const presentMutation = usePresentAdvisoryFitMutation();
  const idempotencyKey = useRef<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // The read no longer records presentation, so claim it once the completed
  // result is actually on screen. Keyed by assessment id and guarded by a ref
  // so a poll tick, a refetch or a re-render cannot fire it twice; a failure is
  // deliberately silent, because it must never disturb the owner's decision.
  const presentedFor = useRef<string | null>(null);
  const assessment = query.data;
  const presentAssessment = presentMutation.mutate;
  useEffect(() => {
    if (!assessment) return;
    if (assessment.requestStatus !== "COMPLETED") return;
    if (assessment.presentedAt !== null) return;
    if (presentedFor.current === assessment.id) return;
    presentedFor.current = assessment.id;
    presentAssessment(application.id);
  }, [assessment, application.id, presentAssessment]);

  async function requestAssessment() {
    idempotencyKey.current ??= createIdempotencyKey();
    setRequestError(null);
    try {
      await requestMutation.mutateAsync({
        applicationId: application.id,
        idempotencyKey: idempotencyKey.current,
      });
      idempotencyKey.current = null;
    } catch (error) {
      setRequestError(getApplicationErrorMessage(error));
      await query.refetch();
    }
  }

  return (
    <section
      aria-labelledby={`advisory-fit-title-${application.id}`}
      className="mt-5 rounded-input border border-[#6B5CA5]/25 bg-[#6B5CA5]/[0.04] p-4"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#6B5CA5]/10 text-[#6B5CA5] dark:text-[#A78BFA]">
            <BrainCircuit className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h4
              id={`advisory-fit-title-${application.id}`}
              className="font-bold text-foreground"
            >
              التقييم الاستشاري
            </h4>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              تحليل اختياري للأدلة المثبتة وقت التقديم. لا يقرر القبول أو الرفض
              ولا يستبدل قرارك البشري.
            </p>
          </div>
        </div>
        {query.data && <AssessmentStatusChip status={query.data.requestStatus} />}
      </div>

      {query.isPending ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          جارٍ تحميل حالة التقييم…
        </div>
      ) : query.isError ? (
        <div className="mt-4 rounded-input border border-destructive/25 bg-destructive/5 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CircleAlert className="size-4 text-destructive" aria-hidden="true" />
            تعذر تحميل حالة التقييم
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {getApplicationErrorMessage(query.error)}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-3"
            onClick={() => void query.refetch()}
          >
            إعادة المحاولة
          </Button>
        </div>
      ) : (
        <AssessmentContent
          application={application}
          assessment={query.data}
          isRequesting={requestMutation.isPending}
          requestError={requestError}
          onRequest={() => void requestAssessment()}
          onRefresh={() => void query.refetch()}
        />
      )}
    </section>
  );
}

function AssessmentContent({
  application,
  assessment,
  isRequesting,
  requestError,
  onRequest,
  onRefresh,
}: {
  application: ApplicationDto;
  assessment: AdvisoryFitAssessmentDto;
  isRequesting: boolean;
  requestError: string | null;
  onRequest: () => void;
  onRefresh: () => void;
}) {
  if (assessment.requestStatus === "COMPLETED") {
    return (
      <div className="mt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            خلاصة التقييم
          </span>
          {assessment.fitBand && (
            <StatusChip tone="ai" icon={ShieldCheck}>
              النطاق الاستشاري: {FIT_BAND_LABEL[assessment.fitBand]}
            </StatusChip>
          )}
        </div>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">
          هذا نطاق مشتق من المتطلبات المطلوبة فقط. المتطلبات المفضلة معروضة
          للفهم ولا تغيّر النطاق.
        </p>
        <div className="mt-4 space-y-4">
          <FindingGroup
            title="المتطلبات المطلوبة"
            requirements={application.requirementSnapshot.required}
            findings={assessment.findings}
          />
          {application.requirementSnapshot.preferred.length > 0 && (
            <FindingGroup
              title="المتطلبات المفضلة"
              requirements={application.requirementSnapshot.preferred}
              findings={assessment.findings}
            />
          )}
        </div>
      </div>
    );
  }

  const statusCopy = ASSESSMENT_STATUS_COPY[assessment.requestStatus];
  const statusDescription =
    assessment.requestStatus === "UNAVAILABLE" && !assessment.retryAvailable
      ? "لا يؤثر عدم اكتمال التقييم في قرارك ولا يصف قدرة المساهم. استُخدمت محاولة إعادة التقييم المتاحة، ويمكنك متابعة قرارك دون تقييم."
      : statusCopy.description;
  const canRequest =
    assessment.requestStatus === "NOT_REQUESTED" || assessment.retryAvailable;

  return (
    <div className="mt-4">
      <p
        role="status"
        aria-live="polite"
        className="text-sm font-semibold text-foreground"
      >
        {statusCopy.title}
      </p>
      <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground">
        {statusDescription}
      </p>
      {requestError && (
        <p role="alert" className="mt-3 text-xs leading-5 text-destructive">
          {requestError}
        </p>
      )}
      {canRequest && (
        <Button
          type="button"
          size="sm"
          className="mt-3"
          disabled={isRequesting}
          onClick={onRequest}
        >
          {isRequesting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : assessment.requestStatus === "NOT_REQUESTED" ? (
            <BrainCircuit className="size-4" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          {assessment.requestStatus === "NOT_REQUESTED"
            ? "طلب تقييم استشاري"
            : "إعادة طلب التقييم"}
        </Button>
      )}
      {assessment.requestStatus === "REQUESTED" && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={onRefresh}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          تحديث الحالة
        </Button>
      )}
    </div>
  );
}

function FindingGroup({
  title,
  requirements,
  findings,
}: {
  title: string;
  requirements: ApplicationDto["requirementSnapshot"]["required"];
  findings: AdvisoryFitFindingDto[];
}) {
  return (
    <section aria-label={title}>
      <h5 className="text-sm font-bold text-foreground">{title}</h5>
      {requirements.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">لا توجد متطلبات في هذه الفئة.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {requirements.map((requirement) => {
            const finding = findings.find(
              (item) => item.requirementId === requirement.id,
            );
            return (
              <li
                key={requirement.id}
                className="rounded-input border border-border bg-card p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <strong className="text-sm text-foreground">
                    {requirement.text}
                  </strong>
                  {finding && (
                    <StatusChip tone="ai" icon={BrainCircuit}>
                      {FINDING_LABEL[finding.finding]}
                    </StatusChip>
                  )}
                </div>
                {finding ? (
                  <FindingDetails finding={finding} />
                ) : (
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    لم يرد Finding لهذا المتطلب في النتيجة الحالية.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function FindingDetails({ finding }: { finding: AdvisoryFitFindingDto }) {
  return (
    <div className="mt-3 space-y-2 text-xs leading-5">
      <p className="text-foreground">{finding.explanation}</p>
      <p className="text-muted-foreground">
        الثقة: {CONFIDENCE_LABEL[finding.confidence]}
      </p>
      <div>
        <p className="font-semibold text-foreground">معرّفات الأدلة</p>
        <ul className="mt-1 flex flex-wrap gap-1.5">
          {finding.citations.map((citation) => (
            <li
              key={citation}
              dir="ltr"
              className="rounded bg-border/40 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {citation}
            </li>
          ))}
        </ul>
      </div>
      {finding.uncertainty.length > 0 && (
        <div>
          <p className="font-semibold text-foreground">عدم اليقين</p>
          <ul className="mt-1 list-disc space-y-1 ps-5 text-muted-foreground">
            {finding.uncertainty.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function AssessmentStatusChip({ status }: { status: AssessmentRequestStatus }) {
  const meta = ASSESSMENT_STATUS_META[status];
  return <StatusChip tone={meta.tone} icon={meta.icon}>{meta.label}</StatusChip>;
}

const FIT_BAND_LABEL: Record<NonNullable<AdvisoryFitAssessmentDto["fitBand"]>, string> = {
  STRONG: "قوي",
  PARTIAL: "جزئي",
  LIMITED: "محدود",
  UNKNOWN: "غير حاسم",
  UNAVAILABLE: "غير متاح",
};

const FINDING_LABEL: Record<AdvisoryFitFindingDto["finding"], string> = {
  SUPPORTED: "مدعوم",
  PARTIALLY_SUPPORTED: "مدعوم جزئيًا",
  NOT_EVIDENCED: "لا يوجد دليل كافٍ",
  INCONCLUSIVE: "غير حاسم",
};

const CONFIDENCE_LABEL: Record<AdvisoryFitFindingDto["confidence"], string> = {
  HIGH: "عالية",
  MEDIUM: "متوسطة",
  LOW: "منخفضة",
};

const ASSESSMENT_STATUS_COPY: Record<
  AssessmentRequestStatus,
  { title: string; description: string }
> = {
  NOT_REQUESTED: {
    title: "لم يُطلب تقييم استشاري بعد",
    description:
      "يمكنك طلب تحليل اختياري للأدلة المثبتة دون أن يصبح شرطًا للقبول أو الرفض.",
  },
  REQUESTED: {
    title: "التقييم قيد المعالجة",
    description:
      "يجري تجهيز النتيجة. يمكنك اتخاذ قرارك البشري دون انتظارها.",
  },
  NOT_STARTED_SYSTEM_LIMIT: {
    title: "تعذر بدء التقييم بسبب حد تقني مؤقت",
    description:
      "لا يقول هذا شيئًا عن ملاءمة المساهم. يمكنك إعادة الطلب لاحقًا.",
  },
  NOT_STARTED_NO_ASSESSABLE_EVIDENCE: {
    title: "لا توجد أدلة قابلة للتقييم",
    description:
      "لا يؤثر غياب الدليل في قرارك ولا يصف قدرة المساهم.",
  },
  CANCELLED_NOT_NEEDED: {
    title: "أُلغي التقييم لأنه لم يعد مطلوبًا",
    description:
      "أصبحت حالة طلب التقديم نهائية قبل الحاجة إلى تقييم جديد. لا يؤثر ذلك في المساهم.",
  },
  UNAVAILABLE: {
    title: "لم يكتمل تقييم صالح",
    description:
      "لا يؤثر عدم اكتمال التقييم في قرارك ولا يصف قدرة المساهم. يمكنك إعادة الطلب.",
  },
  COMPLETED: {
    title: "اكتمل التقييم",
    description: "",
  },
};

const ASSESSMENT_STATUS_META: Record<
  AssessmentRequestStatus,
  { label: string; tone: "neutral" | "waiting" | "ai" | "negative"; icon: typeof BrainCircuit }
> = {
  NOT_REQUESTED: { label: "لم يُطلب", tone: "neutral", icon: BrainCircuit },
  REQUESTED: { label: "قيد المعالجة", tone: "waiting", icon: Loader2 },
  COMPLETED: { label: "اكتمل", tone: "ai", icon: ShieldCheck },
  NOT_STARTED_SYSTEM_LIMIT: { label: "حد تقني", tone: "negative", icon: CircleAlert },
  NOT_STARTED_NO_ASSESSABLE_EVIDENCE: {
    label: "لا توجد أدلة قابلة للتقييم",
    tone: "neutral",
    icon: FileSearch,
  },
  CANCELLED_NOT_NEEDED: { label: "لم يعد مطلوبًا", tone: "neutral", icon: CircleAlert },
  UNAVAILABLE: { label: "غير متاح", tone: "negative", icon: CircleAlert },
};
