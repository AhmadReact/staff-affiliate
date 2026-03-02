"use client";

import { useMemo, useState, ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { useAppSelector } from "@/store/hooks";
import {
  useGetAdminCompaniesQuery,
  useGetAdminAffiliateCustomersQuery,
  useGetAdminCustomerPlanRatesQuery,
  useGetCustomerPlanRateByIdQuery,
  useGenerateMissingCustomerPlanRatesMutation,
  useUpdateCustomerPlanRateMutation,
  useGenerateMissingReferredSubscriptionsMutation,
} from "@/store/admin/adminApi";
import type {
  AdminAffiliateCustomer,
  CustomerPlanRateItem,
} from "@/store/admin/adminApi";

function EditRateForm({
  selectedRate,
  onUpdate,
  onCancel,
  updateLoading,
}: {
  selectedRate: CustomerPlanRateItem;
  onUpdate: (
    affiliate_discount: number,
    sub_affiliate_discount: number,
    total_billing_cycle: number,
  ) => void;
  onCancel: () => void;
  updateLoading: boolean;
}) {
  const [affiliateDiscount, setAffiliateDiscount] = useState(
    String(selectedRate.affiliate_discount),
  );
  const [subAffiliateDiscount, setSubAffiliateDiscount] = useState(
    String(selectedRate.sub_affiliate_discount),
  );
  const [totalBillingCycle, setTotalBillingCycle] = useState(
    String(selectedRate.total_billing_cycle),
  );
  const [isUnlimited, setIsUnlimited] = useState(
    selectedRate.total_billing_cycle === -1,
  );

  const handleToggleUnlimited = () => {
    setIsUnlimited((prev) => {
      const next = !prev;
      if (next) {
        setTotalBillingCycle("-1");
      } else if (totalBillingCycle === "-1") {
        setTotalBillingCycle("");
      }
      return next;
    });
  };

  const handleSubmit = () => {
    onUpdate(
      parseFloat(affiliateDiscount) || 0,
      parseFloat(subAffiliateDiscount) || 0,
      parseInt(totalBillingCycle, 10) || 0,
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: "action.hover",
          borderColor: "divider",
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Chip
              label={`ID ${selectedRate.id}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
            />
            <Chip
              label={`Plan #${selectedRate.plan_id}`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontVariantNumeric: "tabular-nums" }}
            />
          </Stack>
          <Stack spacing={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              Plan
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedRate.plan?.name ?? "—"}
            </Typography>
          </Stack>
          <Stack spacing={0.5}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={500}
            >
              Customer
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedRate.customer?.name ?? "—"}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
      <TextField
        label="Affiliate Discount"
        type="number"
        size="small"
        fullWidth
        value={affiliateDiscount}
        onChange={(e) => setAffiliateDiscount(e.target.value)}
        inputProps={{ step: 0.01, min: 0 }}
      />
      <TextField
        label="Sub Affiliate Discount"
        type="number"
        size="small"
        fullWidth
        value={subAffiliateDiscount}
        onChange={(e) => setSubAffiliateDiscount(e.target.value)}
        inputProps={{ step: 0.01, min: 0 }}
      />
      <Stack spacing={0.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            label="Total Billing Cycle"
            type="number"
            size="small"
            fullWidth
            value={totalBillingCycle}
            onChange={(e) => {
              const value = e.target.value;
              setTotalBillingCycle(value);
              setIsUnlimited(value === "-1");
            }}
            inputProps={{ min: 0, step: 1 }}
            disabled={isUnlimited}
          />
          <Button
            variant={isUnlimited ? "contained" : "outlined"}
            size="small"
            onClick={handleToggleUnlimited}
          >
            Unlimited
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          When set to Unlimited, this sends -1 for total billing cycles.
        </Typography>
      </Stack>
      <DialogActions sx={{ px: 0, pb: 0, pt: 1 }}>
        <Button onClick={onCancel} disabled={updateLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={updateLoading}
        >
          {updateLoading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function AdminCustomerRatesPage() {
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );
  const { data: companies = [] } = useGetAdminCompaniesQuery();
  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminAffiliateCustomer | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRateId, setSelectedRateId] = useState<number | null>(null);

  const { data: customersResponse, isLoading: customersLoading } =
    useGetAdminAffiliateCustomersQuery({
      company_id: selectedCompanyId || undefined,
      search_query: search || undefined,
      page: 1,
      page_size: 1000,
    });

  const customerOptions = customersResponse?.data ?? [];

  const { data: planRatesResponse, isLoading: planRatesLoading } =
    useGetAdminCustomerPlanRatesQuery(
      selectedCustomer
        ? {
            customer_id: selectedCustomer.customer.id,
            page: page + 1,
            page_size: rowsPerPage,
          }
        : { customer_id: 0 }, // skip query when no customer (customer_id 0 will not match)
      { skip: !selectedCustomer },
    );

  const planRatesRows = planRatesResponse?.data ?? [];
  const planRatesTotal = planRatesResponse?.total ?? 0;

  const [generateMissing, { isLoading: generateMissingLoading }] =
    useGenerateMissingCustomerPlanRatesMutation();

  const [
    generateMissingReferredSubscriptions,
    { isLoading: generateMissingReferredLoading },
  ] = useGenerateMissingReferredSubscriptionsMutation();

  const { data: selectedRate, isLoading: selectedRateLoading } =
    useGetCustomerPlanRateByIdQuery(selectedRateId!, {
      skip: selectedRateId == null,
    });

  const [updateRate, { isLoading: updateRateLoading }] =
    useUpdateCustomerPlanRateMutation();

  const handleCloseModal = () => {
    setSelectedRateId(null);
  };

  const handleUpdateRate = async (
    affiliate_discount: number,
    sub_affiliate_discount: number,
    total_billing_cycle: number,
  ) => {
    if (selectedRateId == null) return;
    try {
      await updateRate({
        id: selectedRateId,
        affiliate_discount,
        sub_affiliate_discount,
        total_billing_cycle,
      }).unwrap();
      handleCloseModal();
    } catch {
      // Error could be shown via snackbar if needed
    }
  };

  const handleCreateMissingPlans = () => {
    if (!selectedCustomer) return;
    generateMissing(selectedCustomer.customer.id);
  };

  const handleAddMissingReferredSubscriptions = () => {
    if (!selectedCustomer) return;
    generateMissingReferredSubscriptions(selectedCustomer.customer.id);
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
        Customer Rates
        {selectedCompany ? (
          <Typography
            component="span"
            sx={{ ml: 1, fontSize: "0.85rem", color: "text.secondary" }}
          >
            — {selectedCompany.name}
          </Typography>
        ) : null}
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          mb: 1,
        }}
      >
        <Autocomplete
          size="small"
          sx={{ width: 360, maxWidth: "100%" }}
          options={customerOptions}
          value={selectedCustomer}
          loading={customersLoading}
          getOptionLabel={(option) =>
            option?.customer
              ? `${option.customer.id} - ${option.customer.name}`
              : ""
          }
          onChange={(_, newValue) => {
            setSelectedCustomer(newValue);
            setPage(0);
          }}
          onInputChange={(_, value) => {
            setSearch(value);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select customer"
              placeholder="Search by ID or name"
            />
          )}
        />
        <Button
          variant="contained"
          size="small"
          disabled={!selectedCustomer || generateMissingLoading}
          onClick={handleCreateMissingPlans}
        >
          {generateMissingLoading ? "Creating..." : "Create Missing Plans"}
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={!selectedCustomer || generateMissingReferredLoading}
          onClick={handleAddMissingReferredSubscriptions}
        >
          {generateMissingReferredLoading
            ? "Adding..."
            : "Add missing referred subscriptions"}
        </Button>
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small" aria-label="customer rates table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell align="right">Affiliate Discount</TableCell>
                <TableCell align="right">Sub Affiliate Discount</TableCell>
                <TableCell align="right">Total Billing Cycle</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell>Updated Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!selectedCustomer ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Select a customer to view plan rates
                  </TableCell>
                </TableRow>
              ) : planRatesLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : planRatesRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No plan rates for this customer
                  </TableCell>
                </TableRow>
              ) : (
                planRatesRows.map((row) => (
                  <TableRow
                    hover
                    key={row.id}
                    onClick={() => setSelectedRateId(row.id)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.customer_id}</TableCell>
                    <TableCell>{row.customer?.name ?? "-"}</TableCell>
                    <TableCell>{row.plan?.name ?? "-"}</TableCell>
                    <TableCell align="right">
                      {row.affiliate_discount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {row.sub_affiliate_discount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      {row.total_billing_cycle}
                    </TableCell>
                    <TableCell>{row.created_at}</TableCell>
                    <TableCell>{row.updated_at}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {selectedCustomer && (
          <TablePagination
            component="div"
            rowsPerPageOptions={[25, 50, 100]}
            count={planRatesTotal}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Paper>

      <Dialog
        open={selectedRateId != null}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Plan Rate
          {selectedRate ? ` — ${selectedRate.plan?.name ?? "Plan"}` : ""}
        </DialogTitle>
        <DialogContent>
          {selectedRateLoading ? (
            <Typography color="text.secondary">Loading...</Typography>
          ) : selectedRate ? (
            <EditRateForm
              key={selectedRate.id}
              selectedRate={selectedRate}
              onUpdate={handleUpdateRate}
              onCancel={handleCloseModal}
              updateLoading={updateRateLoading}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
