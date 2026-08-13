import { describe, expect, it } from "vitest";

import i18n from "@/lib/i18n";
import type { MaterialVersionDto } from "../types/material.types";
import {
  canDownloadVersion,
  formatBytes,
  formatMimeType,
  getDownloadBlockedReason,
  getMaterialStateMeta,
  getMaterialVersionState,
} from "./material-state";

// Tests pin the language to Arabic in vitest.setup.ts, so the shared i18n
// instance resolves real strings — the same strings the components render.
const t = i18n.getFixedT("ar");

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
  scannedAt: "2026-08-07T09:01:00.000Z",
  purgedAt: null,
  ...overrides,
});

const live = { deletedAt: null };
const deleted = { deletedAt: "2026-08-07T10:00:00.000Z" };

describe("getMaterialVersionState", () => {
  it.each([
    ["READY" as const, "READY"],
    ["REJECTED" as const, "REJECTED"],
    ["SCANNING" as const, "SCANNING"],
    ["QUARANTINED" as const, "QUARANTINED"],
  ])("maps a %s scan status to %s", (scanStatus, expected) => {
    expect(getMaterialVersionState(live, version({ scanStatus }))).toBe(expected);
  });

  it("separates an abandoned scan from a rejection", () => {
    // Both are undownloadable, but one means the file was found to be malware
    // and the other means we never managed to check it. Reporting the first
    // when the second is true is an accusation.
    const state = getMaterialVersionState(
      live,
      version({
        scanStatus: "QUARANTINED",
        scanErrorCode: "MATERIAL_SCAN_ABANDONED",
      }),
    );

    expect(state).toBe("SCAN_UNAVAILABLE");
    expect(state).not.toBe("REJECTED");
    expect(getMaterialStateMeta(t, state).description).toContain(
      "هذا لا يعني أن الملف ضار",
    );
  });

  it("lets deletion outrank a READY scan status", () => {
    // A deleted Material's newest version still reads READY from the server.
    // Presenting that would offer a file whose bytes are already gone.
    expect(getMaterialVersionState(deleted, version())).toBe("PURGE_PENDING");
  });

  it("distinguishes purge-pending from purged", () => {
    expect(getMaterialVersionState(deleted, version())).toBe("PURGE_PENDING");
    expect(
      getMaterialVersionState(deleted, version({ purgedAt: "2026-08-07T10:01:00.000Z" })),
    ).toBe("DELETED");
  });
});

describe("canDownloadVersion", () => {
  it("allows only a READY version", () => {
    expect(canDownloadVersion(live, version())).toBe(true);
  });

  it.each([
    ["QUARANTINED" as const, null],
    ["QUARANTINED" as const, "MATERIAL_SCAN_ABANDONED"],
    ["SCANNING" as const, null],
    ["REJECTED" as const, null],
  ])("refuses a %s version (%s)", (scanStatus, scanErrorCode) => {
    // "Anything but rejected" would offer quarantined files, and quarantined
    // covers both a pending scan and one abandoned after repeated failure.
    expect(canDownloadVersion(live, version({ scanStatus, scanErrorCode }))).toBe(
      false,
    );
  });

  it("refuses a deleted Material even while its version reads READY", () => {
    expect(canDownloadVersion(deleted, version())).toBe(false);
  });

  it("refuses a purged version", () => {
    expect(
      canDownloadVersion(live, version({ purgedAt: "2026-08-07T10:00:00.000Z" })),
    ).toBe(false);
  });
});

describe("getDownloadBlockedReason", () => {
  it("gives no reason when the download is available", () => {
    expect(getDownloadBlockedReason(t, "READY")).toBeNull();
  });

  it("explains every blocked state rather than leaving a bare disabled control", () => {
    for (const state of [
      "QUARANTINED",
      "SCANNING",
      "SCAN_UNAVAILABLE",
      "REJECTED",
      "PURGE_PENDING",
      "DELETED",
    ] as const) {
      expect(getDownloadBlockedReason(t, state)).toBeTruthy();
    }
  });
});

describe("state presentation", () => {
  it("gives every state a label and a description, so colour is never the signal", () => {
    for (const state of [
      "UPLOADING",
      "QUARANTINED",
      "SCAN_UNAVAILABLE",
      "SCANNING",
      "READY",
      "REJECTED",
      "PURGE_PENDING",
      "DELETED",
    ] as const) {
      const meta = getMaterialStateMeta(t, state);
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
      expect(meta.icon).toBeTruthy();
    }
  });
});

describe("formatting", () => {
  it.each([
    [512, "بايت"],
    [4096, "كيلوبايت"],
    [26_214_400, "ميجابايت"],
  ])("renders %i bytes in a readable unit", (bytes, unit) => {
    expect(formatBytes(t, bytes)).toContain(unit);
  });

  it("shows an unrecognised format as itself rather than dropping it", () => {
    // Raising the server allowlist must not silently hide a format from the
    // upload form.
    expect(formatMimeType(t, "application/vnd.oasis.opendocument.text")).toBe(
      "application/vnd.oasis.opendocument.text",
    );
    expect(formatMimeType(t, "application/pdf")).toBe("PDF");
  });
});
