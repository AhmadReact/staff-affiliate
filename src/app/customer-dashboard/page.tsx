"use client";

import StatsCards from "@/components/StatsCards";
import EarningsBreakdown from "@/components/EarningsBreakdown";
import ThisMonthEarnings from "@/components/ThisMonthEarnings";
import SubAffiliateNetwork from "@/components/SubAffiliateNetwork";
import MySubAffiliates from "@/components/MySubAffiliates";
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left column: Earnings row + Referral List stacked */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Earnings row */}
          <div className="grid grid-cols-1 md:grid-cols-8 gap-5">
            <div className="md:col-span-5">
              <EarningsBreakdown />
            </div>
            <div className="md:col-span-3">
              <ThisMonthEarnings info={info} loading={isLoading} />
            </div>
          </div>

          {/* Referral list sits directly below earnings */}
          <ReferralList />
        </div>

        {/* Right column: Sub Affiliate Network + My Sub Affiliates */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          <SubAffiliateNetwork info={info} />
          <MySubAffiliates />
        </div>
      </div>
    </div>
  );
}
