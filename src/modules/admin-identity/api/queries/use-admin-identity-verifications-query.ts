import { useQuery } from "@tanstack/react-query";
import { listAdminIdentityVerifications } from "../../services/admin-identity.service";
import type { ListIdentityVerificationsParams } from "../../types/admin-identity.types";

export const adminIdentityKeys = {
  all: ["admin", "identity-verifications"] as const,
  list: (params: ListIdentityVerificationsParams) =>
    [...adminIdentityKeys.all, "list", params] as const,
};

export function useAdminIdentityVerificationsQuery(
  params: ListIdentityVerificationsParams = {},
) {
  return useQuery({
    queryKey: adminIdentityKeys.list(params),
    queryFn: () => listAdminIdentityVerifications(params),
    staleTime: 10_000,
  });
}
