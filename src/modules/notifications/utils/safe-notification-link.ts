export function getSafeNotificationLink(
  deepLink: string | null,
  origin: string,
): string | null {
  if (
    typeof deepLink !== "string" ||
    !deepLink.startsWith("/") ||
    deepLink.startsWith("//")
  ) {
    return null;
  }

  try {
    const base = new URL(origin);
    const resolved = new URL(deepLink, base);
    if (
      resolved.origin !== base.origin ||
      resolved.username !== "" ||
      resolved.password !== ""
    ) {
      return null;
    }
  } catch {
    return null;
  }

  return deepLink;
}
