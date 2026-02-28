import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  logout,
  setAuthCredentials,
} from "@/store/slices/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

export interface AffiliateCustomerInfo {
  total_referral: number;
  total_subaffiliate_referral: number;
  total_referred_line: number;
  total_subaffiliate_referred_line: number;
  wallet_total: number;
  current_month_affiliate_earning: number;
  current_month_sub_affiliate_earning: number;
  total_payout: number;
  current_month_payout: number;
  pending_payout: number;
  current_month_referral: number;
  current_month_subaffiliate_referral: number;
  current_month_referred_line: number;
  current_month_subaffiliate_referred_line: number;
  referral_code: string;
  preferred_payment: string | null;
  payment_info: string | null;
  deprecated?: {
    affiliate_referral_count: number;
    sub_affiliate_referral_count: number;
    available_to_claim: number;
    order_count: number;
    potential_earned: number;
    total_paid: number | null;
    approval_pending: number;
  };
}

export interface AffiliateCustomerReferral {
  id: number;
  customer_id: number;
  customer_name: string;
  city: string | null;
  state: string | null;
  date_signed_up: string;
  plan_type: string;
  status: string;
  commission_carried: number;
  sub_affiliate: boolean;
}

export interface AffiliateCustomerReferralsResponse {
  data: AffiliateCustomerReferral[];
  page: number;
  page_size: number;
  total: number;
}

export interface AffiliateCustomerReferralsQuery {
  status?: string;
  month?: number;
  year?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export type WalletEarningStatus =
  | "claimable"
  | "claimable_in_x_days"
  | "paid"
  | "payment_pending";

export interface AffiliateWalletEarning {
  id: number;
  date: string;
  entry_type: string;
  description: string;
  customer_name: string | null;
  customer_info: string | null;
  affiliate_type: string | null;
  status: WalletEarningStatus;
  amount: number;
  running_balance: number;
  claimable_at: string | null;
  claimable_in_days: number | null;
}

export interface AffiliateWalletEarningsResponse {
  data: AffiliateWalletEarning[];
  page: number;
  page_size: number;
  total: number;
}

export interface AffiliateWalletEarningsQuery {
  date_from?: string;
  date_to?: string;
  status?: WalletEarningStatus;
  page?: number;
  page_size?: number;
}

export interface AffiliateWalletPayoutRequest {
  amount: number;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state: any = getState();
    const token: string | null = state?.auth?.accessToken ?? null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const state: any = api.getState();
    const refreshToken: string | null = state?.auth?.refreshToken ?? null;

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    try {
      const body = new URLSearchParams();
      body.append("refresh_token", refreshToken);

      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body,
          params: {
            company_id: COMPANY_ID,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
        api,
        extraOptions,
      );

      if (refreshResult.error) {
        api.dispatch(logout());
        return result;
      }

      api.dispatch(setAuthCredentials(refreshResult.data as any));

      result = await rawBaseQuery(args, api, extraOptions);
    } catch {
      api.dispatch(logout());
    }
  }

  return result;
};

export const customerApi = createApi({
  reducerPath: "customerApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Customer"],
  endpoints: (builder) => ({
    getCustomerProfile: builder.query<unknown, void>({
      query: () => "/customer/profile",
      providesTags: ["Customer"],
    }),
    getAffiliateCustomerInfo: builder.query<AffiliateCustomerInfo, void>({
      // NEXT_PUBLIC_API_URL already ends with /api, so we just append the rest
      query: () => "/affiliate_customer/info",
      providesTags: ["Customer"],
    }),
    getAffiliateCustomerReferrals: builder.query<
      AffiliateCustomerReferralsResponse,
      AffiliateCustomerReferralsQuery | void
    >({
      query: (params) => {
        const {
          status,
          month,
          year,
          sort_by,
          sort_dir,
          page = 1,
          page_size = 20,
        } = params || {};

        return {
          url: "/affiliate_customer/referrals",
          params: {
            status,
            month,
            year,
            sort_by,
            sort_dir,
            page,
            page_size,
          },
        };
      },
      providesTags: ["Customer"],
    }),
    getAffiliateWalletEarnings: builder.query<
      AffiliateWalletEarningsResponse,
      AffiliateWalletEarningsQuery | void
    >({
      // NEXT_PUBLIC_API_URL already ends with /api, so we just append the rest
      query: (params) => {
        const {
          date_from,
          date_to,
          status,
          page = 1,
          page_size = 20,
        } = params || {};

        return {
          url: "/affiliate_customer/wallet/earnings",
          params: {
            date_from,
            date_to,
            status,
            page,
            page_size,
          },
        };
      },
      providesTags: ["Customer"],
    }),
    createAffiliateWalletPayout: builder.mutation<
      unknown,
      AffiliateWalletPayoutRequest
    >({
      query: (body) => ({
        url: "/affiliate_customer/wallet/payout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Customer"],
    }),
  }),
});

export const {
  useGetCustomerProfileQuery,
  useGetAffiliateCustomerInfoQuery,
  useGetAffiliateCustomerReferralsQuery,
  useGetAffiliateWalletEarningsQuery,
  useCreateAffiliateWalletPayoutMutation,
} = customerApi;

