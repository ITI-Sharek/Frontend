/**
 * Formats an instant the **server** supplied, and nothing else.
 *
 * DEC-034 allows timing copy only when it comes from a reliable backend value.
 * So this presents a server timestamp in the reader's locale; it never derives
 * one. There is deliberately no "in 3 hours", no "tomorrow", and no
 * `Date.now()` anywhere in this module: a relative phrase computed on the
 * client would drift from the moment the backend will actually act on, and a
 * contributor reading "resets in an hour" that is wrong is worse than reading
 * an exact time they have to convert themselves.
 *
 * Returns null for a value the backend did not send or that does not parse, so
 * a caller renders nothing rather than "Invalid Date".
 */
export function formatServerInstant(
  value: string | null | undefined,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: "long" },
): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat(locale, options).format(parsed);
}

/**
 * A daily allowance resets at a specific hour, so the time matters as much as
 * the date. A monthly one does not, which is why the two have separate
 * presentations rather than one compromise format.
 */
export function formatServerResetInstant(
  value: string | null | undefined,
  locale: string,
): string | null {
  return formatServerInstant(value, locale, {
    dateStyle: "long",
    timeStyle: "short",
  });
}
