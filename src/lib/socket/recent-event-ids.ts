const DEFAULT_RECENT_EVENT_ID_LIMIT = 1_000;

/**
 * Bounded, tab-local deduplication for the shared at-least-once realtime
 * channel. Durable HTTP state and aggregate versions remain authoritative.
 */
export class RecentEventIds {
  private readonly ids = new Set<string>();

  constructor(
    private readonly limit = DEFAULT_RECENT_EVENT_ID_LIMIT,
  ) {}

  has(eventId: string): boolean {
    return this.ids.has(eventId);
  }

  add(eventId: string): void {
    if (this.ids.has(eventId)) return;
    this.ids.add(eventId);
    while (this.ids.size > this.limit) {
      const oldest = this.ids.values().next().value;
      if (oldest === undefined) break;
      this.ids.delete(oldest);
    }
  }

  hasOrAdd(eventId: string): boolean {
    if (this.has(eventId)) return true;
    this.add(eventId);
    return false;
  }

  get size(): number {
    return this.ids.size;
  }
}
