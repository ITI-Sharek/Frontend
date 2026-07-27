import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GitHubAppCandidatePicker } from "./github-app-candidate-picker";
import {
  GITHUB_APP_DISCONNECT_COPY,
  GitHubAppDisconnectConfirm,
} from "./github-app-disconnect-confirm";
import { GitHubAppInstallationList } from "./github-app-installation-list";
import { GitHubAppRepositoryPicker } from "./github-app-repository-picker";
import type {
  GitHubAppInstallationLinkDto,
  GitHubAppRepositoryPageDto,
} from "../types/github-app.types";

const installation: GitHubAppInstallationLinkDto = {
  installationLinkId: "link-1",
  providerInstallationId: "12345678",
  accountLogin: "sharek-org",
  accountType: "organization",
  status: "active",
  repositorySelection: "selected",
  installedAt: "2026-07-20T10:00:00.000Z",
  verifiedAt: "2026-07-26T10:00:00.000Z",
  manageUrl: "https://github.com/settings/installations/12345678",
};

const repositoryPage: GitHubAppRepositoryPageDto = {
  items: [
    {
      repositoryId: "123456789",
      fullName: "sharek-org/private-service",
      visibility: "private",
      defaultBranch: "main",
    },
    {
      repositoryId: "987654321",
      fullName: "sharek-org/public-ui",
      visibility: "public",
      defaultBranch: "main",
    },
  ],
  page: 1,
  perPage: 30,
  hasNextPage: true,
  verifiedAt: "2026-07-27T10:00:00.000Z",
};

const noop = () => {};

describe("installation list", () => {
  it("renders multiple links with per-status actions", () => {
    const html = renderToStaticMarkup(
      <GitHubAppInstallationList
        installations={[
          installation,
          {
            ...installation,
            installationLinkId: "link-2",
            accountLogin: "sara-dev",
            accountType: "user",
            status: "reauthorization_required",
          },
        ]}
        selectedInstallationLinkId="link-1"
        onSelect={noop}
        onReauthorize={noop}
        onDisconnect={noop}
      />,
    );

    expect(html).toContain("sharek-org");
    expect(html).toContain("sara-dev");
    expect(html).toContain("إعادة التفويض");
    expect(html).toContain("فصل محلي");
    expect(html).toContain("https://github.com/settings/installations/12345678");
  });

  it("renders each installation status", () => {
    for (const status of [
      "active",
      "disconnected",
      "reauthorization_required",
      "revoked",
    ] as const) {
      const html = renderToStaticMarkup(
        <GitHubAppInstallationList
          installations={[{ ...installation, status }]}
          selectedInstallationLinkId={null}
          onSelect={noop}
          onReauthorize={noop}
          onDisconnect={noop}
        />,
      );
      expect(html.length).toBeGreaterThan(0);
      expect(html).toContain("sharek-org");
    }
  });
});

describe("candidate picker", () => {
  it("offers a restart action when there are no candidates", () => {
    const html = renderToStaticMarkup(
      <GitHubAppCandidatePicker
        candidates={[]}
        onSelect={noop}
        onRestart={noop}
      />,
    );
    expect(html).toContain("إعادة بدء الربط");
    expect(html).toContain("لم نجد أي تثبيت متاح");
  });

  it("lists every candidate account when there is more than one", () => {
    const html = renderToStaticMarkup(
      <GitHubAppCandidatePicker
        candidates={[
          {
            providerInstallationId: "1",
            accountLogin: "sharek-org",
            accountType: "organization",
          },
          {
            providerInstallationId: "2",
            accountLogin: "sara-dev",
            accountType: "user",
          },
        ]}
        onSelect={noop}
        onRestart={noop}
      />,
    );
    expect(html).toContain("sharek-org");
    expect(html).toContain("sara-dev");
    expect(html).toContain("اختر الحساب أو المنظمة");
  });
});

describe("repository picker", () => {
  it("shows visibility and pagination controls on the owner surface", () => {
    const html = renderToStaticMarkup(
      <GitHubAppRepositoryPicker
        page={repositoryPage}
        isLoading={false}
        selectedRepositoryIds={["123456789"]}
        maxSelected={10}
        onToggle={noop}
        currentPage={1}
        onPageChange={noop}
      />,
    );

    expect(html).toContain("sharek-org/private-service");
    expect(html).toContain("خاص");
    expect(html).toContain("عام");
    expect(html).toContain("التالي");
    expect(html).toContain("السابق");
    expect(html).toContain("1 / 10");
  });

  it("warns once the ten-repository limit is reached", () => {
    const html = renderToStaticMarkup(
      <GitHubAppRepositoryPicker
        page={repositoryPage}
        isLoading={false}
        selectedRepositoryIds={Array.from({ length: 10 }, (_, i) => String(i))}
        maxSelected={10}
        onToggle={noop}
        currentPage={2}
        onPageChange={noop}
      />,
    );
    expect(html).toContain("وصلت إلى الحد الأقصى");
  });
});

describe("disconnect confirmation", () => {
  it("distinguishes local disconnect from uninstall and social login", () => {
    const onConfirm = vi.fn();
    const html = renderToStaticMarkup(
      <GitHubAppDisconnectConfirm
        installation={installation}
        onConfirm={onConfirm}
        onCancel={noop}
      />,
    );

    expect(html).toContain("ارتباط Share-k المحلي");
    expect(html).toContain("لا يقوم بإلغاء تثبيت تطبيق GitHub");
    expect(html).toContain("ولا بفصل تسجيل الدخول عبر GitHub");
    // The manage/uninstall action stays a separate, explicit GitHub link.
    expect(html).toContain("https://github.com/settings/installations/12345678");
    expect(GITHUB_APP_DISCONNECT_COPY).toContain(
      "لا يقوم بإلغاء تثبيت تطبيق GitHub",
    );
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
