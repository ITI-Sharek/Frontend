import { Card } from "@/shared/components/ui/card";

interface ContributorProfileEmptyStateProps {
  title: string;
  description: string;
}

export function ContributorProfileEmptyState({
  title,
  description,
}: ContributorProfileEmptyStateProps) {
  return (
    <Card className="border-dashed bg-card/70 p-5">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </Card>
  );
}
