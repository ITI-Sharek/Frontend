import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { createIdempotencyKey } from "@/shared/utils/idempotency-key";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";

import {
  useAdoptContributionRequestMaterialSuggestionMutation,
  useAdoptProjectMaterialSuggestionMutation,
  useCreateMaterialAnalysisSetMutation,
  useRejectMaterialDraftSuggestionMutation,
  useStartMaterialAnalysisRunMutation,
} from "../api/mutations/use-material-analysis-mutations";
import {
  useMaterialAnalysisConstraintsQuery,
  useMaterialAnalysisRunQuery,
  useProjectMaterialsQuery,
} from "../api/queries/use-material-queries";
import type { MaterialDraftSuggestion } from "../types/material-analysis.types";

export function MaterialAnalysisPanel({
  projectId,
  projectRevision,
  projectStatus,
}: {
  projectId: string;
  projectRevision: number;
  projectStatus: "draft" | "published" | "archived";
}) {
  const { t } = useTranslation();
  const materialsQuery = useProjectMaterialsQuery(projectId);
  const constraintsQuery = useMaterialAnalysisConstraintsQuery(projectId);
  const createSet = useCreateMaterialAnalysisSetMutation(projectId);
  const startRun = useStartMaterialAnalysisRunMutation(projectId);
  const reject = useRejectMaterialDraftSuggestionMutation();
  const adoptProject = useAdoptProjectMaterialSuggestionMutation(projectId);
  const adoptRequest = useAdoptContributionRequestMaterialSuggestionMutation(projectId);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [runId, setRunId] = useState<string | null>(null);
  const [closeTimes, setCloseTimes] = useState<Record<string, string>>({});

  const readyVersions = (materialsQuery.data ?? []).flatMap((material) =>
    material.versions
      .filter((version) => version.scanStatus === "READY" && version.purgedAt === null)
      .map((version) => ({ material, version })),
  );
  const maxDocuments = constraintsQuery.data?.maxDocuments ?? 5;
  const runQuery = useMaterialAnalysisRunQuery(runId);
  const busy = createSet.isPending || startRun.isPending;
  const actionsBusy = adoptProject.isPending || adoptRequest.isPending || reject.isPending;
  const adoptionError = adoptProject.error ?? adoptRequest.error ?? reject.error;

  function toggle(key: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  }

  function startAnalysis() {
    const materialVersions = readyVersions
      .filter(({ material, version }) => selected.has(`${material.id}:${version.version}`))
      .map(({ material, version }) => ({ materialId: material.id, version: version.version }));
    createSet.mutate(materialVersions, {
      onSuccess: (analysisSet) => {
        startRun.mutate(analysisSet.id, {
          onSuccess: (run) => setRunId(run.id),
        });
      },
    });
  }

  if (materialsQuery.isPending || constraintsQuery.isPending) {
    return <p className="text-sm text-muted-foreground">{t("materials.analysis.preparing")}</p>;
  }
  if (materialsQuery.isError || constraintsQuery.isError) {
    return <p className="text-sm text-destructive">{t("materials.analysis.loadError")}</p>;
  }

  return (
    <section className="space-y-5 rounded-card border border-border bg-card p-5" aria-labelledby="material-analysis-title">
      <div>
        <h2 id="material-analysis-title" className="text-lg font-bold text-foreground">
          {t("materials.analysis.title")}
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {t("materials.analysis.description")}
        </p>
      </div>

      <div className="space-y-2">
        {readyVersions.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("materials.analysis.noReadyVersions")}</p>
        ) : (
          readyVersions.map(({ material, version }) => {
            const key = `${material.id}:${version.version}`;
            return (
              <label key={key} className="flex items-center gap-3 rounded-input border border-border p-3 text-sm">
                <Checkbox
                  checked={selected.has(key)}
                  onCheckedChange={(checked) => toggle(key, checked === true)}
                  disabled={!selected.has(key) && selected.size >= maxDocuments}
                />
                <span>
                  <span className="block font-semibold text-foreground">{material.title}</span>
                  <span className="text-muted-foreground">{t("materials.analysis.version", { filename: version.originalFilename, version: version.version })}</span>
                </span>
              </label>
            );
          })
        )}
      </div>

      <Button
        type="button"
        onClick={startAnalysis}
        disabled={busy || selected.size === 0 || selected.size > maxDocuments}
      >
        {busy
          ? t("materials.analysis.starting")
          : selected.size > 0
            ? t("materials.analysis.start", { count: selected.size })
            : t("materials.analysis.startSelectedVersions")}
      </Button>

      {(createSet.isError || startRun.isError) && (
        <p className="text-sm text-destructive">{t("materials.analysis.startError")}</p>
      )}

      {adoptionError && (
        <p role="alert" className="text-sm text-destructive">
          {getApiErrorMessage(adoptionError, t("materials.analysis.adoptionError"))}
        </p>
      )}

      {runQuery.data && <AnalysisRunView
        run={runQuery.data}
        projectStatus={projectStatus}
        closeTimes={closeTimes}
        setCloseTimes={setCloseTimes}
        actionsBusy={actionsBusy}
        onReject={(suggestion) => {
          reject.reset();
          reject.mutate(suggestion.id);
        }}
        onAdoptProject={(suggestion) => {
          adoptProject.reset();
          adoptProject.mutate({ suggestionId: suggestion.id, expectedRevision: projectRevision, idempotencyKey: createIdempotencyKey() });
        }}
        onAdoptRequest={(suggestion) => {
          const localValue = closeTimes[suggestion.id];
          if (!localValue) return;
          adoptRequest.reset();
          adoptRequest.mutate({
            suggestionId: suggestion.id,
            applicationsCloseTime: new Date(localValue).toISOString(),
            idempotencyKey: createIdempotencyKey(),
          });
        }}
      />}
    </section>
  );
}

