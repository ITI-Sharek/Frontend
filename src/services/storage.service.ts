const ACCESS_TOKEN_KEY = "sharek_access_token";
const REFRESH_TOKEN_KEY = "sharek_refresh_token";

// TODO: move accessToken to an in-memory auth store (docs/ARCHITECTURE.md §5/§6)
// once the axios interceptors + refresh flow land — localStorage is a stopgap.
export const storageService = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage.setItem(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token),
  clearTokens: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
