"use client";

import { useState, ChangeEvent } from "react";
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
import { useAppSelector } from "@/store/hooks";
import {
  useGetAdminCompaniesQuery,
  useGetAdminAffiliateCustomersQuery,
  useGetAdminSubscriptionBalancesQuery,
} from "@/store/admin/adminApi";
import type { AdminAffiliateCustomer } from "@/store/admin/adminApi";

export default function AdminBalancesPage() {
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );
  const { data: apiCompanies } = useGetAdminCompaniesQuery();
  const selectedCompany =
    apiCompanies?.find(
      (company) => String((company as any).id) === selectedCompanyId,
    ) ?? null;
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminAffiliateCustomer | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const { data: customersResponse, isLoading } =
    useGetAdminAffiliateCustomersQuery({
      search_query: search || undefined,
      page: page + 1,
      page_size: 1000,
    });

  const rows = customersResponse?.data ?? [];
  const customersTotal = customersResponse?.total ?? 0;

  const { data: balancesResponse, isLoading: balancesLoading } =
    useGetAdminSubscriptionBalancesQuery(
      selectedCustomer
        ? {
            customer_id: selectedCustomer.customer.id,
            page: page + 1,
            page_size: rowsPerPage,
          }
        : { page: page + 1, page_size: rowsPerPage },
    );

  const balanceRows = balancesResponse?.data ?? [];
  const balancesTotal = balancesResponse?.total ?? 0;

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
        Balances
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
          justifyContent: "flex-start",
          mb: 1,
        }}
      >
        <Autocomplete
          size="small"
          sx={{ width: 360, maxWidth: "100%" }}
          options={rows}
          value={selectedCustomer}
          loading={isLoading}
          getOptionLabel={(option) =>
            option?.customer
              ? `${option.customer.id} - ${option.customer.name}`
              : ""
          }
          onChange={(_, newValue) => {
            setSelectedCustomer(newValue);
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
      </Box>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small" aria-label="balances table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Claimable</TableCell>
                <TableCell>Claimed</TableCell>
                <TableCell>Claim ID</TableCell>
                <TableCell>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balancesLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading balances...
                  </TableCell>
                </TableRow>
              ) : balanceRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {selectedCustomer
                      ? "No balances for selected customer"
                      : "No balances"}
                  </TableCell>
                </TableRow>
              ) : (
                balanceRows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.affiliate_customer?.id}</TableCell>
                    <TableCell>{row.affiliate_customer?.name}</TableCell>
                    <TableCell align="right">
                      {row.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{String(row.claimable)}</TableCell>
                    <TableCell>{String(row.claimed)}</TableCell>
                    <TableCell>{row.claim_id}</TableCell>
                    <TableCell>{row.created_at}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[25, 50, 100]}
          count={balancesTotal}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
