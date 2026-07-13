import { createFileRoute } from "@tanstack/react-router";

import { ImportProjectStepper } from "@/modules/projects";

export const Route = createFileRoute("/_appLayout/my-projects/new")({
  head: () => ({ meta: [{ title: "استيراد مشروع | Sharek" }] }),
  component: ImportProjectPage,
});

function ImportProjectPage() {
  return <ImportProjectStepper myProjectsHref="/my-projects" />;
}
