import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";
import { requireContributorRoute, useCurrentUserQuery } from "@/modules/auth";
import {
  ContributorProfileErrorView,
  ContributorProfileSettingsSection,
  useContributorProfileQuery,
} from "@/modules/contributors";
import { Avatar } from "@/shared/components/ui/avatar";

export const Route = createFileRoute("/_appLayout/profile/edit")({
  beforeLoad: requireContributorRoute,
  head: () => ({ meta: [{ title: "Edit profile | Sharek" }] }),
  component: ContributorProfileEditPage,
});

function ContributorProfileEditPage() {
  const { t } = useTranslation();
  const navigate = Route.useNavigate();
  const currentUserQuery = useCurrentUserQuery();
  const username = currentUserQuery.data?.username ?? "";
  const profileQuery = useContributorProfileQuery(username);
  const profile = profileQuery.data;

  if (!profile && (currentUserQuery.isPending || profileQuery.isPending)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4">
        <ContributorProfileErrorView onRetry={() => void profileQuery.refetch()} />
      </div>
    );
  }

  const completionTotal = 5;
  const completionDone = Math.max(
    0,
    completionTotal -
      Math.min(completionTotal, new Set(profile.completionPrompts).size),
  );
  const completionPercent = Math.round((completionDone / completionTotal) * 100);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to={ROUTES.contributorProfile(profile.username)}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" />
        {t("contributor.edit.backToProfile")}
      </Link>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-blue-50/80 via-white to-fuchsia-50/50 p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-fuchsia-950/20 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
              {t("contributor.edit.title")}
            </h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              {t("contributor.edit.description")}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        <main className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7 lg:col-span-8">
          <div className="mb-6 border-b border-slate-100 pb-5 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              {t("contributor.edit.personalDetails")}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("contributor.edit.personalDetailsDescription")}
            </p>
          </div>
          <ContributorProfileSettingsSection
            profile={profile}
            onCancel={() => void navigate({ to: ROUTES.contributorProfile(profile.username) })}
            onSaved={(updated) =>
              void navigate({ to: ROUTES.contributorProfile(updated.username) })
            }
          />
        </main>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-4">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Eye className="size-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">
                {t("contributor.edit.publicPreview")}
              </h2>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70">
              <Avatar
                src={profile.avatarUrl}
                alt={profile.displayName}
                fallback={profile.displayName.slice(0, 2).toUpperCase()}
                size="lg"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950 dark:text-white">{profile.displayName}</p>
                <p dir="ltr" className="truncate font-mono text-xs text-slate-500 dark:text-slate-400">@{profile.username}</p>
              </div>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {profile.bio ?? t("contributor.edit.previewBioEmpty")}
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-950 dark:text-white">{t("contributor.completion.progressLabel")}</h2>
              </div>
              <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{completionPercent}%</span>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={completionPercent} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completionPercent}%` }} />
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{t("contributor.edit.completionHint")}</p>
          </section>
        </aside>
      </div>
    </div>
  );
}
