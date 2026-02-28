import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosRequestHeaders,
} from "axios";
import type { RefreshResponse } from "@/apis/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

type AuthStateSelector = () =>
  | {
      accessToken: string | null;
      refreshToken: string | null;
    }
  | null;

type LogoutHandler = () => void;
type SetCredentialsHandler = (data: RefreshResponse) => void;

let getAuthState: AuthStateSelector | null = null;
let handleLogout: LogoutHandler | null = null;
let handleSetCredentials: SetCredentialsHandler | null = null;

export function configureApiClient(options: {
  getAuthState: AuthStateSelector;
  onLogout: LogoutHandler;
  onSetAuthCredentials: SetCredentialsHandler;
}) {
  getAuthState = options.getAuthState;
  handleLogout = options.onLogout;
  handleSetCredentials = options.onSetAuthCredentials;
}

interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.request.use(
  (config) => {
    const state = getAuthState ? getAuthState() : null;
    const token = state?.accessToken ?? null;

    if (token) {
      const headers = (config.headers ?? {}) as AxiosRequestHeaders;
      headers.Authorization = `Bearer ${token}`;
      config.headers = headers;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const state = getAuthState ? getAuthState() : null;
    const refreshToken: string | null = state?.refreshToken ?? null;

    if (!refreshToken) {
      if (handleLogout) {
        handleLogout();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          const body = new URLSearchParams();
          body.append("refresh_token", refreshToken);

          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            body,
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
              },
              params: {
                company_id: COMPANY_ID,
              },
              maxBodyLength: Infinity,
            },
          );

          const data = response.data as RefreshResponse;

          if (handleSetCredentials) {
            handleSetCredentials(data);
          }

          if (data.access_token) {
            apiClient.defaults.headers.common.Authorization =
              `Bearer ${data.access_token}`;
          }
        })();
      }

      await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (!originalRequest.headers) {
        originalRequest.headers = {} as AxiosRequestHeaders;
      }
      (originalRequest.headers as AxiosRequestHeaders).Authorization =
        apiClient.defaults.headers.common.Authorization as string;

      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshPromise = null;
      if (handleLogout) {
        handleLogout();
      }
      return Promise.reject(refreshError);
    }
  },
);
