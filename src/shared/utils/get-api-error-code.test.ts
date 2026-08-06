import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import {
  getApiErrorMetadataNumber,
  getApiErrorMetadataString,
} from "./get-api-error-code";

function apiError(metadata: unknown): AxiosError {
  const error = new AxiosError("failed");
  error.response = {
    data: { statusCode: 429, code: "PROPOSAL_RATE_LIMITED", metadata },
    status: 429,
    statusText: "Too Many Requests",
    headers: {},
    config: { headers: {} } as never,
  };
  return error;
}

describe("getApiErrorMetadataNumber", () => {
  it("reads a numeric value the string getter cannot", () => {
    const error = apiError({ dailyLimit: 10 });

    expect(getApiErrorMetadataNumber(error, "dailyLimit")).toBe(10);
    // The reason this helper exists: reaching for the string getter here
    // returns null and the detail is silently dropped.
    expect(getApiErrorMetadataString(error, "dailyLimit")).toBeNull();
  });

  it("rejects non-finite and non-numeric values", () => {
    expect(getApiErrorMetadataNumber(apiError({ n: Number.NaN }), "n")).toBeNull();
    expect(getApiErrorMetadataNumber(apiError({ n: Infinity }), "n")).toBeNull();
    expect(getApiErrorMetadataNumber(apiError({ n: "10" }), "n")).toBeNull();
  });

  it("returns null when metadata or the key is absent", () => {
    expect(getApiErrorMetadataNumber(apiError(undefined), "dailyLimit")).toBeNull();
    expect(getApiErrorMetadataNumber(apiError({}), "dailyLimit")).toBeNull();
    expect(getApiErrorMetadataNumber(new Error("plain"), "dailyLimit")).toBeNull();
  });
});
