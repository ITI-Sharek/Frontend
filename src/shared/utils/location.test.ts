import { describe, expect, it } from "vitest";
import {
  getCityOptions,
  getCountryOptions,
  getStateOptions,
  normalizeCity,
  normalizeCountry,
  normalizeState,
} from "./location";

describe("location utilities", () => {
  describe("normalizeCountry", () => {
    it("normalizes ISO country codes", () => {
      expect(normalizeCountry("EG")).toBe("EG");
      expect(normalizeCountry("AE")).toBe("AE");
      expect(normalizeCountry("SA")).toBe("SA");
    });

    it("normalizes legacy country slugs and names", () => {
      expect(normalizeCountry("egypt")).toBe("EG");
      expect(normalizeCountry("uae")).toBe("AE");
      expect(normalizeCountry("emirates")).toBe("AE");
      expect(normalizeCountry("saudi")).toBe("SA");
      expect(normalizeCountry("United Arab Emirates")).toBe("AE");
    });

    it("defaults to EG for empty or missing input", () => {
      expect(normalizeCountry(null)).toBe("EG");
      expect(normalizeCountry(undefined)).toBe("EG");
      expect(normalizeCountry("")).toBe("EG");
    });
  });

  describe("normalizeState", () => {
    it("normalizes states for Egypt", () => {
      expect(normalizeState("EG", "C")).toBe("C");
      expect(normalizeState("EG", "cairo")).toBe("C");
      expect(normalizeState("EG", "alexandria")).toBe("ALX");
    });

    it("normalizes states for UAE", () => {
      expect(normalizeState("AE", "DU")).toBe("DU");
      expect(normalizeState("AE", "dubai")).toBe("DU");
      expect(normalizeState("AE", "abu dhabi")).toBe("AZ");
      expect(normalizeState("AE", "sharjah")).toBe("SH");
    });

    it("returns the first state if region is not provided", () => {
      const uaeStates = getStateOptions("AE");
      expect(normalizeState("AE", null)).toBe(uaeStates[0].value);
    });
  });

  describe("getCountryOptions", () => {
    it("returns countries with Egypt, UAE, Saudi Arabia in priority", () => {
      const options = getCountryOptions(true);
      expect(options.length).toBeGreaterThan(50);
      expect(options[0].value).toBe("EG");
      expect(options[1].value).toBe("SA");
      expect(options[2].value).toBe("AE");
      expect(options.find((o) => o.value === "AE")?.label).toContain("الإمارات");
    });

    it("formats labels in English when isArabic is false", () => {
      const options = getCountryOptions(false);
      const uae = options.find((o) => o.value === "AE");
      expect(uae?.label).toContain("United Arab Emirates");
    });
  });

  describe("getStateOptions", () => {
    it("returns all 7 emirates for UAE", () => {
      const states = getStateOptions("AE", true);
      expect(states.length).toBe(7);
      const codes = states.map((s) => s.value);
      expect(codes).toContain("DU");
      expect(codes).toContain("AZ");
      expect(codes).toContain("SH");
      expect(codes).toContain("AJ");
      expect(codes).toContain("RK");
      expect(codes).toContain("FU");
      expect(codes).toContain("UQ");

      const dubai = states.find((s) => s.value === "DU");
      expect(dubai?.label).toContain("دبي");
    });

    it("returns Egyptian governorates for EG", () => {
      const states = getStateOptions("EG", true);
      expect(states.length).toBe(27);
      const cairo = states.find((s) => s.value === "C");
      expect(cairo?.label).toContain("القاهرة");
    });
  });

  describe("getCityOptions & normalizeCity", () => {
    it("returns cities for Dubai", () => {
      const cities = getCityOptions("AE", "DU", true);
      expect(cities.length).toBeGreaterThan(0);
      expect(cities.some((c) => c.value === "Dubai")).toBe(true);
    });

    it("returns cities for Cairo", () => {
      const cities = getCityOptions("EG", "C", true);
      expect(cities.length).toBeGreaterThan(0);
      expect(cities.some((c) => c.value === "Cairo")).toBe(true);
    });

    it("normalizes city properly", () => {
      expect(normalizeCity("AE", "DU", "dubai")).toBe("Dubai");
      expect(normalizeCity("EG", "C", "cairo")).toBe("Cairo");
    });
  });
});
