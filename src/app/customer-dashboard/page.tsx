"use client";

import { FormEvent, useState } from "react";
import Swal from "sweetalert2";

import StatsCards from "@/components/StatsCards";
import ThisMonthEarnings from "@/components/ThisMonthEarnings";
import SubAffiliateNetwork from "@/components/SubAffiliateNetwork";
import ReferralList from "@/components/ReferralList";
import {
  useGetAffiliateCustomerInfoQuery,
  type AffiliateCustomerInfo,
  useUpdateAffiliateCustomerPaymentMutation,
} from "@/store/customer/customerApi";

export default function CustomerDashboardPage() {
  const { data, isLoading, error } = useGetAffiliateCustomerInfoQuery();
  const info = data as AffiliateCustomerInfo | undefined;

  const [
    updatePayment,
    { isLoading: isUpdatingPayment },
  ] = useUpdateAffiliateCustomerPaymentMutation();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "zelle">(
    "paypal",
  );
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const openPaymentModal = (method?: "paypal" | "zelle") => {
    const initialMethod =
      method ?? (info?.preferred_payment === "zelle" ? "zelle" : "paypal");

    setPaymentMethod(initialMethod);
    setPaymentEmail("");
    setPaymentPhone("");
    setPaymentError(null);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    if (isUpdatingPayment) return;
    setShowPaymentModal(false);
  };

  const handleSubmitPayment = async (e: FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    const email = paymentEmail.trim();
    const phone = paymentPhone.trim();

    if (paymentMethod === "paypal" && !email) {
      setPaymentError("PayPal payment account email is required.");
      return;
    }

    if (paymentMethod === "zelle" && !email && !phone) {
      setPaymentError("Provide either email or phone number for Zelle.");
      return;
    }

    try {
      const result = await updatePayment({
        preferred_payment: paymentMethod,
        payment_email: email || undefined,
        payment_phone: phone || undefined,
      }).unwrap();
      setShowPaymentModal(false);
      if (result && typeof result === "object" && "customer" in result) {
        await Swal.fire({
          icon: "success",
          title: "Payment info updated",
          text: "Your preferred payment details have been saved.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch {
      setPaymentError("Failed to update payment info. Please try again.");
    }
  };

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
          <div className="mt-3 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm text-xs text-gray-600 sm:text-sm">
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Referral code
                  </p>
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 font-mono text-xs font-semibold text-indigo-700">
                    {info.referral_code}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    Referral links
                  </p>
                  <div className="space-y-1">
                    <div>
                      <span className="text-[11px] text-gray-400">
                        Referral page:{" "}
                      </span>
                      <a
                        href={
                          (process.env.NEXT_PUBLIC_COMPANY_URL ?? "") +
                          `?referal_code=${info.referral_code}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono break-all text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        {(process.env.NEXT_PUBLIC_COMPANY_URL ?? "") +
                          `?referal_code=${info.referral_code}`}
                      </a>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400">
                        Affiliate sign-up:{" "}
                      </span>
                      <a
                        href={
                          (process.env.NEXT_PUBLIC_CURRENT_APP_URL ?? "") +
                          `/signUp?referral_code=${info.referral_code}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono break-all text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        {(process.env.NEXT_PUBLIC_CURRENT_APP_URL ?? "") +
                          `/signUp?referral_code=${info.referral_code}`}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-3 sm:border-t-0 sm:border-l sm:pl-4 sm:pt-0">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Wallet balance
                    </p>
                    <p className="font-semibold text-gray-800">
                      ${info.wallet_total}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Pending payout
                    </p>
                    <p className="font-semibold text-gray-800">
                      ${info.pending_payout}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    onClick={() => openPaymentModal("paypal")}
                  >
                    Payment Info
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-sm hover:bg-indigo-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                    onClick={() => openPaymentModal("zelle")}
                  >
                    Preferred Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className="absolute inset-0"
              aria-hidden="true"
              onClick={closePaymentModal}
            />
            <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Update Payment Info
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Choose your preferred payment method and provide your account
                details.
              </p>

              <form onSubmit={handleSubmitPayment} className="mt-5 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-gray-700">
                      Preferred Payment
                    </p>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment-method"
                          value="paypal"
                          checked={paymentMethod === "paypal"}
                          onChange={() => setPaymentMethod("paypal")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Paypal</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="payment-method"
                          value="zelle"
                          checked={paymentMethod === "zelle"}
                          onChange={() => setPaymentMethod("zelle")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>Zelle</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">
                        Payment Account Email
                        {paymentMethod === "paypal" && (
                          <span className="text-red-500"> *</span>
                        )}
                      </label>
                      <input
                        type="email"
                        value={paymentEmail}
                        onChange={(e) => setPaymentEmail(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="user@example.com"
                      />
                    </div>
                    {paymentMethod === "zelle" && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700">
                          Payment Account Phone Number
                          <span className="text-gray-400">
                            {" "}
                            (optional if email provided)
                          </span>
                        </label>
                        <input
                          type="tel"
                          value={paymentPhone}
                          onChange={(e) => setPaymentPhone(e.target.value)}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          placeholder="Phone number for Zelle"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {paymentError && (
                  <p className="text-xs text-red-500">{paymentError}</p>
                )}

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closePaymentModal}
                    className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
                    disabled={isUpdatingPayment}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingPayment}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                  >
                    {isUpdatingPayment ? "Updating..." : "Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
