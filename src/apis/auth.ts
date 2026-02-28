import { apiClient } from "./client";

const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID;

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  [key: string]: unknown;
}

export interface AuthUser {
  email: string;
  id: number;
  company_id: number;
  fname: string;
  lname: string;
  user_type: "staff" | "customer" | string;
}

export interface RefreshResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export async function login({
  username,
  password,
}: LoginPayload): Promise<LoginResponse & { user?: AuthUser }> {
  const companyId = COMPANY_ID ?? "1";

  const body = new URLSearchParams();
  body.append("username", username);
  body.append("password", password);

  try {
    const response = await apiClient.post<
      (LoginResponse & { user?: AuthUser }) & {
        message?: string;
        error?: string;
      }
    >("/auth/login", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        company_id: companyId,
      },
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to sign in. Please try again.";
    throw new Error(message);
  }
}

export async function refreshTokenApi(
  refreshToken: string,
): Promise<RefreshResponse> {
  const companyId = COMPANY_ID ?? "1";

  const body = new URLSearchParams();
  body.append("refresh_token", refreshToken);

  try {
    const response = await apiClient.post<
      RefreshResponse & { message?: string; error?: string }
    >("/auth/refresh", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      params: {
        company_id: companyId,
      },
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error: any) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to refresh session. Please sign in again.";
    throw new Error(message);
  }
}

