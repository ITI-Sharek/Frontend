import { Github, Star, Timer, Trophy } from "lucide-react";
import type { ComponentType } from "react";

import { ContributorProfileEmptyState } from "./contributor-profile-empty-state";
import type { ContributorProfileDto } from "../types/contributor-profile.types";

export function getVisibleCompletionPrompts(profile: ContributorProfileDto) {
  return profile.viewerRelationship === "owner" ? profile.completionPrompts : [];
}

export function getPublicProfileSections(profile: ContributorProfileDto) {
  return {
    hasSkills: profile.skills.length > 0,
    hasHistory: profile.contributionHistory.length > 0,
    hasBio: profile.bio !== null && profile.bio.trim() !== "",
    hasAvailability:
      profile.availability !== null && profile.availability.trim() !== "",
  };
}

export function ContributorProfileSections({
  profile,
}: {
  profile: ContributorProfileDto;
}) {
  const sections = getPublicProfileSections(profile);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-4">
        <div className="rounded-card border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">نبذة</h2>
          {sections.hasBio ? (
            <p className="mt-3 leading-8 text-muted-foreground">{profile.bio}</p>
          ) : (
            <ContributorProfileEmptyState
              title="أضف نبذة تعريفية"
              description="اكتب ملخصاً قصيراً يوضح خبراتك وما تحب المساهمة فيه."
            />
          )}
        </div>

        <div className="rounded-card border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">المهارات</h2>
          {sections.hasSkills ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="rounded-full border border-border bg-background px-3 py-1 text-sm text-foreground"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          ) : (
            <ContributorProfileEmptyState
              title="لا توجد مهارات بعد"
              description="إضافة المهارات تساعد أصحاب المشاريع على فهم نقاط قوتك بسرعة."
            />
          )}
        </div>

        <div className="rounded-card border border-border bg-card p-6">
          <h2 className="text-xl font-bold text-foreground">المساهمات</h2>
          {sections.hasHistory ? (
            <div className="mt-4 space-y-3">
              {profile.contributionHistory.map((item) => (
                <article
                  key={item.id}
                  className="rounded-input border border-border bg-background p-4"
                >
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  {item.role && (
                    <p className="mt-1 text-sm text-primary">{item.role}</p>
                  )}
                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <ContributorProfileEmptyState
              title="لا توجد مساهمات منشورة"
              description="ستظهر هنا المشاريع والمهام التي ساهمت فيها بعد توثيقها."
            />
          )}
        </div>
      </section>

      <aside className="space-y-4">
        <StatCard
          icon={Star}
          label="التقييم"
          value={
            profile.reputationSummary.rating === null
              ? "جديد"
              : `${profile.reputationSummary.rating.toFixed(1)} / 5`
          }
          hint={`${profile.reputationSummary.reviewsCount} مراجعة`}
        />
        <StatCard
          icon={Timer}
          label="الإتاحة"
          value={profile.availability ?? "غير محددة"}
          hint="تحديث الإتاحة يساعد في المطابقة"
        />
        <StatCard
          icon={Github}
          label="GitHub"
          value={
            profile.githubStatus.connected
              ? (profile.githubStatus.username ?? "متصل")
              : "غير متصل"
          }
          hint="حالة الربط العامة فقط"
        />
        <StatCard
          icon={Trophy}
          label="الدور"
          value={profile.roleLabel}
          hint="مساهم في ShareK"
        />
      </aside>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary/15 p-2 text-primary">
          <Icon className="size-5" />
        </span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-4 text-xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
