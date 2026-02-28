import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { MessageSquare, Smartphone, Instagram } from "lucide-react";
import Link from "next/link";

interface Affiliate {
  name: string;
  earnings: string;
  status: string;
  lines: number;
}

const affiliates: Affiliate[] = [
  { name: "Levi Klein", earnings: "$2.12", status: "Active", lines: 2 },
  { name: "Moshe Beren", earnings: "$3.02", status: "Active", lines: 3 },
];

interface ChannelButton {
  label: string;
  icon: React.ReactElement;
}

const channelButtons: ChannelButton[] = [
  { label: "ProBulk Message", icon: <MessageSquare size={11} style={{ color: "#2563eb" }} /> },
  { label: "SMS", icon: <Smartphone size={11} style={{ color: "#16a34a" }} /> },
  { label: "Instagram", icon: <Instagram size={11} style={{ color: "#ec4899" }} /> },
];

export default function MySubAffiliates() {
  return (
    <Card elevation={0}>
      <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
          My Sub Affiliates
        </Typography>

        {/* Column labels */}
        <Grid container sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 0.5 }}>
          <Grid size={5}>
            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Name
            </Typography>
          </Grid>
          <Grid size={4} sx={{ textAlign: "center" }}>
            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Acst: Lines
            </Typography>
          </Grid>
          <Grid size={3} sx={{ textAlign: "right" }}>
            <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Status
            </Typography>
          </Grid>
        </Grid>

        {/* Affiliate rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {affiliates.map((aff) => (
            <Box key={aff.name} sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 11, bgcolor: "grey.100", color: "text.secondary" }}>
                  {aff.name[0]}
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, color: "text.primary" }}>
                  {aff.name}
                </Typography>
              </Box>
              <Chip
                label={aff.earnings}
                size="small"
                sx={{ height: 20, bgcolor: "#eff6ff", color: "primary.main", fontWeight: 700, mx: 1 }}
              />
              <Chip
                label={aff.status}
                size="small"
                sx={{ height: 20, bgcolor: "#dcfce7", color: "success.dark", fontWeight: 700 }}
              />
            </Box>
          ))}
        </Box>

        {/* Channel buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pt: 0.5, borderTop: "1px solid", borderColor: "divider" }}>
          {channelButtons.map(({ label, icon }) => (
            <Button
              key={label}
              variant="text"
              size="small"
              startIcon={icon}
              sx={{
                fontSize: "0.6875rem",
                color: "text.secondary",
                bgcolor: "grey.50",
                borderRadius: 1.5,
                px: 1,
                py: 0.5,
                minWidth: "auto",
                "&:hover": { bgcolor: "grey.100" },
                "& .MuiButton-startIcon": { mr: 0.5 },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>

        {/* Channel stats */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "grey.50", borderRadius: 2, px: 1.5, py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Smartphone size={13} style={{ color: "#64748b" }} />
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>SMS</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>$283</Typography>
            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700 }}>$8,511.50</Typography>
          </Box>
        </Box>

        {/* CTA */}
        <Button
          component={Link}
          href="/customer-dashboard/referrals"
          variant="contained"
          color="primary"
          fullWidth
          size="small"
          sx={{ py: 1, fontSize: "0.8125rem" }}
        >
          View All Referrals
        </Button>
      </CardContent>
    </Card>
  );
}
