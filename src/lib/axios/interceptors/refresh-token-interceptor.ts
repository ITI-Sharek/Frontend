import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { ROUTES } from "@/config/routes.config";
import { storageService } from "@/services/storage.service";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
}

// A 401 from these endpoints means bad credentials / bad refresh token,
// not an expired access token — refreshing would loop.
const NO_REFRESH_URLS = ["/auth/login", "/auth/register", "/auth/refresh"];

// Single-flight: concurrent 401s share one refresh request.
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(baseURL: string | undefined): Promise<string> {
  const refreshToken = storageService.getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token available");

  // Bare axios call — the shared instance would re-enter this interceptor.
  const { data } = await axios.post<RefreshedTokens>(
    "/auth/refresh",
    { refreshToken },
    { baseURL },
  );

  storageService.setAccessToken(data.accessToken);
  storageService.setRefreshToken(data.refreshToken);
  return data.accessToken;
}

export function setupRefreshTokenInterceptor(instance: AxiosInstance) {
  instance.interceptors.response.use(undefined, async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined;

    const canRefresh =
      typeof window !== "undefined" &&
      error.response?.status === 401 &&
      config !== undefined &&
      !config._retry &&
      !NO_REFRESH_URLS.some((url) => config.url?.includes(url)) &&
      storageService.getRefreshToken() !== null;

    if (!canRefresh || !config) throw error;

    config._retry = true;
    try {
      refreshPromise ??= refreshAccessToken(instance.defaults.baseURL).finally(
        () => {
          refreshPromise = null;
        },
      );
      const accessToken = await refreshPromise;
      config.headers.Authorization = `Bearer ${accessToken}`;
      return instance(config);
    } catch (refreshError) {
      storageService.clearTokens();
      window.location.assign(ROUTES.login);
      throw refreshError;
    }
  });
}
