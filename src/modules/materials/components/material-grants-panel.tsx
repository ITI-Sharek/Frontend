import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import { getMaterialErrorMessage } from "../constants/material-copy";
import type { MaterialGrantDto } from "../types/material.types";
import { createMaterialIdempotencyKey } from "../utils/material-idempotency";

export interface MaterialGrantsPanelProps {
  grants: MaterialGrantDto[] | undefined;
  isLoading: boolean;
  isSubmitting: boolean;
  onGrant: (input: { granteeId: string; idempotencyKey: string }) => Promise<void>;
  onRevoke: (input: {
    granteeId: string;
    idempotencyKey: string;
  }) => Promise<void>;
}

export function MaterialGrantsPanel({
  grants,
  isLoading,
  isSubmitting,
  onGrant,
  onRevoke,
}: MaterialGrantsPanelProps) {
  const { t } = useTranslation();
  const [granteeId, setGranteeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);
  const inputId = useId();

  const live = grants?.filter((grant) => grant.revokedAt === null) ?? [];
  const revoked = grants?.filter((grant) => grant.revokedAt !== null) ?? [];

  async function handleGrant(event: React.FormEvent) {
    event.preventDefault();
    if (granteeId.trim() === "") {
      setError(t("material.errors.granteeIdRequired"));
      return;
    }
    setError(null);
    try {
      await onGrant({
        granteeId: granteeId.trim(),
        idempotencyKey: createMaterialIdempotencyKey(),
      });
      setGranteeId("");
    } catch (grantError) {
      setError(getMaterialErrorMessage(t, grantError));
    }
  }

  async function handleRevoke(id: string) {
    setPendingRevoke(id);
    setError(null);
    try {
      await onRevoke({
        granteeId: id,
        idempotencyKey: createMaterialIdempotencyKey(),
      });
    } catch (revokeError) {
      setError(getMaterialErrorMessage(t, revokeError));
    } finally {
      setPendingRevoke(null);
    }
  }

  return (
    <section className="space-y-3 rounded-lg bg-muted/30 p-3">
      <div>
        <h4 className="text-sm font-semibold">{t("material.grantsPanelTitle")}</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("material.grantsPanelDescription")}
        </p>
      </div>

      <form onSubmit={handleGrant} className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1">
          <Label htmlFor={inputId} className="text-xs">
            {t("material.granteeId")}
          </Label>
          <Input
            id={inputId}
            value={granteeId}
            onChange={(event) => setGranteeId(event.target.value)}
            placeholder="00000000-0000-4000-8000-000000000000"
            dir="ltr"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          className="sm:self-end"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ShieldCheck className="size-4" aria-hidden />
          )}
          {t("material.grantButton")}
        </Button>
      </form>

      {error !== null && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">{t("material.grantsLoading")}</p>
      ) : live.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          {t("material.grantsEmpty")}
        </p>
      ) : (
        <ul className="space-y-2">
          {live.map((grant) => (
            <li
              key={grant.granteeId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background p-2"
            >
              {/* An explicit space, not only a margin: the two spans render
                  as one word ("Dev Contributor@dev-contributor") wherever the
                  margin does not survive, and a username fused onto a name
                  reads as neither. */}
              <span className="flex flex-wrap items-baseline gap-x-1.5 text-sm">
                <span>{grant.granteeName}</span>
                {grant.granteeUsername !== null && (
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    @{grant.granteeUsername}
                  </span>
                )}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleRevoke(grant.granteeId)}
                disabled={pendingRevoke === grant.granteeId}
              >
                {pendingRevoke === grant.granteeId ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <ShieldX className="size-4" aria-hidden />
                )}
                {t("material.revokeButton")}
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Revoked grants are shown, not hidden. Who once had access is exactly
          what someone reviewing a leak needs to see. */}
      {revoked.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">
            {t("material.revokedTitle", { count: revoked.length })}
          </summary>
          <ul className="mt-2 space-y-1">
            {revoked.map((grant) => (
              <li key={`${grant.granteeId}-${grant.revokedAt}`} className="text-muted-foreground">
                {t("material.grantRevoked", { name: grant.granteeName })}
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
