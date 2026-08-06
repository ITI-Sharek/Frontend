import { describe, expect, it } from "vitest";

import type { AdvisoryFitAssessmentDto } from "../../types/advisory-fit.types";

import {
  ADVISORY_FIT_POLL_INTERVAL_MS,
  advisoryFitRefetchInterval,
} from "./use-advisory-fit-query";

const withStatus = (
  requestStatus: AdvisoryFitAssessmentDto["requestStatus"],
): AdvisoryFitAssessmentDto => ({ requestStatus }) as AdvisoryFitAssessmentDto;

// The panel renders for every Application in the owner's list, not behind a
// disclosure, so polling a status the backend will never resolve on its own
// costs one request per Application per interval indefinitely. REQUESTED is the
// only status that resolves without the owner acting.
describe("advisoryFitRefetchInterval", () => {
  it("polls while the backend is still producing a result", () => {
    expect(advisoryFitRefetchInterval(withStatus("REQUESTED"))).toBe(
      ADVISORY_FIT_POLL_INTERVAL_MS,
    );
  });

  it.each([
    "NOT_REQUESTED",
    "COMPLETED",
    "NOT_STARTED_SYSTEM_LIMIT",
    "NOT_STARTED_NO_ASSESSABLE_EVIDENCE",
    "CANCELLED_NOT_NEEDED",
    "UNAVAILABLE",
  ] as const)("does not poll on %s", (status) => {
    expect(advisoryFitRefetchInterval(withStatus(status))).toBe(false);
  });

  it("does not poll before the first response arrives", () => {
    expect(advisoryFitRefetchInterval(undefined)).toBe(false);
  });
});
