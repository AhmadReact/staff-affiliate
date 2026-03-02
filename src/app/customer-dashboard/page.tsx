"use client";

import StatsCards from "@/components/StatsCards";
import ThisMonthEarnings from "@/components/ThisMonthEarnings";
import SubAffiliateNetwork from "@/components/SubAffiliateNetwork";
import ReferralList from "@/components/ReferralList";
import {
  useGetAffiliateCustomerInfoQuery,
  type AffiliateCustomerInfo,
} from "@/store/customer/customerApi";

export default function CustomerDashboardPage() {
  const { data, isLoading, error } = useGetAffiliateCustomerInfoQuery();
  const info = data as AffiliateCustomerInfo | undefined;

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {isLoading ? "Loading your dashboard..." : "Customer Dashboard"}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Track your referrals, earnings, sub-affiliates, and payouts.
        </p>
        {info && (
          <p className="text-xs text-gray-500 mt-1">
            Referral code:{" "}
            <span className="font-mono font-semibold">
              {info.referral_code}
            </span>{" "}
            · Wallet balance:{" "}
            <span className="font-semibold">${info.wallet_total}</span> ·
            Pending payout:{" "}
            <span className="font-semibold">${info.pending_payout}</span>
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 mt-1">
            Failed to load customer info.
          </p>
        )}
      </div>

      {/* Stats cards grid */}
      <StatsCards info={info} />

      {/* Bottom section: two-column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left column: referrals */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <ReferralList />
        </div>

        {/* Right column: Sub Affiliate Network + This Month Earnings */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <SubAffiliateNetwork info={info} />
          <ThisMonthEarnings info={info} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
