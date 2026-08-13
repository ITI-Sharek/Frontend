import { useTranslation } from "react-i18next";

import { getRoleOptions } from "../../constants/signup.constants";
import type { SignupRole } from "../../types/signup.types";
import { RoleOptionCard } from "../role-option-card";

interface RoleStepProps {
  role: SignupRole | null;
  onSelect: (role: SignupRole) => void;
}

export function RoleStep({ role, onSelect }: RoleStepProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1 text-right">
        <h2 className="text-lg font-bold text-foreground">
          {t("register.role.title")}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t("register.role.subtitle")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {getRoleOptions(t).map((option) => (
          <RoleOptionCard
            key={option.value}
            title={option.title}
            description={option.description}
            icon={option.icon}
            selected={role === option.value}
            onSelect={() => onSelect(option.value)}
          />
        ))}
      </div>
      <p className="text-right text-xs text-muted-foreground">
        {t("register.role.disclaimer")}
      </p>
    </div>
  );
}
