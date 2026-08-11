// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { accessTokenStore, storageService } from "./storage.service";

describe("access token store", () => {
  beforeEach(() => {
    storageService.clearTokens();
    vi.restoreAllMocks();
  });

  it("notifies same-tab subscribers when the token is set, replaced, or cleared", () => {
    const listener = vi.fn();
    const unsubscribe = accessTokenStore.subscribe(listener);

    storageService.setAccessToken("token-a");
    storageService.setAccessToken("token-b");
    storageService.clearTokens();

    expect(listener).toHaveBeenCalledTimes(3);
    expect(accessTokenStore.getSnapshot()).toBeNull();
    unsubscribe();
  });

  it("updates subscribers from cross-tab storage events", () => {
    const listener = vi.fn();
    const unsubscribe = accessTokenStore.subscribe(listener);

    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "sharek_access_token",
        newValue: "other-tab-token",
        storageArea: localStorage,
      }),
    );

    expect(listener).toHaveBeenCalledTimes(1);
    expect(accessTokenStore.getSnapshot()).toBe("other-tab-token");
    unsubscribe();
  });

  it("exposes stable immutable snapshots and a null SSR snapshot", () => {
    const firstSnapshot = accessTokenStore.getSnapshot();
    storageService.setAccessToken("immutable-token");
    const secondSnapshot = accessTokenStore.getSnapshot();

    expect(firstSnapshot).toBeNull();
    expect(secondSnapshot).toBe("immutable-token");
    expect(accessTokenStore.getSnapshot()).toBe(secondSnapshot);
    expect(accessTokenStore.getServerSnapshot()).toBeNull();
  });
});
