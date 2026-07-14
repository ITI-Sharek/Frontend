import { beforeEach, describe, expect, it, vi } from "vitest";

import { axiosInstance } from "@/lib/axios/axios-instance";

import {
  checkUsernameAvailability,
  isValidUsernameFormat,
} from "./username-availability.service";

vi.mock("@/lib/axios/axios-instance", () => ({
  axiosInstance: {
    get: vi.fn(),
  },
}));

const mockedAxios = vi.mocked(axiosInstance);

describe("isValidUsernameFormat", () => {
  it("accepts well-formed usernames", () => {
    expect(isValidUsernameFormat("sara")).toBe(true);
    expect(isValidUsernameFormat("sara-dev")).toBe(true);
    expect(isValidUsernameFormat("sara_dev_2")).toBe(true);
    expect(isValidUsernameFormat("a23")).toBe(true);
  });

  it("rejects usernames shorter than 3 characters", () => {
    expect(isValidUsernameFormat("ab")).toBe(false);
    expect(isValidUsernameFormat("")).toBe(false);
  });

  it("rejects usernames longer than 30 characters", () => {
    expect(isValidUsernameFormat("a".repeat(31))).toBe(false);
    expect(isValidUsernameFormat("a".repeat(30))).toBe(true);
  });

  it("rejects leading or trailing punctuation", () => {
    expect(isValidUsernameFormat("-sara")).toBe(false);
    expect(isValidUsernameFormat("sara-")).toBe(false);
    expect(isValidUsernameFormat("_sara")).toBe(false);
    expect(isValidUsernameFormat("sara_")).toBe(false);
  });

  it("rejects disallowed characters", () => {
    expect(isValidUsernameFormat("sara.dev")).toBe(false);
    expect(isValidUsernameFormat("sara dev")).toBe(false);
    expect(isValidUsernameFormat("سارة")).toBe(false);
    expect(isValidUsernameFormat("Sara")).toBe(false);
  });
});

describe("checkUsernameAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads availability from the backend for a well-formed username", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { available: true, suggestion: null, reason: null },
    });

    const result = await checkUsernameAvailability("brand-new-handle");

    expect(result).toEqual({ available: true, suggestion: null, reason: null });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "/auth/username-availability",
      {
        params: {
          username: "brand-new-handle",
        },
      },
    );
  });

  it("reports invalid_format locally without a backend request", async () => {
    const result = await checkUsernameAvailability("ab");

    expect(result.available).toBe(false);
    expect(result.reason).toBe("invalid_format");
    expect(result.suggestion).toBeNull();
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("passes through taken usernames with a suggested alternative", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        available: false,
        suggestion: "sara-dev-1",
        reason: "taken",
      },
    });

    const result = await checkUsernameAvailability("sara-dev");

    expect(result.available).toBe(false);
    expect(result.reason).toBe("taken");
    expect(result.suggestion).toBe("sara-dev-1");
  });

  it("passes through reserved username responses", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { available: false, suggestion: null, reason: "reserved" },
    });

    const result = await checkUsernameAvailability("admin");

    expect(result.available).toBe(false);
    expect(result.reason).toBe("reserved");
  });
});
