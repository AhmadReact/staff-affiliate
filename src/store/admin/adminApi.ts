import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, setAuthCredentials } from "@/store/slices/authSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID ?? "1";

export interface AdminBalance {
  id: number;
  customer_id: number;
  customer_name: string;
  amount: number;
  claimable: number;
  claimed: number;
  claim_id: string | null;
  created_at: string;
}

export interface AdminCustomerRate {
  id: number;
  customer_id: number;
  customer_name: string;
  plan_name: string;
  rate: number;
  effective_from: string;
  effective_to: string | null;
  status: string;
  created_at: string;
}

export interface AdminPlanSetting {
  id: number;
  plan_name: string;
  base_rate: number;
  commission_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Plan rate setting item from /api/admin/plan_rate_setting/ */
export interface PlanRateSettingPlan {
  id: number;
  name: string;
}

export interface PlanRateSettingItem {
  id: number;
  plan_id: number;
  affiliate_discount: number;
  sub_affiliate_discount: number;
  total_billing_cycle: number;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;
  plan: PlanRateSettingPlan;
}

export interface PlanRateSettingResponse {
  data: PlanRateSettingItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface PlanRateSettingQuery {
  company_id?: string;
  page?: number;
  page_size?: number;
}

export interface AdminSubscriptionBalance {
  id: number;
  affiliate_customer_id: number;
  amount: number;
  claimed: boolean;
  claim_id: number;
  claimable: boolean;
  status: string;
  claimable_at: string;
  claimable_in_days: number;
  affiliate_customer: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface AdminAffiliateCustomer {
  id: number;
  active: boolean;
  code: string;
  customer_id: number;
  referrer_id: number | null;
  sub_referrer_id: number | null;
  affiliate_referral: boolean;
  customer: {
    id: number;
    name: string;
  };
  referrer: {
    id: number;
    name: string;
  } | null;
  sub_referrer: {
    id: number;
    name: string;
  } | null;
}

export interface AdminCompany {
  id: string;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface AdminBalancesQuery {
  company_id: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AdminCustomerRatesQuery {
  company_id: string;
  page?: number;
  page_size?: number;
}

export interface AdminPlanSettingsQuery {
  company_id: string;
  page?: number;
  page_size?: number;
}

export interface AdminAffiliateCustomersQuery {
  company_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AdminSubscriptionBalancesQuery {
  claimed?: boolean;
  claim_id?: number;
  customer_id?: number;
  company_id?: string;
  page?: number;
  page_size?: number;
  sort_field?: string;
  sort_dir?: "asc" | "desc";
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  prepareHeaders: (headers, { getState }) => {
    const state: any = getState();
    const token: string | null = state?.auth?.accessToken ?? null;
    const selectedCompanyId: string | null =
      state?.adminCompany?.selectedCompanyId ?? null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Attach company id in header for admin APIs (backend expects `company-id`)
    headers.set("company-id", selectedCompanyId ?? COMPANY_ID);

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

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "AdminBalances",
    "AdminCustomerRates",
    "AdminPlanSettings",
    "AdminPlanRateSetting",
    "AdminCompanies",
    "AdminAffiliateCustomers",
    "AdminSubscriptionBalances",
  ],
  endpoints: (builder) => ({
    getAdminBalances: builder.query<
      PaginatedResponse<AdminBalance>,
      AdminBalancesQuery
    >({
      query: (params) => {
        const { company_id, search, page = 1, page_size = 20 } = params;
        return {
          url: "/admin/balances",
          params: {
            company_id,
            search,
            page,
            page_size,
          },
        };
      },
      providesTags: ["AdminBalances"],
    }),
    getAdminCustomerRates: builder.query<
      PaginatedResponse<AdminCustomerRate>,
      AdminCustomerRatesQuery
    >({
      query: (params) => {
        const { company_id, page = 1, page_size = 20 } = params;
        return {
          url: "/admin/plan-rates/customer-rates",
          params: {
            company_id,
            page,
            page_size,
          },
        };
      },
      providesTags: ["AdminCustomerRates"],
    }),
    getAdminPlanSettings: builder.query<
      PaginatedResponse<AdminPlanSetting>,
      AdminPlanSettingsQuery
    >({
      query: (params) => {
        const { company_id, page = 1, page_size = 20 } = params;
        return {
          url: "/admin/plan-rates/settings",
          params: {
            company_id,
            page,
            page_size,
          },
        };
      },
      providesTags: ["AdminPlanSettings"],
    }),
    getPlanRateSettings: builder.query<
      PlanRateSettingResponse,
      PlanRateSettingQuery
    >({
      query: (params) => {
        const { company_id, page = 1, page_size = 25 } = params ?? {};
        return {
          url: "/admin/plan_rate_setting/",
          params: {
            company_id,
            page,
            page_size,
          },
        };
      },
      providesTags: ["AdminPlanRateSetting"],
    }),
    generateMissingPlanRateSettings: builder.mutation<
      { message?: string } | unknown,
      void
    >({
      query: () => ({
        url: "/admin/plan_rate_setting/generate_missing",
        method: "POST",
      }),
      invalidatesTags: ["AdminPlanRateSetting"],
    }),
    getPlanRateSettingById: builder.query<PlanRateSettingItem, number>({
      query: (id) => ({
        url: `/admin/plan_rate_setting/${id}`,
      }),
      providesTags: (_result, _error, id) => [
        { type: "AdminPlanRateSetting", id: String(id) },
      ],
    }),
    updatePlanRateSetting: builder.mutation<
      PlanRateSettingItem,
      {
        id: number;
        affiliate_discount: number;
        sub_affiliate_discount: number;
        total_billing_cycle: number;
      }
    >({
      query: ({ id, affiliate_discount, sub_affiliate_discount, total_billing_cycle }) => ({
        url: `/admin/plan_rate_setting/${id}`,
        method: "PUT",
        body: {
          affiliate_discount,
          sub_affiliate_discount,
          total_billing_cycle,
        },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        "AdminPlanRateSetting",
        { type: "AdminPlanRateSetting", id: String(id) },
      ],
    }),
    getAdminCompanies: builder.query<AdminCompany[], void>({
      query: () => ({
        url: "/admin/affiliate_customer/companies",
      }),
      providesTags: ["AdminCompanies"],
    }),
    getAdminAffiliateCustomers: builder.query<
      PaginatedResponse<AdminAffiliateCustomer>,
      AdminAffiliateCustomersQuery | void
    >({
      query: (params) => {
        const { company_id, search, page = 1, page_size = 20 } = params || {};

        return {
          url: "/admin/affiliate_customer/",
          params: {
            company_id,
            search,
            page,
            page_size,
          },
        };
      },
      providesTags: ["AdminAffiliateCustomers"],
    }),
    getAdminSubscriptionBalances: builder.query<
      PaginatedResponse<AdminSubscriptionBalance>,
      AdminSubscriptionBalancesQuery | void
    >({
      query: (params) => {
        const {
          claimed,
          claim_id,
          customer_id,
          company_id,
          page = 1,
          page_size = 20,
          sort_field,
          sort_dir,
        } = params || {};

        return {
          url: "/admin/subscription/balance",
          params: {
            claimed,
            claim_id,
            customer_id,
            company_id,
            page,
            page_size,
            sort_field,
            sort_dir,
          },
        };
      },
      providesTags: ["AdminSubscriptionBalances"],
    }),
  }),
});

export const {
  useGetAdminBalancesQuery,
  useGetAdminCustomerRatesQuery,
  useGetAdminPlanSettingsQuery,
  useGetPlanRateSettingsQuery,
  useGetPlanRateSettingByIdQuery,
  useGenerateMissingPlanRateSettingsMutation,
  useUpdatePlanRateSettingMutation,
  useGetAdminCompaniesQuery,
  useGetAdminAffiliateCustomersQuery,
  useGetAdminSubscriptionBalancesQuery,
} = adminApi;
