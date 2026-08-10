let notificationAudioContext: AudioContext | null = null;

/**
 * Plays a short, unobtrusive in-app notification cue.
 *
 * Web Audio may be unavailable or blocked by the browser autoplay policy, so
 * notification sound is deliberately best-effort and never affects delivery.
 */
export function playNotificationSound(): void {
  if (typeof window === "undefined") return;

  const audioContextConstructor = (
    window as { AudioContext?: typeof AudioContext }
  ).AudioContext;
  if (!audioContextConstructor) return;

  try {
    const context =
      notificationAudioContext ?? new audioContextConstructor();
    notificationAudioContext = context;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.12);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.15);

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }
  } catch {
    // Sound is progressive enhancement; a blocked or unsupported audio
    // context must never turn a committed notification into a client error.
  }
}
