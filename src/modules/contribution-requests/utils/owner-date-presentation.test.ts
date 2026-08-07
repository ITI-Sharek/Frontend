import { describe, expect, it } from "vitest";

import {
  formatContributionDate,
  formatContributionDateTime,
} from "./contributor-presentation";

/**
 * Owner pages were printing `applicationsCloseTime` and `targetCompletionDate`
 * straight from the API, so an owner saw `2030-03-10T12:00:00.000Z` where a
 * contributor saw a formatted date. Worse, an owner who entered 12:00 read back
 * an ISO string in UTC and could reasonably conclude the deadline had moved.
 *
 * These pin the formatters the owner pages now share with the contributor ones.
 */
describe("owner-facing date presentation", () => {
  it("never renders a raw ISO string", () => {
    const formatted = formatContributionDateTime("2030-03-10T12:00:00.000Z");

    expect(formatted).not.toContain("T");
    expect(formatted).not.toContain("Z");
    expect(formatted).not.toContain("2030-03-10");
  });

  it("renders in the reader's own timezone rather than UTC", () => {
    const value = "2030-06-15T09:00:00.000Z";
    const expectedHour = new Date(value).getHours();

    // Whatever the machine's zone, the rendered hour is the local one — which
    // is the hour the owner typed into the form.
    const formatted = formatContributionDateTime(value);
    const localised = new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

    expect(formatted).toBe(localised);
    expect(new Date(value).getUTCHours() === expectedHour).toBe(
      new Date().getTimezoneOffset() === 0,
    );
  });

  it("says so plainly when there is no date, rather than printing a dash", () => {
    expect(formatContributionDateTime(null)).toBe("غير محدد");
    expect(formatContributionDate(null)).toBe("غير محدد");
  });

  it("formats a date-only value without inventing a time", () => {
    const formatted = formatContributionDate("2030-03-20");

    expect(formatted).not.toContain("T");
    expect(formatted).toContain("٢٠٣٠");
  });
});
