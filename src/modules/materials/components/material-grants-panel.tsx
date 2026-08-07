import { Loader2, ShieldCheck, ShieldX } from "lucide-react";
import { useId, useState } from "react";

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
  const [granteeId, setGranteeId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<string | null>(null);
  const inputId = useId();

  const live = grants?.filter((grant) => grant.revokedAt === null) ?? [];
  const revoked = grants?.filter((grant) => grant.revokedAt !== null) ?? [];

  async function handleGrant(event: React.FormEvent) {
    event.preventDefault();
    if (granteeId.trim() === "") {
      setError("أدخل معرّف المساهم لمنحه الصلاحية.");
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
      setError(getMaterialErrorMessage(grantError));
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
      setError(getMaterialErrorMessage(revokeError));
    } finally {
      setPendingRevoke(null);
    }
  }

  return (
    <section className="space-y-3 rounded-lg bg-muted/30 p-3">
      <div>
        <h4 className="text-sm font-semibold">الصلاحيات الصريحة</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          امنح الوصول لمساهم لديه إسناد قائم في المشروع. ينتهي الوصول فور سحب
          الصلاحية، بما في ذلك روابط التنزيل التي أُصدرت قبل السحب.
        </p>
      </div>

      <form onSubmit={handleGrant} className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 space-y-1">
          <Label htmlFor={inputId} className="text-xs">
            معرّف المساهم
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
          منح الصلاحية
        </Button>
      </form>

      {error !== null && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      {isLoading ? (
        <p className="text-xs text-muted-foreground">جارٍ تحميل الصلاحيات…</p>
      ) : live.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          لا توجد صلاحيات سارية على هذه المادة.
        </p>
      ) : (
        <ul className="space-y-2">
          {live.map((grant) => (
            <li
              key={grant.granteeId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-background p-2"
            >
              <span className="text-sm">
                {grant.granteeName}
                {grant.granteeUsername !== null && (
                  <span className="ms-1 text-xs text-muted-foreground" dir="ltr">
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
                سحب الصلاحية
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
            صلاحيات مسحوبة ({revoked.length})
          </summary>
          <ul className="mt-2 space-y-1">
            {revoked.map((grant) => (
              <li key={`${grant.granteeId}-${grant.revokedAt}`} className="text-muted-foreground">
                {grant.granteeName} — سُحبت الصلاحية
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
