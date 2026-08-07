import { describe, expect, it } from "vitest";

import type { MaterialDto, MaterialVersionDto } from "../../types/material.types";
import { materialsRefetchInterval } from "./use-material-queries";

const version = (
  overrides: Partial<MaterialVersionDto> = {},
): MaterialVersionDto => ({
  version: 1,
  scanStatus: "READY",
  scanErrorCode: null,
  byteSize: 1024,
  mimeType: "application/pdf",
  originalFilename: "brief.pdf",
  contentHash: "a".repeat(64),
  uploadedAt: "2026-08-07T09:00:00.000Z",
  scannedAt: null,
  purgedAt: null,
  ...overrides,
});

const material = (versions: MaterialVersionDto[]): MaterialDto =>
  ({ versions }) as MaterialDto;

describe("materialsRefetchInterval", () => {
  it("polls while a version is waiting on the scan worker", () => {
    // Scan states resolve on a worker with no push channel, so without this a
    // quarantined version sits there until the user reloads — looking stuck
    // when it is merely unwatched.
    expect(
      materialsRefetchInterval([
        material([version({ scanStatus: "QUARANTINED" })]),
      ]),
    ).toBe(4000);
    expect(
      materialsRefetchInterval([material([version({ scanStatus: "SCANNING" })])]),
    ).toBe(4000);
  });

  it("stops once everything has settled", () => {
    expect(
      materialsRefetchInterval([material([version({ scanStatus: "READY" })])]),
    ).toBe(false);
    expect(
      materialsRefetchInterval([material([version({ scanStatus: "REJECTED" })])]),
    ).toBe(false);
  });

  it("stops for an abandoned scan, which will never move on its own", () => {
    // Polling it can only ever return the same row.
    expect(
      materialsRefetchInterval([
        material([
          version({
            scanStatus: "QUARANTINED",
            scanErrorCode: "MATERIAL_SCAN_ABANDONED",
          }),
        ]),
      ]),
    ).toBe(false);
  });

  it("ignores a purged version that never finished scanning", () => {
    expect(
      materialsRefetchInterval([
        material([
          version({
            scanStatus: "QUARANTINED",
            purgedAt: "2026-08-07T10:00:00.000Z",
          }),
        ]),
      ]),
    ).toBe(false);
  });

  it("keeps polling when only one Material of several is pending", () => {
    expect(
      materialsRefetchInterval([
        material([version({ scanStatus: "READY" })]),
        material([version({ scanStatus: "SCANNING" })]),
      ]),
    ).toBe(4000);
  });

  it("does not poll an empty or absent list", () => {
    expect(materialsRefetchInterval([])).toBe(false);
    expect(materialsRefetchInterval(undefined)).toBe(false);
  });
});
