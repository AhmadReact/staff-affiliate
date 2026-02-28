"use client";
import { useState } from "react";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { ChevronDown, Search, Calendar, ArrowUpDown } from "lucide-react";
import {
  useGetAffiliateCustomerReferralsQuery,
  AffiliateCustomerReferralsResponse,
} from "../store/customer/customerApi";

type StatusColor = "green" | "gray";

interface Referral {
  id: number;
  customer: string;
  city: string;
  dateSignedUp: string;
  planType: string;
  monthlyElem: string;
  commsEarned: string;
  status: string;
  statusColor: StatusColor;
  isSubAffiliate: boolean;
}

const referrals: Referral[] = [
  {
    id: 1,
    customer: "J. Cohen",
    city: "Brooklyn, NY",
    dateSignedUp: "Feb 2, 2024",
    planType: "Basic",
    monthlyElem: "$25",
    commsEarned: "$56.15",
    status: "Active",
    statusColor: "green",
    isSubAffiliate: false,
  },
  {
    id: 2,
    customer: "David Sternberg",
    city: "Lakewood, NJ",
    dateSignedUp: "Jan 18, 2024",
    planType: "Premium",
    monthlyElem: "$25",
    commsEarned: "$31.00",
    status: "Active",
    statusColor: "green",
    isSubAffiliate: false,
  },
  {
    id: 3,
    customer: "Aharon Klein",
    city: "Monsey, NY",
    dateSignedUp: "Jan 18, 2024",
    planType: "Unlimited",
    monthlyElem: "$25",
    commsEarned: "$31.00",
    status: "Active",
    statusColor: "green",
    isSubAffiliate: false,
  },
  {
    id: 4,
    customer: "Rivky Friedman",
    city: "Miami, FL",
    dateSignedUp: "Feb 8, 2024",
    planType: "Pixronum",
    monthlyElem: "$25",
    commsEarned: "$82.15",
    status: "Active",
    statusColor: "green",
    isSubAffiliate: false,
  },
  {
    id: 5,
    customer: "Sara Berg",
    city: "Passaic, NJ",
    dateSignedUp: "Jan 30, 2024",
    planType: "Unlimited",
    monthlyElem: "$25",
    commsEarned: "$62.25",
    status: "7/11",
    statusColor: "gray",
    isSubAffiliate: false,
  },
];

const statusChipSx: Record<StatusColor, object> = {
  green: { bgcolor: "#dcfce7", color: "#15803d" },
  gray: { bgcolor: "#f1f5f9", color: "#475569" },
};

const TABS = ["All", "Active", "Cancelled"];
const COLUMNS = [
  "Customer",
  "City / State",
  "Date Signed Up",
  "Plan Type",
  "Referral Type",
  "Monthly Elem",
  "Comms Earned",
  "Status",
];
const SORTABLE = ["Date Signed Up", "Plan Type"];

function mapApiToReferralRows(
  api: AffiliateCustomerReferralsResponse | undefined
): Referral[] {
  if (!api || !api.data) return referrals;

  return api.data.map((item) => {
    const cityState =
      item.city && item.state
        ? `${item.city}, ${item.state}`
        : item.city || item.state || "—";

    const date = item.date_signed_up
      ? new Date(item.date_signed_up).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

    const priceMatch = item.plan_type.match(/\$\d+(\.\d+)?/);
    const monthlyElem = priceMatch ? priceMatch[0] : "—";

    const isActive = item.status === "Active";

    return {
      id: item.id,
      customer: item.customer_name,
      city: cityState,
      dateSignedUp: date,
      planType: item.plan_type,
      monthlyElem,
      commsEarned: `$${item.commission_carried.toFixed(2)}`,
      status: item.status,
      statusColor: isActive ? "green" : "gray",
      isSubAffiliate: item.sub_affiliate,
    };
  });
}

