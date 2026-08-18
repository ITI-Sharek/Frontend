import {
  Github,
  Send,
  Share2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function ContributorQuickActionsCard({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  function handleShare() {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
        {t("contributor.dynamic.quickActions")}
      </h2>

      <div className="mt-4 flex flex-col gap-2.5">
        {/* 1. Apply to a Project */}
        {profile.viewerRelationship === "owner" && <Button
          asChild
          className="h-10 w-full rounded-xl bg-blue-600 font-semibold text-white shadow-xs transition-all hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-xs"
        >
          <Link to={ROUTES.explore}>
            <Send className="size-4" />
            <span>{t("contributor.dynamic.exploreRequests")}</span>
          </Link>
        </Button>}

        {/* 2. Share Profile */}
        <Button
          type="button"
          variant="outline"
          onClick={handleShare}
          className="h-10 w-full rounded-xl border-slate-200/90 bg-white font-semibold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-xs"
        >
          <Share2 className="size-4 text-slate-600 dark:text-slate-300" />
          <span>{copied ? t("contributor.dynamic.profileLinkCopied") : t("contributor.dynamic.shareProfile")}</span>
        </Button>

        {profile.viewerRelationship === "owner" && <Button
          asChild
          variant="outline"
          className="h-10 w-full rounded-xl border-slate-200/90 bg-white font-semibold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 text-xs"
        >
          <Link to={ROUTES.settings} search={{ section: "github" }}>
            <Github className="size-4 text-slate-600 dark:text-slate-300" />
            <span>{t("contributor.dynamic.manageGithubEvidence")}</span>
          </Link>
        </Button>}
      </div>
    </div>
  );
}
