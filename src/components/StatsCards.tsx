import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  CreditCard,
  Clock,
  LucideIcon,
} from "lucide-react";
import type { AffiliateCustomerInfo } from "@/store/customer/customerApi";

interface CardData {
  label: string;
  value: string;
  sub: string;
  period: string;
  icon: LucideIcon;
  accent: string;
  accentBg: string;
}

interface StatCardProps extends CardData {}

function StatCard({
  label,
  value,
  sub,
  period,
  icon: Icon,
  accent,
  accentBg,
}: StatCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        transition: "box-shadow 0.2s, transform 0.2s",
        "&:hover": {
          boxShadow: "0 8px 24px -4px rgb(0 0 0 / 0.10)",
          transform: "translateY(-1px)",
        },
      }}
    >
      {/* Top accent bar */}
      <Box sx={{ height: 3, bgcolor: accent, borderRadius: "12px 12px 0 0" }} />

      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header: icon + period */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon size={16} style={{ color: accent }} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              bgcolor: "grey.100",
              color: "text.disabled",
              fontWeight: 600,
              px: 1,
              py: 0.25,
              borderRadius: 10,
              fontSize: "0.65rem",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {period}
          </Typography>
        </Box>

        {/* Label */}
        <Typography
          variant="subtitle2"
          sx={{ color: "text.secondary", fontWeight: 600, mb: 0.5, fontSize: "0.8rem" }}
        >
          {label}
        </Typography>

        {/* Value */}
        <Typography
          sx={{
            fontSize: "1.75rem",
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            mb: 1.5,
          }}
        >
          {value}
        </Typography>

        <Divider sx={{ mb: 1.5 }} />

        {/* Footer */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 500 }}>
            {sub}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

interface StatsCardsProps {
  info?: AffiliateCustomerInfo;
}

function buildCardsFromInfo(info: AffiliateCustomerInfo): CardData[] {
  return [
    // Current month metrics
    {
      label: "This Month Payout",
      value: `$${(info.current_month_payout ?? 0).toFixed(2)}`,
      sub: "Payouts sent this month",
      period: "This Month",
      icon: CreditCard,
      accent: "#ea580c",
      accentBg: "#fff7ed",
    },
    {
      label: "This Month Referrals (Direct)",
      value: String(info.current_month_referral ?? 0),
      sub: "New direct referrals this month",
      period: "This Month",
      icon: Users,
      accent: "#2563eb",
      accentBg: "#eff6ff",
    },
    {
      label: "This Month Referrals (Sub-Affiliates)",
      value: String(info.current_month_subaffiliate_referral ?? 0),
      sub: "New sub-affiliate referrals this month",
      period: "This Month",
      icon: Users,
      accent: "#0f766e",
      accentBg: "#ecfeff",
    },
    {
      label: "This Month Lines (Direct)",
      value: String(info.current_month_referred_line ?? 0),
      sub: "New direct lines this month",
      period: "This Month",
      icon: Activity,
      accent: "#1d4ed8",
      accentBg: "#eff6ff",
    },
    {
      label: "This Month Lines (Sub-Affiliates)",
      value: String(info.current_month_subaffiliate_referred_line ?? 0),
      sub: "New sub-affiliate lines this month",
      period: "This Month",
      icon: Activity,
      accent: "#15803d",
      accentBg: "#f0fdf4",
    },

    // Totals
    {
      label: "Total Referrals (Direct)",
      value: String(info.total_referral ?? 0),
      sub: "All-time direct referrals",
      period: "All Time",
      icon: Users,
      accent: "#4b5563",
      accentBg: "#f9fafb",
    },
    {
      label: "Total Referrals (Sub-Affiliates)",
      value: String(info.total_subaffiliate_referral ?? 0),
      sub: "All-time sub-affiliate referrals",
      period: "All Time",
      icon: Users,
      accent: "#7c3aed",
      accentBg: "#f5f3ff",
    },
    {
      label: "Total Lines (Direct)",
      value: String(info.total_referred_line ?? 0),
      sub: "All-time direct referred lines",
      period: "All Time",
      icon: Activity,
      accent: "#0369a1",
      accentBg: "#e0f2fe",
    },
    {
      label: "Total Lines (Sub-Affiliates)",
      value: String(info.total_subaffiliate_referred_line ?? 0),
      sub: "All-time sub-affiliate lines",
      period: "All Time",
      icon: Activity,
      accent: "#a16207",
      accentBg: "#fefce8",
    },
    {
      label: "Total Payout",
      value: `$${(info.total_payout ?? 0).toFixed(2)}`,
      sub: "All-time payouts sent",
      period: "All Time",
      icon: CreditCard,
      accent: "#c2410c",
      accentBg: "#ffedd5",
    },
    {
      label: "Wallet Balance",
      value: `$${(info.wallet_total ?? 0).toFixed(2)}`,
      sub: "Available to claim",
      period: "Current",
      icon: TrendingUp,
      accent: "#22c55e",
      accentBg: "#ecfdf3",
    },
  ];
}

export default function StatsCards({ info }: StatsCardsProps) {
  if (!info) {
    return null;
  }

  const cards = buildCardsFromInfo(info);

  return (
    <Grid container spacing={2}>
      {cards.map((card, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}
