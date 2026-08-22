interface ByteUnit {
  unit: "gigabyte" | "megabyte" | "kilobyte" | "byte";
  bytesPerUnit: number;
}

const UNIT_THRESHOLDS: ByteUnit[] = [
  { unit: "gigabyte", bytesPerUnit: 1024 ** 3 },
  { unit: "megabyte", bytesPerUnit: 1024 ** 2 },
  { unit: "kilobyte", bytesPerUnit: 1024 },
  { unit: "byte", bytesPerUnit: 1 },
];

/**
 * Locale-aware byte size via `Intl.NumberFormat`'s unit formatting, rather
 * than a hardcoded "KB"/"MB" string glued onto a number — the unit label
 * itself is translated by the platform for the caller's `i18n.language`.
 */
export function formatAttachmentByteSize(locale: string, bytes: number): string {
  const magnitude = Math.abs(bytes);
  const { unit, bytesPerUnit } =
    UNIT_THRESHOLDS.find((candidate) => magnitude >= candidate.bytesPerUnit) ??
    UNIT_THRESHOLDS[UNIT_THRESHOLDS.length - 1];
  const value = bytes / bytesPerUnit;

  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: unit === "byte" ? 0 : 1,
  }).format(value);
}
