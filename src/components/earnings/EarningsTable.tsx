"use client";
import { useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import {
  useGetAffiliateWalletEarningsQuery,
  type AffiliateWalletEarningsResponse,
} from "@/store/customer/customerApi";

type EarningStatus = "Paid" | "Claimable" | "Pending" | "Claimable in 12 days";

interface Earning {
  id: number;
  date: string;
  description: string;
  descSub: string | null;
  descAmount: string | null;
  type: string;
  customer: string;
  customerSub: string | null;
  status: EarningStatus | string;
  amount: string;
  running: string;
  amountColor: string;
}

const statusConfig: Record<string, string> = {
  Paid: "bg-blue-600 text-white",
  Claimable: "bg-teal-400 text-white",
  Pending: "bg-orange-300 text-white",
};

function getStatusClass(label: string): string {
  if (label.startsWith("Claimable in ")) {
    return "bg-blue-100 text-blue-700 border border-blue-200";
  }
  return statusConfig[label] ?? "bg-gray-100 text-gray-600";
}

function mapApiToEarnings(
  api: AffiliateWalletEarningsResponse | undefined,
): Earning[] {
  if (!api || !api.data) return [];

  return api.data.map((item) => {
    const date = item.date
      ? new Date(item.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "—";

    let statusLabel: string;
    switch (item.status) {
      case "paid":
        statusLabel = "Paid";
        break;
      case "claimable":
        statusLabel = "Claimable";
        break;
      case "payment_pending":
        statusLabel = "Pending";
        break;
      case "claimable_in_x_days":
        if (item.claimable_in_days != null) {
          statusLabel = `Claimable in ${item.claimable_in_days} days`;
        } else {
          statusLabel = "Claimable in 12 days";
        }
        break;
      default:
        statusLabel = item.status;
    }

    const isPayout = item.entry_type === "payout";

    const amountAbs = Math.abs(item.amount);
    const amountFormatted = `$${amountAbs.toFixed(2)}`;
    const amountDisplay = item.amount < 0 ? `-${amountFormatted}` : amountFormatted;
    const amountColor = item.amount < 0 ? "text-red-500" : "text-gray-800";

    const running = `$${item.running_balance.toFixed(2)}`;

    const customer =
      item.customer_name ??
      (isPayout
        ? "Bank Account"
        : "N/A");

    const customerSub =
      item.customer_info ?? (item.customer_name ? null : "N/A");

    const descSub =
      item.affiliate_type === "sub_affiliate"
        ? "Sub Affiliate"
        : item.affiliate_type === "affiliate"
          ? "Affiliate"
          : null;

    const descAmount =
      !isPayout && item.customer_info ? item.customer_info : null;

    return {
      id: item.id,
      date,
      description: isPayout ? "Payout" : item.description ?? "Earning",
      descSub,
      descAmount,
      type: item.entry_type,
      customer,
      customerSub,
      status: statusLabel,
      amount: amountDisplay,
      running,
      amountColor,
    };
  });
}

interface ColumnDef {
  label: string;
  sortable: boolean;
}

const columns: ColumnDef[] = [
  { label: "DATE", sortable: false },
  { label: "DESCRIPTION", sortable: false },
  { label: "CUSTOMER / AFFILIATE", sortable: true },
  { label: "STATUS", sortable: false },
  { label: "AMOUNT", sortable: false },
  { label: "RUNNING", sortable: false },
];

export default function EarningsTable() {
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const tabs = ["All", "Claimable", "Pending", "Paid"];
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading, isError } = useGetAffiliateWalletEarningsQuery({
    page,
    page_size: pageSize,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
  });

  const allRows = mapApiToEarnings(data);

  const filteredEarnings = allRows.filter((row) => {
    if (activeTab === "All") return true;
    return row.status === activeTab;
  });

  const total = data?.total ?? filteredEarnings.length;
  const effectivePageSize = data?.page_size ?? pageSize;
  const pageCount = Math.max(1, Math.ceil(total / effectivePageSize));
  const startIndex = (page - 1) * effectivePageSize;
  const paginatedEarnings = filteredEarnings;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Filter bar */}
        <Box className="flex flex-wrap items-center gap-2 px-4 sm:px-5 py-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
            <button className="text-gray-400 hover:text-gray-600 px-2">
              <MoreHorizontal size={15} />
            </button>
          </div>

          <Box
            sx={{
              ml: { sm: "auto" },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TextField
              type="date"
              size="small"
              value={dateFrom}
              onChange={(e) => {
                setPage(1);
                setDateFrom(e.target.value);
              }}
              label="From"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 140 }}
            />
            <TextField
              type="date"
              size="small"
              value={dateTo}
              onChange={(e) => {
                setPage(1);
                setDateTo(e.target.value);
              }}
              label="To"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 140 }}
            />
          </Box>
        </Box>

        {/* Section title */}
        <Box className="px-5 py-3 border-b border-gray-100">
          <Typography
            variant="subtitle2"
            className="text-sm font-semibold text-gray-700"
          >
            {/* Earnings Breakdown */}
          </Typography>
        </Box>

        {/* Table */}
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow className="bg-gray-50 border-b border-gray-100">
                {columns.map(({ label, sortable }) => (
                  <TableCell
                    key={label}
                    className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {sortable && (
                        <ArrowUpDown size={10} className="text-gray-300" />
                      )}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    Loading earnings...
                  </TableCell>
                </TableRow>
              )}
              {isError && !isLoading && (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    Failed to load earnings.
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                !isError &&
                paginatedEarnings.map((row, i) => (
                <TableRow
                  key={row.id}
                  className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* Date */}
                  <TableCell className="px-4 py-3 text-gray-600 whitespace-nowrap font-medium">
                    {row.date}
                  </TableCell>

                  {/* Description */}
                  <TableCell className="px-4 py-3">
                    <p className="font-semibold text-gray-700">
                      {row.description}
                    </p>
                    {row.descAmount && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {row.descAmount}
                      </p>
                    )}
                    {row.descSub && (
                      <p className="text-[10px] text-gray-400">{row.descSub}</p>
                    )}
                  </TableCell>

                  {/* Customer / Affiliate */}
                  <TableCell className="px-4 py-3">
                    <p className="font-semibold text-gray-700 whitespace-nowrap">
                      {row.customer}
                    </p>
                    {row.customerSub && (
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {row.customerSub}
                      </p>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${
                        getStatusClass(row.status)
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>

                  {/* Amount */}
                  <TableCell
                    className={`px-4 py-3 font-bold whitespace-nowrap ${row.amountColor}`}
                  >
                    {row.amount}
                  </TableCell>

                  {/* Running */}
                  <TableCell className="px-4 py-3 font-semibold text-gray-700 whitespace-nowrap">
                    {row.running}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        {/* Pagination */}
        <Box className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-t border-gray-100">
          <Typography variant="caption" className="text-xs text-gray-400">
            Showing {total === 0 ? 0 : startIndex + 1}–
            {Math.min(startIndex + effectivePageSize, total)} of {total} transactions
          </Typography>
          <div className="flex items-center gap-1">
            <button
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-default"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: pageCount }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                  p === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-default"
              disabled={page === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </Box>
      </CardContent>
    </Card>
  );
}
