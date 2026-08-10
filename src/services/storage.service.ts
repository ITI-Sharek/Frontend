const ACCESS_TOKEN_KEY = "sharek_access_token";
const REFRESH_TOKEN_KEY = "sharek_refresh_token";
const USERNAME_KEY = "sharek_username";

type StorageSubscriber = () => void;

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

let accessTokenSnapshot = readAccessToken();
const accessTokenSubscribers = new Set<StorageSubscriber>();

function publishAccessToken(nextToken: string | null) {
  if (accessTokenSnapshot === nextToken) return;
  accessTokenSnapshot = nextToken;
  for (const subscriber of accessTokenSubscribers) subscriber();
}

function handleAccessTokenStorageEvent(event: StorageEvent) {
  if (event.key !== ACCESS_TOKEN_KEY && event.key !== null) return;
  publishAccessToken(
    event.key === ACCESS_TOKEN_KEY ? event.newValue : readAccessToken(),
  );
}

export const accessTokenStore = {
  getSnapshot: () => accessTokenSnapshot,
  getServerSnapshot: () => null,
  subscribe: (subscriber: StorageSubscriber) => {
    accessTokenSubscribers.add(subscriber);
    if (accessTokenSubscribers.size === 1 && typeof window !== "undefined") {
      window.addEventListener("storage", handleAccessTokenStorageEvent);
    }

    return () => {
      accessTokenSubscribers.delete(subscriber);
      if (accessTokenSubscribers.size === 0 && typeof window !== "undefined") {
        window.removeEventListener("storage", handleAccessTokenStorageEvent);
      }
    };
  },
};

function setStoredValue(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
}

function removeStoredValue(key: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
}

// TODO: move accessToken to an in-memory auth store (docs/ARCHITECTURE.md §5/§6)
// once the axios interceptors + refresh flow land — localStorage is a stopgap.
export const storageService = {
  getAccessToken: () => accessTokenStore.getSnapshot(),
  setAccessToken: (token: string) => {
    setStoredValue(ACCESS_TOKEN_KEY, token);
    publishAccessToken(token);
  },
  getRefreshToken: () =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => setStoredValue(REFRESH_TOKEN_KEY, token),
  getUsername: () =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(USERNAME_KEY),
  setUsername: (username: string) => setStoredValue(USERNAME_KEY, username),
  clearTokens: () => {
    removeStoredValue(ACCESS_TOKEN_KEY);
    removeStoredValue(REFRESH_TOKEN_KEY);
    removeStoredValue(USERNAME_KEY);
    publishAccessToken(null);
  },
};
