import { User } from "lucide-react";

interface EarningsClaimCardProps {
  walletTotal?: number;
}

export default function EarningsClaimCard({ walletTotal }: EarningsClaimCardProps) {
  const formattedWalletTotal =
    walletTotal != null && !Number.isNaN(walletTotal)
      ? `$${walletTotal.toFixed(2)}`
      : "$0.00";

  return (
    <div className="bg-linear-to-br from-blue-50 to-white rounded-xl border border-blue-100 p-6 shadow-sm">
      <p className="text-sm font-medium text-gray-500 mb-1">Available to Claim</p>
      <p className="text-4xl font-bold text-gray-800 mt-1">
        {formattedWalletTotal}
      </p>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-blue-100 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={10} className="text-white" />
          </div>
          <span className="font-medium text-blue-700">ClaimaDJ</span>
        </div>
        <span className="ml-auto text-sm font-bold text-gray-700">
          {formattedWalletTotal}
        </span>
      </div>
    </div>
  );
}
