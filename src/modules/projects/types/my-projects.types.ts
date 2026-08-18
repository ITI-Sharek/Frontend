import type { ProjectStatus } from "./project.types";

/**
 * Owner portfolio list contract: `GET /projects/me?cursor=<opaque>&limit=20`
 * (`server/specs/003-github-project-publication/contracts/http-api.md` §3).
 */

export type MyProjectStatus = ProjectStatus;

export interface MyProjectSummaryDto {
  id: string;
  title: string;
  slug: string;
  status: MyProjectStatus;
  revision: number;
  openRequestsCount: number;
  /**
   * Applications across this project's Contribution Requests currently in
   * `pending_owner_review` — i.e. awaiting the owner's decision. Not an AI
   * eligibility count: DEC-030/036 removed eligibility as an Application
   * gate, so every otherwise-valid Application lands directly in this state
   * (backend issue #47).
   */
  pendingApplicationsCount: number;
  lastActivityLabel: string;
}

export interface OwnerQuotaDto {
  used: number;
  monthlyLimit: number;
}

export interface CursorPageInfoDto {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface MyProjectsFilters {
  status?: MyProjectStatus | "all";
  q?: string;
}

export interface MyProjectsListParams {
  cursor?: string;
  limit?: number;
  status?: MyProjectStatus;
  q?: string;
}

export interface MyProjectsListResponseDto {
  projects: MyProjectSummaryDto[];
  quota: OwnerQuotaDto;
  pageInfo: CursorPageInfoDto;
}
