import {
  AtSign,
  BadgeCheck,
  Bell,
  CreditCard,
  ExternalLink,
  Github,
  Globe,
  KeyRound,
  Mail,
  Phone,
  Settings2,
  ShieldCheck,
  User,
  UserRound,
  UserRoundPen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import type { AuthUserDto } from "@/modules/auth";
import type { ContributorProfileDto } from "@/modules/contributors";
import { cn } from "@/lib/utils";

import { PersonalProfileForm } from "./personal-profile-form";
import { PersonalDetailsForm } from "./personal-details-form";
import { ChangePasswordForm } from "./change-password-form";
import { PrivacySettingsForm } from "./privacy-settings-form";
import { IdentityVerificationPanel } from "./identity-verification-panel";
import { EmailSettingsForm } from "./email-settings-form";
import { PhoneSettingsForm } from "./phone-settings-form";
import { UsernameSettingsForm } from "./username-settings-form";

export type SettingsSubTabId =
  | "profile"
  | "personal"
  | "notifications"
  | "password"
  | "privacy"
  | "identity"
  | "email"
  | "phone"
  | "username";

interface SettingsNavItem {
  id: SettingsSubTabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

interface NavGroup {
  id: string;
  label: string;
  items: SettingsNavItem[];
}

export interface PersonalInformationSettingsPageProps {
  user: AuthUserDto;
  profile?: ContributorProfileDto;
  onNavigateToSection?: (
    section: "profile" | "github" | "language" | "notifications" | "subscription",
  ) => void;
}

export function PersonalInformationSettingsPage({
  user,
  profile,
  onNavigateToSection,
}: PersonalInformationSettingsPageProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");
  const isContributor = user.role === "contributor";
  const isIdentityVerified = user.identityVerificationStatus === "verified";

  const [activeItem, setActiveItem] = useState<SettingsSubTabId>("profile");

  const navGroups: NavGroup[] = [
    {
      id: "profile-group",
      label: t("settings.personal.navGroups.profile"),
      items: [
        {
          id: "profile",
          label: t("settings.personal.nav.profile"),
          icon: UserRound,
        },
        {
          id: "personal",
          label: t("settings.personal.nav.personal"),
          icon: UserRoundPen,
        },
        {
          id: "username",
          label: t("settings.personal.nav.username"),
          icon: AtSign,
        },
      ],
    },
    {
      id: "security-group",
      label: t("settings.personal.navGroups.security"),
      items: [
        {
          id: "password",
          label: t("settings.personal.nav.password"),
          icon: KeyRound,
        },
        {
          id: "email",
          label: t("settings.personal.nav.email"),
          icon: Mail,
        },
        {
          id: "phone",
          label: t("settings.personal.nav.phone"),
          icon: Phone,
        },
        {
          id: "identity",
          label: t("settings.personal.nav.identity"),
          icon: BadgeCheck,
          badge: isIdentityVerified ? (isArabic ? "موثّق" : "Verified") : undefined,
        },
      ],
    },
    {
      id: "preferences-group",
      label: t("settings.personal.navGroups.preferences"),
      items: [
        {
          id: "privacy",
          label: t("settings.personal.nav.privacy"),
          icon: ShieldCheck,
        },
        {
          id: "notifications",
          label: t("settings.personal.nav.notifications"),
          icon: Bell,
        },
      ],
    },
  ];

  function handleSelectItem(itemId: SettingsSubTabId) {
    if (itemId === "notifications") {
      onNavigateToSection?.("notifications");
      return;
    }
    setActiveItem(itemId);
  }

  const topTabs = [
    {
      id: "profile" as const,
      label: t("settings.personal.tabs.account"),
      icon: User,
      active: true,
    },
    ...(isContributor
      ? [
          {
            id: "github" as const,
            label: t("settings.personal.tabs.github"),
            icon: Github,
            active: false,
          },
        ]
      : []),
    {
      id: "language" as const,
      label: t("settings.personal.tabs.language"),
      icon: Globe,
      active: false,
    },
    {
      id: "notifications" as const,
      label: t("settings.personal.tabs.notifications"),
      icon: Bell,
      active: false,
    },
    {
      id: "subscription" as const,
      label: t("settings.personal.tabs.subscription"),
      icon: CreditCard,
      active: false,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Settings2 className="size-6 stroke-[2.2]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {t("settings.title")}
              </h1>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {isContributor
                  ? isArabic
                    ? "حساب مساهم"
                    : "Contributor Account"
                  : isArabic
                    ? "حساب مستخدم"
                    : "User Account"}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("settings.personal.subtitle")}
            </p>
          </div>
        </div>

        {user.username && (
          <Link
            to={ROUTES.contributorProfile(user.username)}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border/80 bg-card px-4 py-2.5 text-xs font-semibold text-foreground shadow-2xs transition-colors hover:border-primary/50 hover:bg-muted/40 sm:self-center"
          >
            <span>{t("settings.personal.viewPublicProfile")}</span>
            <ExternalLink className="size-3.5 text-muted-foreground" />
          </Link>
        )}
      </div>

      {/* Top Domain Switcher Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-1">
        {topTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id !== "profile") {
                  onNavigateToSection?.(tab.id);
                }
              }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shrink-0",
                tab.active
                  ? "bg-primary text-primary-foreground shadow-xs ring-2 ring-primary/20"
                  : "border border-border/80 bg-card text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:col-span-4 xl:col-span-3.5">
          <nav
            aria-label={t("settings.personal.navLabel")}
            className="flex flex-col gap-5 rounded-2xl border border-border/80 bg-card p-3.5 shadow-2xs"
          >
            {navGroups.map((group) => (
              <div key={group.id} className="flex flex-col gap-1">
                <p className="px-3 pb-1 text-2xs font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.label}
                </p>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.id === activeItem;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => handleSelectItem(item.id)}
                      className={cn(
                        "group flex h-11 w-full items-center justify-between rounded-xl px-3.5 text-start text-xs font-semibold transition-all",
                        isActive
                          ? "bg-primary/10 text-primary ring-1 ring-primary/20 font-bold dark:bg-primary/20 dark:text-primary-foreground"
                          : "text-foreground hover:bg-muted/60",
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isActive
                              ? "text-primary dark:text-primary-foreground"
                              : "text-muted-foreground group-hover:text-foreground",
                          )}
                          strokeWidth={2}
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge && (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-2xs font-bold text-emerald-600 dark:text-emerald-400">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </aside>

        {/* Active Content Card */}
        <main className="min-w-0 rounded-2xl border border-border/80 bg-card p-5 shadow-2xs sm:p-8 lg:col-span-8 xl:col-span-8.5">
          {activeItem === "profile" && (
            <PersonalProfileForm user={user} profile={profile} />
          )}

          {activeItem === "personal" && (
            <PersonalDetailsForm user={user} profile={profile} />
          )}

          {activeItem === "username" && <UsernameSettingsForm user={user} />}

          {activeItem === "password" && <ChangePasswordForm user={user} />}

          {activeItem === "email" && <EmailSettingsForm user={user} />}

          {activeItem === "phone" && <PhoneSettingsForm user={user} />}

          {activeItem === "identity" && (
            <IdentityVerificationPanel user={user} profile={profile} />
          )}

          {activeItem === "privacy" && (
            <PrivacySettingsForm user={user} profile={profile} />
          )}
        </main>
      </div>
    </div>
  );
}
