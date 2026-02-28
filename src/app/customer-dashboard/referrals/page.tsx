"use client";

import ReferralList from "@/components/ReferralList";

export default function CustomerReferralsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Referrals
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          View and filter all your referred customers.
        </p>
      </div>

      <ReferralList />
    </div>
  );
}

