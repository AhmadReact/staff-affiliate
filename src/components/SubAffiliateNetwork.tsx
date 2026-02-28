import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import { Users, UserCheck } from "lucide-react";
import type { AffiliateCustomerInfo } from "@/store/customer/customerApi";

interface SubAffiliateNetworkProps {
  info?: AffiliateCustomerInfo;
}

export default function SubAffiliateNetwork({ info }: SubAffiliateNetworkProps) {
  const subAffiliates = info?.total_subaffiliate_referral ?? 12;
  const endCustomers = info?.total_subaffiliate_referred_line ?? 181;
  return (
    <Card elevation={0}>
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ color: "text.primary", mb: 2 }}>
          Sub Affiliate Network
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
          {/* You node */}
          <Box
            sx={{
              bgcolor: "#eff6ff",
              border: "2px solid #bfdbfe",
              borderRadius: 10,
              px: 2,
              py: 0.75,
            }}
          >
            <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
              You
            </Typography>
          </Box>

          {/* Arrow */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <Box sx={{ width: 1, height: 16, bgcolor: "grey.300" }} />
            <Box sx={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #cbd5e1" }} />
          </Box>

          {/* Sub affiliates row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
            <Box sx={{ height: 1, flex: 1, bgcolor: "grey.200" }} />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#eff6ff" }}>
                <Users size={14} style={{ color: "#2563eb" }} />
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  mt: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {subAffiliates} Sub Affiliates
              </Typography>
            </Box>
            <Box sx={{ height: 1, flex: 1, bgcolor: "grey.200" }} />
          </Box>

          {/* Arrow */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
            <Box sx={{ width: 1, height: 16, bgcolor: "grey.300" }} />
            <Box sx={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #cbd5e1" }} />
          </Box>

          {/* End customers row */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, width: "100%" }}>
            <Box sx={{ height: 1, flex: 1, bgcolor: "grey.200" }} />
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#f0fdf4" }}>
                <UserCheck size={14} style={{ color: "#16a34a" }} />
              </Avatar>
              <Typography
                variant="caption"
                sx={{
                  color: "text.primary",
                  fontWeight: 600,
                  mt: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                {endCustomers} End Customers
              </Typography>
            </Box>
            <Box sx={{ height: 1, flex: 1, bgcolor: "grey.200" }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
