import { describe, expect, it } from "vitest";

import {
  checkUsernameAvailability,
  isValidUsernameFormat,
} from "./username-availability.service";

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
  });
});

describe("checkUsernameAvailability (mock)", () => {
  it("reports available for an unused, well-formed username", async () => {
    const result = await checkUsernameAvailability("brand-new-handle");
    expect(result).toEqual({ available: true, suggestion: null, reason: null });
  });

  it("reports invalid_format without a suggestion", async () => {
    const result = await checkUsernameAvailability("ab");
    expect(result.available).toBe(false);
    expect(result.reason).toBe("invalid_format");
    expect(result.suggestion).toBeNull();
  });

  it("blocks reserved words without a suggestion", async () => {
    const result = await checkUsernameAvailability("admin");
    expect(result.available).toBe(false);
    expect(result.reason).toBe("reserved");
    expect(result.suggestion).toBeNull();
  });

  it("is case-insensitive when matching reserved words", async () => {
    const result = await checkUsernameAvailability("Admin");
    expect(result.available).toBe(false);
    expect(result.reason).toBe("reserved");
  });

  it("reports taken usernames with a suggested alternative", async () => {
    const result = await checkUsernameAvailability("sara-dev");
    expect(result.available).toBe(false);
    expect(result.reason).toBe("taken");
    expect(result.suggestion).toBe("sara-dev-1");
  });

  it("is case-insensitive when matching taken usernames", async () => {
    const result = await checkUsernameAvailability("Sara-Dev");
    expect(result.available).toBe(false);
    expect(result.reason).toBe("taken");
  });
});
