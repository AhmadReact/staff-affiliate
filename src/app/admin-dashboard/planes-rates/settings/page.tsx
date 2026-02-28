"use client";

import Swal from "sweetalert2";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import type { PlanRateSettingItem } from "@/store/admin/adminApi";
import {
  useGetPlanRateSettingsQuery,
  useGetAdminCompaniesQuery,
  useGetPlanRateSettingByIdQuery,
  useGenerateMissingPlanRateSettingsMutation,
  useUpdatePlanRateSettingMutation,
} from "@/store/admin/adminApi";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function EditPlanRateSettingForm({
  selectedItem,
  onUpdate,
  onCancel,
  isUpdating,
}: {
  selectedItem: PlanRateSettingItem;
  onUpdate: (
    affiliateDiscount: string,
    subAffiliateDiscount: string,
    totalBillingCycle: string,
  ) => Promise<void>;
  onCancel: () => void;
  isUpdating: boolean;
}) {
  const [affiliateDiscount, setAffiliateDiscount] = useState(
    String(selectedItem.affiliate_discount),
  );
  const [subAffiliateDiscount, setSubAffiliateDiscount] = useState(
    String(selectedItem.sub_affiliate_discount),
  );
  const [totalBillingCycle, setTotalBillingCycle] = useState(
    String(selectedItem.total_billing_cycle),
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          bgcolor: "action.hover",
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          alignItems: "baseline",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            ID
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            {selectedItem.id}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Plan ID
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            {selectedItem.plan_id}
          </Typography>
        </Box>
        <Box sx={{ minWidth: 0, flex: "1 1 140px" }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Plan Name
          </Typography>
          <Typography variant="subtitle2" fontWeight={600} noWrap title={selectedItem.plan?.name ?? "—"}>
            {selectedItem.plan?.name ?? "—"}
          </Typography>
        </Box>
      </Paper>
      <TextField
        label="Affiliate Discount"
        type="number"
        value={affiliateDiscount}
        onChange={(e) => setAffiliateDiscount(e.target.value)}
        fullWidth
        size="small"
        inputProps={{ step: 0.01, min: 0 }}
      />
      <TextField
        label="Sub Affiliate Discount"
        type="number"
        value={subAffiliateDiscount}
        onChange={(e) => setSubAffiliateDiscount(e.target.value)}
        fullWidth
        size="small"
        inputProps={{ step: 0.01, min: 0 }}
      />
      <TextField
        label="Total Billing Cycle"
        type="number"
        value={totalBillingCycle}
        onChange={(e) => setTotalBillingCycle(e.target.value)}
        fullWidth
        size="small"
        inputProps={{ min: 0, step: 1 }}
      />
      <DialogActions sx={{ px: 0, pb: 0 }}>
        <Button onClick={onCancel} disabled={isUpdating}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() =>
            onUpdate(affiliateDiscount, subAffiliateDiscount, totalBillingCycle)
          }
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Box>
  );
}

export default function AdminPlanSettingsPage() {
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );
  const { data: apiCompanies } = useGetAdminCompaniesQuery();
  const selectedCompany = useMemo(() => {
    if (!selectedCompanyId || !apiCompanies) return null;
    const company = apiCompanies.find(
      (c) => String((c as { id: string | number }).id) === selectedCompanyId,
    );
    return company ?? null;
  }, [selectedCompanyId, apiCompanies]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useGetPlanRateSettingsQuery({
    company_id: selectedCompanyId ?? undefined,
    page: page + 1,
    page_size: rowsPerPage,
    });

  const [
    generateMissingPlans,
    { isLoading: isGenerating, isError: isGenerateError, error: generateError },
  ] = useGenerateMissingPlanRateSettingsMutation();

  const { data: selectedItem, isLoading: isLoadingDetail } =
    useGetPlanRateSettingByIdQuery(selectedId!, {
      skip: selectedId == null,
    });

  const [updatePlanRateSetting, { isLoading: isUpdating }] =
    useUpdatePlanRateSettingMutation();

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  const handleGenerateMissingPlans = async () => {
    try {
      await generateMissingPlans().unwrap();
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Missing plans generated successfully.",
      });
    } catch {
      // Error is handled via isGenerateError / generateError
    }
  };

  const handleCloseModal = () => {
    setSelectedId(null);
  };

  const handleUpdate = async (
    affiliateDiscount: string,
    subAffiliateDiscount: string,
    totalBillingCycle: string,
  ) => {
    if (selectedId == null) return;
    const ad = Number(affiliateDiscount);
    const sad = Number(subAffiliateDiscount);
    const tbc = Number(totalBillingCycle);
    if (Number.isNaN(ad) || Number.isNaN(sad) || Number.isNaN(tbc)) {
      await Swal.fire({
        icon: "error",
        title: "Invalid values",
        text: "Please enter valid numbers.",
      });
      return;
    }
    try {
      await updatePlanRateSetting({
        id: selectedId,
        affiliate_discount: ad,
        sub_affiliate_discount: sad,
        total_billing_cycle: tbc,
      }).unwrap();
      handleCloseModal();
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Plan rate setting updated successfully.",
      });
    } catch {
      // Error could be shown via Swal or inline
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Plan Settings
          {selectedCompany ? (
            <Typography
              component="span"
              sx={{ ml: 1, fontSize: "0.85rem", color: "text.secondary" }}
            >
              — {selectedCompany.name}
            </Typography>
          ) : null}
        </Typography>

        <Button
          variant="contained"
          size="small"
          onClick={handleGenerateMissingPlans}
          disabled={isGenerating || !selectedCompanyId}
        >
          {isGenerating ? "Generating..." : "Generate Missing Plans"}
        </Button>
      </Box>

      {isError && (
        <Alert severity="error">
          {error && "status" in error
            ? (error as { data?: { message?: string } })?.data?.message ??
              "Failed to load plan rate settings"
            : "Failed to load plan rate settings"}
        </Alert>
      )}

      {isGenerateError && (
        <Alert severity="error">
          {generateError && "status" in generateError
            ? (
                generateError as {
                  data?: { message?: string };
                }
              )?.data?.message ?? "Failed to generate missing plans"
            : "Failed to generate missing plans"}
        </Alert>
      )}

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 280,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 520 }}>
              <Table stickyHeader size="small" aria-label="plan settings table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Plan Name</TableCell>
                    <TableCell align="right">Affiliate Discount</TableCell>
                    <TableCell align="right">Sub Affiliate Discount</TableCell>
                    <TableCell align="right">Total Billing Cycle</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No rows
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow
                        hover
                        key={row.id}
                        onClick={() => setSelectedId(row.id)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.plan?.name ?? "—"}</TableCell>
                        <TableCell align="right">
                          {row.affiliate_discount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell align="right">
                          {row.sub_affiliate_discount.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {row.total_billing_cycle}
                        </TableCell>
                        <TableCell>{formatDate(row.created_at)}</TableCell>
                        <TableCell>{formatDate(row.updated_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              rowsPerPageOptions={[25, 50, 100]}
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <Dialog open={selectedId != null} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Plan Rate Setting</DialogTitle>
        <DialogContent>
          {isLoadingDetail ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress />
            </Box>
          ) : selectedItem ? (
            <EditPlanRateSettingForm
              key={selectedId ?? 0}
              selectedItem={selectedItem}
              onUpdate={handleUpdate}
              onCancel={handleCloseModal}
              isUpdating={isUpdating}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

