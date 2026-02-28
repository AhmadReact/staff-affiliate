"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell } from "recharts";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Calendar } from "lucide-react";
import { useGetAffiliateWalletEarningsQuery } from "@/store/customer/customerApi";

interface BarDataItem {
  month: string;
  value: number;
}

const fallbackBarData: BarDataItem[] = [
  { month: "Aug", value: 320 },
  { month: "Sep", value: 480 },
  { month: "Oct", value: 390 },
  { month: "Nov", value: 560 },
  { month: "Dec", value: 720 },
  { month: "Jan", value: 610 },
  { month: "Feb", value: 852 },
];

export default function EarningsBreakdown() {
  const { data } = useGetAffiliateWalletEarningsQuery();
  const earningsData = data as any;

  const apiBarData: BarDataItem[] | undefined = earningsData?.data?.map(
    (item: any) => ({
      month: item.month ?? item.label ?? "",
      value:
        typeof item.value === "number"
          ? item.value
          : Number(item.amount ?? 0),
    })
  );

  const chartData =
    apiBarData && apiBarData.length > 0 ? apiBarData : fallbackBarData;

  const directEarnings =
    earningsData?.summary?.direct_earnings ??
    earningsData?.summary?.direct ??
    734.25;

  const subAffiliateEarnings =
    earningsData?.summary?.sub_affiliate_earnings ??
    earningsData?.summary?.sub_affiliate ??
    118.4;

  const adjustments =
    earningsData?.summary?.adjustments ??
    earningsData?.summary?.adjustment ??
    -5.25;

  const chargebacks =
    earningsData?.summary?.chargebacks ??
    earningsData?.summary?.chargeback ??
    -2.0;

  const total =
    earningsData?.summary?.total ??
    earningsData?.summary?.total_earnings ??
    852.65;

  return (
    <Card elevation={0}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ color: "text.primary", mb: 2 }}>
          Earnings Breakdown
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          {/* Left: breakdown items */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 140 }}>
            <Box sx={{ bgcolor: "#eff6ff", borderRadius: 2, px: 1.5, py: 1 }}>
              <Typography variant="body2" sx={{ color: "#1d4ed8", fontWeight: 700 }}>
                ${directEarnings.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                Direct Earnings
              </Typography>
            </Box>
            <Box sx={{ bgcolor: "#eff6ff", borderRadius: 2, px: 1.5, py: 1 }}>
              <Typography variant="body2" sx={{ color: "#1d4ed8", fontWeight: 700 }}>
                ${subAffiliateEarnings.toFixed(2)}
              </Typography>
              <Typography variant="caption" sx={{ color: "#60a5fa" }}>
                Sub Affiliate Earnings
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Box>
                <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600, fontSize: "0.8125rem" }}>
                  {adjustments < 0
                    ? `-$${Math.abs(adjustments).toFixed(2)}`
                    : `$${adjustments.toFixed(2)}`}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  Adjustments{" "}
                  <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>$11k</Box>
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: "error.main", fontWeight: 600, fontSize: "0.8125rem" }}>
                  {chargebacks < 0
                    ? `-$${Math.abs(chargebacks).toFixed(2)}`
                    : `$${chargebacks.toFixed(2)}`}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  Chargebacks{" "}
                  <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>$23k</Box>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right: chart + total */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5 }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                  ${total.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  Total: ${total.toFixed(2)}
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main" }}>
                ${total.toFixed(2)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 80 }}>
              <ResponsiveContainer width="100%" height={90}>
                <BarChart data={chartData} barSize={10} barCategoryGap="30%">
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 6,
                      border: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                    formatter={(v) => [`$${v}`, "Earnings"]}
                  />
                  <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                    {chartData.map((item: BarDataItem, index: number) => (
                      <Cell
                        key={index}
                        fill={index === chartData.length - 1 ? "#2563eb" : "#bfdbfe"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
              <Calendar size={12} style={{ color: "#94a3b8" }} />
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Next Payout Date
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
