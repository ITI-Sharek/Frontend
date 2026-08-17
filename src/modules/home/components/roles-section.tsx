import { Check, FolderGit2, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { DirectionalArrow } from "@/shared/components/ui/directional-arrow";
import { Button } from "@/shared/components/ui/button";

function getContributorPoints(t: TFunction) {
  return [
    t("landing.rolesContributorPoint1"),
    t("landing.rolesContributorPoint2"),
    t("landing.rolesContributorPoint3"),
  ];
}

function getOwnerPoints(t: TFunction) {
  return [
    t("landing.rolesOwnerPoint1"),
    t("landing.rolesOwnerPoint2"),
    t("landing.rolesOwnerPoint3"),
  ];
}

export function RolesSection() {
  const { t } = useTranslation();

  return (
    <section id="for-who" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-card border border-border lg:grid-cols-2">
          <RolePanel
            icon={UserRound}
            label={t("landing.rolesContributorLabel")}
            title={t("landing.rolesContributorTitle")}
            description={t("landing.rolesContributorDescription")}
            points={getContributorPoints(t)}
            action={t("landing.rolesContributorAction")}
            tone="accent"
          />
          <RolePanel
            icon={FolderGit2}
            label={t("landing.rolesOwnerLabel")}
            title={t("landing.rolesOwnerTitle")}
            description={t("landing.rolesOwnerDescription")}
            points={getOwnerPoints(t)}
            action={t("home.addProject")}
            tone="paper"
          />
        </div>
      </div>
    </section>
  );
}

function RolePanel({
  icon: Icon,
  label,
  title,
  description,
  points,
  action,
  tone,
}: {
  icon: typeof UserRound;
  label: string;
  title: string;
  description: string;
  points: readonly string[];
  action: string;
  tone: "accent" | "paper";
}) {
  const isAccent = tone === "accent";

  return (
    <article
      className={
        isAccent
          ? "bg-primary p-7 text-primary-foreground sm:p-10 lg:p-12"
          : "bg-card p-7 text-foreground sm:p-10 lg:p-12"
      }
    >
      <div className="flex items-center gap-3">
        <Icon className="size-6" aria-hidden />
        <p className="font-semibold">{label}</p>
      </div>
      <h2 className="mt-8 text-3xl font-bold leading-tight">{title}</h2>
      <p
        className={`mt-5 max-w-[62ch] text-sm leading-7 sm:text-base ${
          isAccent ? "opacity-85" : "text-muted-foreground"
        }`}
      >
        {description}
      </p>
      <ul className="mt-8 border-t border-current/20">
        {points.map((point) => (
          <li
            key={point}
            className="flex items-start gap-3 border-b border-current/20 py-4 text-sm leading-7"
          >
            <Check className="mt-1 size-4 shrink-0" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <Button
        asChild
        variant={isAccent ? "outline" : "primary"}
        size="default"
        className={
          isAccent
            ? "mt-8 min-h-12 border-current/40 bg-transparent text-current hover:bg-white/10"
            : "mt-8 min-h-12"
        }
      >
        <Link to={ROUTES.register}>
          {action}
          <DirectionalArrow />
        </Link>
      </Button>
    </article>
  );
}
