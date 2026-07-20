export interface AdminPublishedProjectOwnerDto {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  publishedProjectsCount: number;
  latestPublishedAt: string | null;
  latestProject: {
    id: string;
    title: string;
    githubRepoUrl: string;
  };
}
