import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

import { WorkspaceIllustration } from "./illustrations/workspace-illustration";

function getWorkspacePoints(t: TFunction) {
  return [
    {
      term: t("landing.workspaceTaskTerm"),
      description: t("landing.workspaceTaskDescription"),
    },
    {
      term: t("landing.workspaceDiscussionTerm"),
      description: t("landing.workspaceDiscussionDescription"),
    },
    {
      term: t("landing.workspaceExplicitStatesTerm"),
      description: t("landing.workspaceExplicitStatesDescription"),
    },
  ];
}

export function CollaborationSpaceSection() {
  const { t } = useTranslation();
  const workspacePoints = getWorkspacePoints(t);

  return (
    <section id="workspace" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl">
              {t("landing.workspaceHeading")}
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-8 text-muted-foreground">
              {t("landing.workspaceDescription")}
            </p>
            <dl className="mt-8 border-t border-border">
              {workspacePoints.map((point) => (
                <div
                  key={point.term}
                  className="grid gap-1.5 border-b border-border py-5"
                >
                  <dt className="font-semibold text-foreground">
                    {point.term}
                  </dt>
                  <dd className="max-w-[62ch] text-sm leading-7 text-muted-foreground">
                    {point.description}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <WorkspaceIllustration className="h-auto w-full max-w-xl justify-self-center lg:justify-self-start" />
        </div>
      </div>
    </section>
  );
}
