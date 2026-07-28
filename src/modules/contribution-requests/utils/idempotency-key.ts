export type IdempotencyKeyGenerator = () => string;

export class ContributionRequestIdempotencyKeyStore {
  private fingerprint: string | null = null;
  private key: string | null = null;

  constructor(private readonly generate: IdempotencyKeyGenerator = generateKey) {}

  getFor(command: unknown): string {
    const fingerprint = stableSerialize(command);
    if (this.key && this.fingerprint === fingerprint) return this.key;
    this.fingerprint = fingerprint;
    this.key = this.generate();
    return this.key;
  }

  clear(): void {
    this.fingerprint = null;
    this.key = null;
  }
}

function generateKey(): string {
  return `cr-${globalThis.crypto.randomUUID()}`;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
