"use client";
 
import { useState, FormEvent } from "react";
import Swal from "sweetalert2";
import EarningsClaimCard from "@/components/earnings/EarningsClaimCard";
import EarningsTable from "@/components/earnings/EarningsTable";
import EarningsSidebar from "@/components/earnings/EarningsSidebar";
import {
  AffiliateCustomerInfo,
  useGetAffiliateCustomerInfoQuery,
  useCreateAffiliateWalletPayoutMutation,
} from "@/store/customer/customerApi";

function formatCurrency(amount: number | undefined): string {
  if (amount == null || Number.isNaN(amount)) {
    return "$0.00";
  }

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function CustomerEarningsPage() {
  const { data, isLoading, error } = useGetAffiliateCustomerInfoQuery();
  const info = data as AffiliateCustomerInfo | undefined;
  const walletTotal = info?.wallet_total;
  const pendingPayout = info?.pending_payout;
  const claimAmountLabel = formatCurrency(walletTotal);

  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createPayout, { isLoading: isSubmitting }] =
    useCreateAffiliateWalletPayoutMutation();

  function openClaimDialog() {
    setFormError(null);
    if (walletTotal != null && !Number.isNaN(walletTotal) && walletTotal > 0) {
      setAmountInput(walletTotal.toFixed(2));
    } else {
      setAmountInput("");
    }
    setIsClaimOpen(true);
  }

  function closeClaimDialog() {
    setIsClaimOpen(false);
  }

  function handleAmountChange(value: string) {
    setFormError(null);

    if (
      walletTotal == null ||
      Number.isNaN(walletTotal) ||
      walletTotal <= 0
    ) {
      setAmountInput(value);
      return;
    }

    const numeric = parseFloat(value);

    if (Number.isNaN(numeric)) {
      setAmountInput(value);
      return;
    }

    if (numeric > walletTotal) {
      setAmountInput(walletTotal.toFixed(2));
      return;
    }

    setAmountInput(value);
  }

  async function handleSubmitClaim(event: FormEvent) {
    event.preventDefault();

    const value = parseFloat(amountInput);

    if (!Number.isFinite(value) || value <= 0) {
      setFormError("Please enter a valid amount greater than 0.");
      return;
    }

    if (
      walletTotal != null &&
      !Number.isNaN(walletTotal) &&
      value > walletTotal
    ) {
      setFormError("Amount cannot be greater than your available balance.");
      return;
    }

    try {
      setFormError(null);
      await createPayout({ amount: value }).unwrap();
      setIsClaimOpen(false);
      Swal.fire({
        icon: "success",
        title: "Payout requested",
        text: `Your payout request for ${formatCurrency(
          value,
        )} has been submitted and is pending approval.`,
        confirmButtonColor: "#2563eb",
      });
    } catch {
      setFormError("Failed to submit payout request. Please try again.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Page title + claim button — stack on mobile, row on sm+ */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Earnings
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Track your earnings and claim payouts.
          </p>
        </div>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap sm:shrink-0 self-start disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={openClaimDialog}
          disabled={
            walletTotal == null || Number.isNaN(walletTotal) || walletTotal <= 0
          }
        >
          Claim Payment ({claimAmountLabel})
        </button>
      </div>

      {/* Body: stacked on mobile, side-by-side on lg+ */}
      <div className="flex flex-col lg:flex-row gap-5 mt-5 items-start">
        {/* Main column */}
        <div className="flex-1 flex flex-col gap-5 min-w-0 w-full">
          <EarningsClaimCard walletTotal={walletTotal} />
          <EarningsTable />
        </div>

        {/* Right sidebar */}
        <EarningsSidebar walletTotal={walletTotal} pendingPayout={pendingPayout} />
      </div>

      {isClaimOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Claim payment
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Available to claim:{" "}
                  <span className="font-semibold text-gray-700">
                    {claimAmountLabel}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={closeClaimDialog}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="claim-amount"
                  className="block text-xs font-medium text-gray-600"
                >
                  Amount to claim
                </label>
                <input
                  id="claim-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  max={walletTotal ?? undefined}
                  value={amountInput}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter amount"
                />
                {formError && (
                  <p className="text-xs text-red-500 mt-1">{formError}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeClaimDialog}
                  className="px-3 py-2 text-xs font-medium text-gray-600 rounded-lg hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
