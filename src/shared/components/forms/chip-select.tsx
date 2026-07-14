import { cn } from "@/lib/utils";

export interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectProps {
  label: string;
  options: ChipOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
}

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  multiple = false,
}: ChipSelectProps) {
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];

  function toggle(optionValue: string) {
    if (multiple) {
      const next = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(next);
    } else {
      onChange(optionValue);
    }
  }

  return (
    <div className="flex w-full flex-col gap-1.5">
      <span className="w-full text-right text-[13px] tracking-[0.65px] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-input-bg text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