function AnalysisRunView({
  run,
  projectStatus,
  closeTimes,
  setCloseTimes,
  actionsBusy,
  onReject,
  onAdoptProject,
  onAdoptRequest,
}: {
  run: NonNullable<ReturnType<typeof useMaterialAnalysisRunQuery>["data"]>;
  projectStatus: "draft" | "published" | "archived";
  closeTimes: Record<string, string>;
  setCloseTimes: Dispatch<SetStateAction<Record<string, string>>>;
  actionsBusy: boolean;
  onReject: (suggestion: MaterialDraftSuggestion) => void;
  onAdoptProject: (suggestion: MaterialDraftSuggestion) => void;
  onAdoptRequest: (suggestion: MaterialDraftSuggestion) => void;
}) {
  const { t } = useTranslation();
  if (run.status !== "COMPLETED") {
    return <p className="text-sm text-muted-foreground">{run.status === "FAILED" ? t("materials.analysis.failed", { code: run.errorCode ?? t("materials.analysis.unknown") }) : t("materials.analysis.running")}</p>;
  }

  return (
    <div className="space-y-3 border-t border-border pt-4">
      <h3 className="font-semibold text-foreground">{t("materials.analysis.suggestionsTitle")}</h3>
      {run.suggestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("materials.analysis.noSuggestions")}</p>
      ) : run.suggestions.map((suggestion) => (
        <SuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          projectStatus={projectStatus}
          closeTime={closeTimes[suggestion.id] ?? ""}
          actionsBusy={actionsBusy}
          onCloseTimeChange={(value) => setCloseTimes((current) => ({ ...current, [suggestion.id]: value }))}
          onReject={() => onReject(suggestion)}
          onAdoptProject={() => onAdoptProject(suggestion)}
          onAdoptRequest={() => onAdoptRequest(suggestion)}
        />
      ))}
    </div>
  );
}

function SuggestionCard({
  suggestion,
  projectStatus,
  closeTime,
  actionsBusy,
  onCloseTimeChange,
  onReject,
  onAdoptProject,
  onAdoptRequest,
}: {
  suggestion: MaterialDraftSuggestion;
  projectStatus: "draft" | "published" | "archived";
  closeTime: string;
  actionsBusy: boolean;
  onCloseTimeChange: (value: string) => void;
  onReject: () => void;
  onAdoptProject: () => void;
  onAdoptRequest: () => void;
}) {
  const { t } = useTranslation();
  return (
    <article className="space-y-3 rounded-input border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase text-primary">{suggestion.type === "PROJECT_UPDATE" ? t("materials.analysis.projectUpdate") : t("materials.analysis.contributionRequest")}</span>
        <span className="text-xs text-muted-foreground">{suggestion.status}</span>
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm text-foreground">{JSON.stringify(suggestion.payload, null, 2)}</pre>
      <p className="text-xs leading-5 text-muted-foreground">{suggestion.rationale}</p>
      {suggestion.status === "PENDING" && (
        <div className="flex flex-wrap items-end gap-2">
          {suggestion.type === "CONTRIBUTION_REQUEST" && (
            <>
              <label className="min-w-52 flex-1 text-xs text-muted-foreground">
                {t("materials.analysis.closeTime")}
                <Input type="datetime-local" value={closeTime} onChange={(event) => onCloseTimeChange(event.target.value)} className="mt-1" dir="ltr" disabled={projectStatus !== "published"} />
              </label>
              {projectStatus !== "published" && (
                <p className="basis-full text-xs text-muted-foreground">
                  {t("materials.analysis.publishFirst")}
                </p>
              )}
            </>
          )}
          {suggestion.type === "PROJECT_UPDATE" ? (
            <Button type="button" size="sm" onClick={onAdoptProject} disabled={actionsBusy}>{t("materials.analysis.adoptProject")}</Button>
          ) : (
            <Button type="button" size="sm" onClick={onAdoptRequest} disabled={actionsBusy || !closeTime || projectStatus !== "published"}>{t("materials.analysis.createDraft")}</Button>
          )}
          <Button type="button" size="sm" variant="destructive" onClick={onReject} disabled={actionsBusy}>{t("materials.analysis.reject")}</Button>
        </div>
      )}
    </article>
  );
}
