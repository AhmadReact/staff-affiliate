import { ChevronRight } from "lucide-react";

interface SideCardProps {
  children: React.ReactNode;
  className?: string;
}

interface EarningsSidebarProps {
  walletTotal?: number;
  pendingPayout?: number;
}

function SideCard({ children, className = "" }: SideCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default function EarningsSidebar({
  walletTotal,
  pendingPayout,
}: EarningsSidebarProps) {
  const formattedWalletTotal =
    walletTotal != null && !Number.isNaN(walletTotal)
      ? `$${walletTotal.toFixed(2)}`
      : "$0.00";

  const formattedPendingPayout =
    pendingPayout != null && !Number.isNaN(pendingPayout)
      ? `$${pendingPayout.toFixed(2)}`
      : "$0.00";

  const safeWalletTotal =
    walletTotal != null && !Number.isNaN(walletTotal) ? walletTotal : 0;
  const safePendingPayout =
    pendingPayout != null && !Number.isNaN(pendingPayout) ? pendingPayout : 0;
  const lifetimeEarned = safeWalletTotal + safePendingPayout;
  const formattedLifetimeEarned = `$${lifetimeEarned.toFixed(2)}`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full lg:w-64 lg:shrink-0">
      {/* Available to Claim + Claim button */}
      {/* <SideCard>
        <p className="text-xs text-gray-500 font-medium mb-1">
          Available to Claim
        </p>
        <p className="text-3xl font-bold text-gray-800">
          {formattedWalletTotal}
        </p>
        <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
          Claim Payment
          <ChevronRight size={15} />
        </button>
      </SideCard> */}

      {/* Pending payout */}
      <SideCard>
        <p className="text-xs text-gray-500 font-medium mb-1">
          Pending payout
        </p>
        <p className="text-3xl font-bold text-gray-800">
          {formattedPendingPayout}
        </p>
        <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
          Becomes claimable between{" "}
          <span className="font-semibold text-gray-600">Feb → Mar 4</span>
        </p>
      </SideCard>

      {/* Lifetime Earned */}
      <SideCard>
        <p className="text-xs text-gray-500 font-medium mb-1">
          Lifetime Earned
        </p>
        <p className="text-3xl font-bold text-gray-800">
          {formattedLifetimeEarned}
        </p>
      </SideCard>
    </div>
  );
}
