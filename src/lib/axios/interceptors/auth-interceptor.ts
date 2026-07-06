import type { AxiosInstance } from "axios";

import { storageService } from "@/services/storage.service";

export function setupAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    // localStorage only exists in the browser; SSR requests go out unauthenticated.
    if (typeof window === "undefined") return config;

    const accessToken = storageService.getAccessToken();
    if (accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });
}
