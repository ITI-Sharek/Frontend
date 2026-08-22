import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { acquireLocalMedia, mapGetUserMediaError } from "./media-devices";

function fakeTrack(kind: "audio" | "video"): MediaStreamTrack {
  return {
    kind,
    stop: vi.fn(),
  } as unknown as MediaStreamTrack;
}

function fakeStream(kind: "audio" | "video"): MediaStream {
  const track = fakeTrack(kind);
  return {
    getAudioTracks: () => (kind === "audio" ? [track] : []),
    getVideoTracks: () => (kind === "video" ? [track] : []),
  } as unknown as MediaStream;
}

function notAllowedError(): DOMException {
  return new DOMException("Permission denied", "NotAllowedError");
}

describe("mapGetUserMediaError", () => {
  it("maps every known DOMException name to a user-facing reason", () => {
    expect(mapGetUserMediaError(new DOMException("x", "NotAllowedError"))).toBe("blocked");
    expect(mapGetUserMediaError(new DOMException("x", "SecurityError"))).toBe("blocked");
    expect(mapGetUserMediaError(new DOMException("x", "NotFoundError"))).toBe("not_found");
    expect(mapGetUserMediaError(new DOMException("x", "OverconstrainedError"))).toBe(
      "not_found",
    );
    expect(mapGetUserMediaError(new DOMException("x", "NotReadableError"))).toBe("in_use");
    expect(mapGetUserMediaError(new DOMException("x", "TrackStartError"))).toBe("in_use");
    expect(mapGetUserMediaError(new DOMException("x", "AbortError"))).toBe("unknown");
    expect(mapGetUserMediaError("not an error")).toBe("unknown");
  });
});

describe("acquireLocalMedia", () => {
  let getUserMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getUserMedia = vi.fn();
    vi.stubGlobal("navigator", {
      ...globalThis.navigator,
      mediaDevices: {
        ...globalThis.navigator.mediaDevices,
        getUserMedia,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("requests audio and video as two separate getUserMedia calls, never combined", async () => {
    getUserMedia.mockImplementation((constraints: MediaStreamConstraints) => {
      if (constraints.audio) return Promise.resolve(fakeStream("audio"));
      if (constraints.video) return Promise.resolve(fakeStream("video"));
      throw new Error("unexpected constraints");
    });

    const result = await acquireLocalMedia({ wantAudio: true, wantVideo: true });

    expect(getUserMedia).toHaveBeenCalledTimes(2);
    const calledConstraints = getUserMedia.mock.calls.map(
      (call) => call[0] as MediaStreamConstraints,
    );
    expect(calledConstraints.some((c) => "audio" in c && !("video" in c))).toBe(true);
    expect(calledConstraints.some((c) => "video" in c && !("audio" in c))).toBe(true);
    expect(result.audio.track?.kind).toBe("audio");
    expect(result.video.track?.kind).toBe("video");
  });

  it("still yields a usable audio-only result when the camera request is denied", async () => {
    getUserMedia.mockImplementation((constraints: MediaStreamConstraints) => {
      if (constraints.audio) return Promise.resolve(fakeStream("audio"));
      return Promise.reject(notAllowedError());
    });

    const result = await acquireLocalMedia({ wantAudio: true, wantVideo: true });

    expect(result.audio.track?.kind).toBe("audio");
    expect(result.audio.errorReason).toBeNull();
    expect(result.video.track).toBeNull();
    expect(result.video.errorReason).toBe("blocked");
  });

  it("does not call getUserMedia for a kind the caller does not want", async () => {
    getUserMedia.mockResolvedValue(fakeStream("audio"));

    const result = await acquireLocalMedia({ wantAudio: true, wantVideo: false });

    expect(getUserMedia).toHaveBeenCalledTimes(1);
    expect(result.video).toEqual({ stream: null, track: null, errorReason: null });
  });

  it("yields a listen-only result (no tracks, no throw) when both kinds are denied", async () => {
    getUserMedia.mockRejectedValue(notAllowedError());

    const result = await acquireLocalMedia({ wantAudio: true, wantVideo: true });

    expect(result.audio.track).toBeNull();
    expect(result.video.track).toBeNull();
    expect(result.audio.errorReason).toBe("blocked");
    expect(result.video.errorReason).toBe("blocked");
  });
});
