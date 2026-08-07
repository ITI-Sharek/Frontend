import { isAxiosError } from "axios";
import { useState } from "react";

import { storageService } from "@/services/storage.service";
import { getApiErrorMessage } from "@/shared/utils/get-api-error-message";
import { Button } from "@/shared/components/ui/button";

import { loginUser } from "../services/auth.service";
import type { AuthSessionDto, UserRole } from "../types/auth.types";

interface DevLoginButtonsProps {
  onLoginSuccess?: (session: AuthSessionDto) => void | Promise<void>;
}

const DEV_ACCOUNTS: Array<{
  role: UserRole;
  label: string;
  email: string;
  password: string;
}> = [
  {
    role: "contributor",
    label: "مساهم",
    email: "contributor@sharek.local",
    password: "Admin@1234",
  },
  {
    role: "owner",
    label: "مالك مشروع",
    email: "owner@sharek.local",
    password: "Admin@1234",
  },
  {
    role: "admin",
    label: "أدمن",
    email: "admin@sharek.local",
    password: "Admin@1234",
  },
];

export function DevLoginButtons({ onLoginSuccess }: DevLoginButtonsProps) {
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!import.meta.env.DEV) return null;

  async function handleDevLogin(account: (typeof DEV_ACCOUNTS)[number]) {
    if (pendingRole !== null) return;

    setError(null);
    setPendingRole(account.role);
    try {
      const session = await loginUser({
        email: account.email,
        password: account.password,
      });
      storageService.setAccessToken(session.tokens.accessToken);
      storageService.setRefreshToken(session.tokens.refreshToken);
      await onLoginSuccess?.(session);
    } catch (err) {
      // An unreachable API and a missing seed are different faults with
      // different fixes. Blaming the seed for a dead backend sent a tester off
      // to re-seed a database that was perfectly fine.
      const apiIsUnreachable = isAxiosError(err) && err.response === undefined;
      setError(
        apiIsUnreachable
          ? "تعذر الاتصال بالخادم على المنفذ 4000. تأكد من تشغيل الواجهة الخلفية ثم أعد المحاولة."
          : getApiErrorMessage(
              err,
              "تعذر الدخول بحساب التطوير. تأكد من تشغيل seed في السيرفر.",
            ),
      );
    } finally {
      setPendingRole(null);
    }
  }

  return (
    <div className="w-full rounded-card border border-dashed border-border p-4">
      <p className="text-center text-xs text-muted-foreground">
        دخول سريع (وضع التطوير فقط)
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {DEV_ACCOUNTS.map((account) => (
          <Button
            key={account.role}
            type="button"
            variant="outline"
            size="sm"
            disabled={pendingRole !== null}
            onClick={() => {
              void handleDevLogin(account);
            }}
          >
            {pendingRole === account.role ? "..." : account.label}
          </Button>
        ))}
      </div>
      {error && (
        <p className="mt-3 text-center text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
