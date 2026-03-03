"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {
  useGetAdminWalletPayoutsQuery,
  useApproveAdminWalletPayoutMutation,
} from "@/store/admin/adminApi";
import { useAppSelector } from "@/store/hooks";
import type { AdminWalletPayout } from "@/store/admin/adminApi";

type SortDirection = "asc" | "desc";

export default function AdminPayoutsPage() {
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );
  const [status, setStatus] = useState<"all" | "pending" | "paid" | "rejected">(
    "all",
  );
  const [customerId, setCustomerId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortField, setSortField] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<SortDirection | undefined>(undefined);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<AdminWalletPayout | null>(
    null,
  );
  const [approvedAmount, setApprovedAmount] = useState<string>("");
  const [referenceNum, setReferenceNum] = useState("");
  const [note, setNote] = useState("");

  const [approvePayout, { isLoading: isApproving }] =
    useApproveAdminWalletPayoutMutation();

  const { data: payoutsResponse, isLoading } = useGetAdminWalletPayoutsQuery({
    company_id: selectedCompanyId || undefined,
    status: status === "all" ? undefined : status,
    customer_id: customerId ? Number(customerId) : undefined,
    search_query: search || undefined,
    date_from: dateFrom || undefined,
    date_to: dateTo || undefined,
    page: page + 1,
    page_size: rowsPerPage,
    sort_field: sortField,
    sort_dir: sortDir,
  });

  const rows = payoutsResponse?.data ?? [];
  const total = payoutsResponse?.total ?? 0;

  const openApproveDialog = (payout: AdminWalletPayout) => {
    setSelectedPayout(payout);
    setApprovedAmount(
      payout.approved_amount != null
        ? String(payout.approved_amount)
        : String(payout.amount),
    );
    setReferenceNum("");
    setNote("");
    setApproveDialogOpen(true);
  };

  const closeApproveDialog = () => {
    setApproveDialogOpen(false);
    setSelectedPayout(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Payouts
      </Typography>

      <Paper sx={{ p: 2, mb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <TextField
            size="small"
            label="Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <TextField
            size="small"
            label="Search (name)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <TextField
            size="small"
            label="Date from"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            label="Date to"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden", p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 1 }}>
          <Tabs
            value={status}
            onChange={(_event, newValue) => {
              setStatus(newValue);
              setPage(0);
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="All" value="all" />
            <Tab label="Pending" value="pending" />
            <Tab label="Paid" value="paid" />
            <Tab label="Rejected" value="rejected" />
          </Tabs>
        </Box>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small" aria-label="payouts table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Affiliate Customer ID</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Approved Amount</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Approved Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading payouts...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No payouts found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.customer_name}</TableCell>
                    <TableCell>{row.affiliate_customer_id}</TableCell>
                    <TableCell align="right">
                      {row.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell align="right">
                      {row.approved_amount != null
                        ? row.approved_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>{row.created_at}</TableCell>
                    <TableCell>{row.approved_date ?? "-"}</TableCell>
                    <TableCell align="right">
                      {row.status === "pending" ? (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => openApproveDialog(row)}
                        >
                          Approve
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[20, 50, 100, 200, 500, 1000]}
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog
        open={approveDialogOpen}
        onClose={closeApproveDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Approve Claim</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {selectedPayout ? (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Customer: <strong>{selectedPayout.customer_name}</strong>
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Requested Amount:{" "}
                  <strong>
                    {selectedPayout.amount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" align="right">
                  Preferred Payment:{" "}
                  <strong>{selectedPayout.preferred_payment}</strong>
                </Typography>
              </Box>
            </Box>
          ) : null}
          <Box
            component="form"
            onSubmit={async (event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              if (!selectedPayout) return;

              const amountNumber = Number(approvedAmount);
              if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
                return;
              }

              try {
                await approvePayout({
                  payoutId: selectedPayout.id,
                  approved_amount: amountNumber,
                  reference_num: referenceNum,
                  note,
                }).unwrap();
                closeApproveDialog();
              } catch {
                // Optionally handle error state or show a message
              }
            }}
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Approved Amount"
              type="number"
              size="small"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(e.target.value)}
              required
              inputProps={{ min: 0, step: "0.01" }}
            />
            <TextField
              label="Reference Number (Invoice/Cheque/Transfer)"
              size="small"
              value={referenceNum}
              onChange={(e) => setReferenceNum(e.target.value)}
              required
            />
            <TextField
              label="Note"
              size="small"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              minRows={2}
            />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={closeApproveDialog} disabled={isApproving}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isApproving || !approvedAmount || !referenceNum}
              >
                Submit
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