export default function ReferralList() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");

  // Map tabs to API status filter: all | active | cancelled
  const statusFilter =
    activeTab === 1 ? "active" : activeTab === 2 ? "cancelled" : "all";

  const {
    data,
    isLoading,
    isError,
  } = useGetAffiliateCustomerReferralsQuery({
    status: statusFilter,
    month: monthFilter ? Number(monthFilter) : undefined,
    year: yearFilter ? Number(yearFilter) : undefined,
    sort_by: "date_signed_up",
    sort_dir: "desc",
    page,
    page_size: 20,
  });

  const rows = mapApiToReferralRows(data);
  const total = data?.total ?? rows.length;
  const pageSize = data?.page_size ?? 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card elevation={0}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5, flexWrap: "wrap", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="subtitle2" sx={{ color: "text.primary" }}>
            Referral List
          </Typography>
          <Tabs
            value={activeTab}
            onChange={(_, v: number) => setActiveTab(v)}
            sx={{ minHeight: 32, "& .MuiTabs-indicator": { height: 2, borderRadius: 1 } }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab}
                label={tab}
                sx={{
                  minHeight: 32,
                  py: 0.5,
                  px: 1.5,
                  fontSize: "0.75rem",
                  fontWeight: 500,
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Select
            value={monthFilter}
            onChange={(e) => {
              setPage(1);
              setMonthFilter(e.target.value as string);
            }}
            size="small"
            displayEmpty
            sx={{
              minWidth: 120,
              fontSize: "0.75rem",
              height: 30,
            }}
          >
            <MenuItem value="">
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                All months
              </Typography>
            </MenuItem>
            <MenuItem value="1">January</MenuItem>
            <MenuItem value="2">February</MenuItem>
            <MenuItem value="3">March</MenuItem>
            <MenuItem value="4">April</MenuItem>
            <MenuItem value="5">May</MenuItem>
            <MenuItem value="6">June</MenuItem>
            <MenuItem value="7">July</MenuItem>
            <MenuItem value="8">August</MenuItem>
            <MenuItem value="9">September</MenuItem>
            <MenuItem value="10">October</MenuItem>
            <MenuItem value="11">November</MenuItem>
            <MenuItem value="12">December</MenuItem>
          </Select>

          <Select
            value={yearFilter}
            onChange={(e) => {
              setPage(1);
              setYearFilter(e.target.value as string);
            }}
            size="small"
            displayEmpty
            sx={{
              minWidth: 100,
              fontSize: "0.75rem",
              height: 30,
            }}
          >
            <MenuItem value="">
              <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                All years
              </Typography>
            </MenuItem>
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2026">2026</MenuItem>
          </Select>
          <IconButton size="small" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, color: "text.secondary", p: 0.75 }}>
            <Search size={13} />
          </IconButton>
        </Box>
      </Box>

      <Divider />

      {/* Table */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableCell key={col} sx={{ whiteSpace: "nowrap" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {col}
                    {SORTABLE.includes(col) && <ArrowUpDown size={10} style={{ color: "#cbd5e1" }} />}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} sx={{ textAlign: "center", py: 3 }}>
                  Loading referrals...
                </TableCell>
              </TableRow>
            )}
            {isError && !isLoading && (
              <TableRow>
                <TableCell colSpan={COLUMNS.length} sx={{ textAlign: "center", py: 3 }}>
                  Failed to load referrals.
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              !isError &&
              rows.map((row, i) => (
                <TableRow
                  key={row.id}
                  sx={{
                    bgcolor: i % 2 !== 0 ? "grey.50" : "background.paper",
                    "&:hover": { bgcolor: "#eff6ff" },
                    "&:last-child td": { border: 0 },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: "text.primary", whiteSpace: "nowrap" }}>
                    {row.customer}
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{row.city}</TableCell>
                  <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>{row.dateSignedUp}</TableCell>
                  <TableCell sx={{ color: "text.primary", whiteSpace: "nowrap" }}>{row.planType}</TableCell>
                  <TableCell sx={{ color: "text.secondary", whiteSpace: "nowrap" }}>
                    {row.isSubAffiliate ? "Sub Affiliate" : "Direct"}
                  </TableCell>
                  <TableCell sx={{ color: "text.primary", fontWeight: 500 }}>{row.monthlyElem}</TableCell>
                  <TableCell sx={{ color: "text.primary", fontWeight: 600 }}>{row.commsEarned}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{ height: 20, ...statusChipSx[row.statusColor] }}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider />

      {/* Pagination */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5 }}>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          Showing {(page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, total)} of {total} referrals
        </Typography>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, value) => setPage(value)}
          size="small"
          shape="rounded"
          sx={{
            "& .MuiPaginationItem-root": { fontSize: "0.75rem", minWidth: 28, height: 28 },
            "& .Mui-selected": { bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } },
          }}
        />
      </Box>
    </Card>
  );
}
