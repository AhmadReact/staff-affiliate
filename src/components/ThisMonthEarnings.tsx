"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import { Calendar } from "lucide-react";
import type { AffiliateCustomerInfo } from "@/store/customer/customerApi";

interface ThisMonthEarningsProps {
  info?: AffiliateCustomerInfo;
  loading?: boolean;
}

export default function ThisMonthEarnings({
  info,
  loading,
}: ThisMonthEarningsProps) {
  const direct = info?.current_month_affiliate_earning ?? 0;
  const subAffiliate = info?.current_month_sub_affiliate_earning ?? 0;
  const total = direct + subAffiliate || 1;
  const directPct = (direct / total) * 100;
  const subPct = (subAffiliate / total) * 100;

  return (
    <Card elevation={0} sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1, p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ color: "text.primary", mb: 2 }}>
          This Month Earnings
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flex: 1 }}>
          {/* Direct Earnings */}
          <Box sx={{ bgcolor: "primary.main", borderRadius: 2, px: 2, py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "#bfdbfe", fontWeight: 500 }}>
                Direct Earnings
              </Typography>
              <Typography variant="body2" sx={{ color: "white", fontWeight: 700 }}>
                {loading ? "..." : `$${direct.toFixed(2)}`}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={directPct}
              sx={{
                bgcolor: "primary.light",
                "& .MuiLinearProgress-bar": { bgcolor: "white" },
                height: 6,
              }}
            />
          </Box>

          {/* Sub Affiliate */}
          <Box sx={{ bgcolor: "#eff6ff", borderRadius: 2, px: 2, py: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="caption" sx={{ color: "primary.light", fontWeight: 500 }}>
                Sub Affiliate
              </Typography>
              <Typography variant="body2" sx={{ color: "primary.dark", fontWeight: 700 }}>
                {loading ? "..." : `$${subAffiliate.toFixed(2)}`}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={subPct}
              sx={{
                bgcolor: "#bfdbfe",
                "& .MuiLinearProgress-bar": { bgcolor: "primary.main" },
                height: 6,
              }}
            />
          </Box>
        </Box>

        <Button
          variant="outlined"
          fullWidth
          size="small"
          endIcon={<Calendar size={13} />}
          sx={{
            mt: 2,
            borderColor: "divider",
            color: "text.secondary",
            fontSize: "0.75rem",
            py: 0.75,
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
