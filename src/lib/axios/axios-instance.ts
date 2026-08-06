import axios from "axios";

import { API_BASE_URL } from "@/config/env";

import { setupAuthInterceptor } from "./interceptors/auth-interceptor";
import { setupRefreshTokenInterceptor } from "./interceptors/refresh-token-interceptor";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

setupAuthInterceptor(axiosInstance);
setupRefreshTokenInterceptor(axiosInstance);
