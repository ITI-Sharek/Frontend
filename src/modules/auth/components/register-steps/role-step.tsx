import { ROLE_OPTIONS } from "../../constants/signup.constants";
import type { SignupRole } from "../../types/signup.types";
import { RoleOptionCard } from "../role-option-card";

interface RoleStepProps {
  role: SignupRole | null;
  onSelect: (role: SignupRole) => void;
}

export function RoleStep({ role, onSelect }: RoleStepProps) {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1 text-right">
        <h2 className="text-lg font-bold text-foreground">
          ما هو دورك في Share-k؟
        </h2>
        <p className="text-sm text-muted-foreground">
          سيساعدنا هذا في تخصيص تجربتك وعرض الحقول المناسبة لك.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ROLE_OPTIONS.map((option) => (
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
    </div>
  );
}
