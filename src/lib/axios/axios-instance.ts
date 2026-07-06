import axios from "axios";

import { setupAuthInterceptor } from "./interceptors/auth-interceptor";
import { setupRefreshTokenInterceptor } from "./interceptors/refresh-token-interceptor";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

setupAuthInterceptor(axiosInstance);
setupRefreshTokenInterceptor(axiosInstance);
