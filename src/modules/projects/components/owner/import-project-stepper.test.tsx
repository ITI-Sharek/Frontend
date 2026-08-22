import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ImportProjectStepper } from "./import-project-stepper";

vi.mock("../../api/mutations/use-preview-github-repository-mutation", () => ({
  usePreviewGitHubRepositoryMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));
vi.mock("../../api/mutations/use-create-project-draft-mutation", () => ({
  useCreateProjectDraftMutation: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("../../api/mutations/use-publish-project-mutation", () => ({
  usePublishProjectMutation: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock("../../api/mutations/use-upload-project-hero-image-mutation", () => ({
  useUploadProjectHeroImageMutation: () => ({ mutateAsync: vi.fn() }),
}));

describe("ImportProjectStepper", () => {
  it("renders the repository step first with future steps locked", () => {
    const markup = renderToStaticMarkup(
      <ImportProjectStepper onDraftCreated={vi.fn()} />,
    );
    expect(markup).toContain(
      "e.g. facebook/react or https://github.com/owner/repo",
    );
    // The submit button is disabled (empty reference) and so are the three
    // future step pills before a repository is verified. Match the serialized
    // `disabled=""` attribute — the pills' Tailwind classes also contain the
    // literal text "disabled:opacity-40".
    const disabledButtons = markup.match(/<button[^>]* disabled=""/g) ?? [];
    expect(disabledButtons).toHaveLength(4);
  });

  it("lists suggested repositories for selection", () => {
    const markup = renderToStaticMarkup(
      <ImportProjectStepper
        onDraftCreated={vi.fn()}
        suggestedRepositories={[
          { fullName: "owner/repo", description: "A repo", isPrivate: false },
          { fullName: "owner/secret", description: null, isPrivate: true },
        ]}
      />,
    );
    expect(markup).toContain("owner/repo");
    expect(markup).toContain("owner/secret");
  });

  it("surfaces suggested-repository load errors", () => {
    const markup = renderToStaticMarkup(
      <ImportProjectStepper
        onDraftCreated={vi.fn()}
        suggestedRepositoriesError="Could not load repositories"
      />,
    );
    expect(markup).toContain("Could not load repositories");
  });
});
