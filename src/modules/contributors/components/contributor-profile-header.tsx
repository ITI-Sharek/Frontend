import {
  BadgeCheck,
  Github,
  MoreHorizontal,
  Pencil,
  Share2,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import { ROUTES } from "@/config/routes.config";
import { Avatar } from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function ContributorProfileHeader({
  profile,
  onLogout,
}: {
  profile: ContributorProfileDto;
  onLogout?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const isOwner = profile.viewerRelationship === "owner";

  const displaySkills =
    profile.declaredSkills.length > 0
      ? profile.declaredSkills
      : profile.skills.map((skill) => skill.name);

  const visibleSkills = displaySkills.slice(0, 6);
  const remainingCount = Math.max(0, displaySkills.length - 6);

  function handleCopyProfile() {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const displayName = profile.displayName || profile.username;
  const profileDescriptor = [
    profile.roleLabel,
    profile.experienceLevel
      ? i18n.language.startsWith("ar")
        ? profile.experienceLevel.labelAr
        : profile.experienceLevel.labelEn
      : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-r from-[#EFF6FF]/70 via-[#F8FAFC]/50 to-white p-6 shadow-sm dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-slate-900 sm:p-7">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        {/* Left: Avatar & Info */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          {/* Avatar with status indicator */}
          <div className="relative shrink-0 self-start">
            <div className="size-24 overflow-hidden rounded-full ring-4 ring-white shadow-md dark:ring-slate-800 sm:size-28">
              <Avatar
                src={profile.avatarUrl}
                alt={displayName}
                size="xl"
                fallback={displayName ? displayName.slice(0, 2).toUpperCase() : "AH"}
                className="size-full object-cover"
              />
            </div>
          </div>

          {/* User Details */}
          <div className="flex flex-col">
            {/* Name + Verified check badge */}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-[26px]">
                {displayName}
              </h1>
              {profile.identityVerified && (
                <span
                  title={i18n.language.startsWith("ar") ? "الهوية موثقة رسمياً" : "Identity Verified"}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                >
                  <BadgeCheck className="size-4" />
                  <span className="text-[11px] font-bold">
                    {i18n.language.startsWith("ar") ? "موثّق" : "Verified"}
                  </span>
                </span>
              )}
              <span className="sr-only">
                {isOwner
                  ? t("contributor.profileView.ownLabel")
                  : t("contributor.profileView.publicLabel")}
              </span>
            </div>

            {/* Role & Tagline */}
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {profileDescriptor || t("contributor.profile.unspecified")}
            </p>

            {/* Meta row: Location, Join date, GitHub */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span dir="ltr" className="font-mono">@{profile.username}</span>
              {profile.availability && <span>{profile.availability}</span>}
              {profile.githubStatus.connected && profile.githubStatus.username ? (
                <a
                  dir="ltr"
                  href={`https://github.com/${profile.githubStatus.username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-slate-800 transition-colors hover:text-blue-600 dark:text-slate-200 dark:hover:text-blue-400"
                >
                  <Github className="size-3.5" />
                  GitHub
                </a>
              ) : null}
            </div>

            {/* Bio text */}
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              {profile.bio ?? (
                isOwner
                  ? t("contributor.profile.aboutEmptyTitle")
                  : t("contributor.profile.aboutEmptyDescription")
              )}
            </p>

            {/* Skill tags */}
            {visibleSkills.length > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  dir="ltr"
                  className="rounded-full border border-slate-200/90 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {skill}
                </span>
              ))}
                {remainingCount > 0 && (
                <span className="rounded-full border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  +{remainingCount}
                </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 self-start md:shrink-0">
          {isOwner && <Button
            asChild
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-800 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            <Link to={ROUTES.settings}>
              <Pencil className="size-3.5 text-slate-500" />
              <span>{t("contributor.profile.editProfile")}</span>
            </Link>
          </Button>}

          {/* More options dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-9 rounded-lg border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label={t("common.actions")}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopyProfile} className="cursor-pointer">
                <Share2 className="size-4 me-2" />
                <span>{copied ? "Link Copied" : "Copy Profile Link"}</span>
              </DropdownMenuItem>
              {isOwner && (
                <>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={ROUTES.settings} search={{ section: "github" }}>
                      <Sparkles className="size-4 me-2 text-primary" />
                      <span>{t("navigation.skillAnalysis")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={ROUTES.settings}>
                      <Pencil className="size-4 me-2" />
                      <span>{t("navigation.settings")}</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              {isOwner && onLogout && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive">
                    <span>{t("contributor.profileView.logout")}</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
