import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authKeys } from "../query-keys";
import {
  changePassword,
  exportAccountData,
  forgotPassword,
  resetPassword,
  updatePersonalDetails,
  updatePhone,
  updatePrivacy,
  updateUsername,
  uploadIdentityDocument,
} from "../../services/auth.service";

function useCurrentUserMutation<TInput>(mutationFn: (input: TInput) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: (user) => {
    if (user && typeof user === "object" && "id" in user) {
      queryClient.setQueryData(authKeys.currentUser(), user);
    }
  }});
}

export const useForgotPasswordMutation = () => useMutation({ mutationFn: forgotPassword });
export const useResetPasswordMutation = () => useMutation({ mutationFn: resetPassword });
export const useChangePasswordMutation = () => useCurrentUserMutation(changePassword);
export const useUpdateUsernameMutation = () => useCurrentUserMutation(updateUsername);
export const useUpdatePersonalDetailsMutation = () => useCurrentUserMutation(updatePersonalDetails);
export const useUpdatePhoneMutation = () => useCurrentUserMutation(updatePhone);
export const useUpdatePrivacyMutation = () => useCurrentUserMutation(updatePrivacy);
export const useUploadIdentityDocumentMutation = () => useCurrentUserMutation(uploadIdentityDocument);
export const useExportAccountDataMutation = () => useMutation({ mutationFn: exportAccountData });
