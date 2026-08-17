import {
  AtSign,
  Check,
  ExternalLink,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";

import { useUpdateUsernameMutation, useUsernameAvailabilityQuery, type AuthUserDto } from "@/modules/auth";
import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

interface UsernameSettingsFormProps {
  user: AuthUserDto;
}

export function UsernameSettingsForm({ user }: UsernameSettingsFormProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language.startsWith("ar");

  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);
  const availability = useUsernameAvailabilityQuery(username);
  const updateUsername = useUpdateUsernameMutation();

  function handleUsernameChange(val: string) {
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setUsername(cleaned);
    setSaved(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!availability.formatValid || availability.data?.available !== true) return;
    updateUsername.mutate(username, { onSuccess: () => setSaved(true) });
  }

  const availabilityMessage = availability.data?.reason
    ? availability.data.reason === "taken"
      ? isArabic
        ? "اسم المستخدم مستخدم بالفعل."
        : "This username is already taken."
      : availability.data.reason === "reserved"
        ? isArabic
          ? "اسم المستخدم محجوز."
          : "This username is reserved."
        : isArabic
          ? "استخدم 3–30 حرفًا أو رقمًا، مع الشرطة السفلية أو الشرطة فقط."
          : "Use 3–30 letters or numbers, with underscores or hyphens only."
    : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* Header */}
      <div className="border-b border-border/80 pb-5">
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("settings.personal.username.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("settings.personal.username.description")}
        </p>
      </div>

      {/* Current Username Card */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-5">
        <p className="text-xs font-semibold text-muted-foreground">
          {t("settings.personal.username.currentTitle")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <AtSign className="size-5" />
            </span>
            <div>
              <p dir="ltr" className="font-mono text-base font-bold text-foreground">
                @{user.username ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "معرفك النشط حاليًا في المجتمع." : "Your active identity in the community."}
              </p>
            </div>
          </div>
          {user.username && (
            <Link
              to={ROUTES.contributorProfile(user.username)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-muted"
            >
              <span>{t("settings.personal.viewPublicProfile")}</span>
              <ExternalLink className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Change Username Form */}
      <div className="flex flex-col gap-4 max-w-lg">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="new-username" className="text-sm font-semibold text-foreground">
              {t("settings.personal.username.newUsernameLabel")} *
            </Label>
            {availability.isDebouncing || availability.isFetching ? (
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>{t("settings.personal.username.checking")}</span>
              </span>
            ) : availability.data?.available ? (
              <span className="flex items-center gap-1 text-2xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check className="size-3" />
                <span>{t("settings.personal.username.available")}</span>
              </span>
            ) : availabilityMessage ? (
              <span className="text-2xs font-medium text-destructive">
                {availabilityMessage}
              </span>
            ) : null}
          </div>

          <div className="relative">
            <AtSign className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="new-username"
              type="text"
              dir="ltr"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder={t("settings.personal.username.newUsernamePlaceholder")}
              className="h-11 ps-10 rounded-xl border-border bg-background font-mono text-sm font-medium transition-colors hover:border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            />
          </div>
        </div>

        {/* Live URL Preview */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3.5 text-xs">
          <p className="text-2xs font-medium text-muted-foreground">
            {t("settings.personal.username.urlPreview")}
          </p>
          <p dir="ltr" className="mt-1 font-mono text-xs font-bold text-primary">
            https://sharek.io/@{username || "username"}
          </p>
        </div>
      </div>

      {/* Rules & Guidelines */}
      <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 max-w-lg">
        <p className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Info className="size-4 text-primary" />
          <span>{t("settings.personal.username.rules.title")}</span>
        </p>
        <ul className="mt-2.5 flex flex-col gap-1.5 text-xs text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{t("settings.personal.username.rules.rule1")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{t("settings.personal.username.rules.rule2")}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span>{t("settings.personal.username.rules.rule3")}</span>
          </li>
        </ul>
      </div>

      {/* Save Button */}
      <div className="flex justify-end border-t border-border/80 pt-6">
        <Button
          type="submit"
          disabled={
            updateUsername.isPending ||
            availability.isDebouncing ||
            availability.isFetching ||
            availability.data?.available !== true
          }
          className="min-w-[190px] gap-2 rounded-xl text-sm font-semibold shadow-xs"
        >
          {updateUsername.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{isArabic ? "جارٍ الحفظ..." : "Saving..."}</span>
            </>
          ) : saved ? (
            <>
              <Check className="size-4 text-emerald-300" />
              <span>{t("settings.personal.username.saved")}</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              <span>{t("settings.personal.username.save")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
