import { useMutation } from "@tanstack/react-query";

import { reportDecisionFeedback } from "../../services/applications.service";

export function useReportDecisionFeedbackMutation() {
  return useMutation({ mutationFn: reportDecisionFeedback });
}
