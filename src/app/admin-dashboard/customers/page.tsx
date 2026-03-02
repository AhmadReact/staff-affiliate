"use client";

import { useState, ChangeEvent } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Chip from "@mui/material/Chip";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import {
  useGetAdminAffiliateCustomersQuery,
  type AdminAffiliateCustomer,
} from "@/store/admin/adminApi";
import { useAppSelector } from "@/store/hooks";

export default function AdminCustomersPage() {
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const { data: customersResponse, isLoading } =
    useGetAdminAffiliateCustomersQuery({
      company_id: selectedCompanyId || undefined,
      search_query: search || undefined,
      page: page + 1,
      page_size: rowsPerPage,
    });

  const rows: AdminAffiliateCustomer[] = customersResponse?.data ?? [];
  const total = customersResponse?.total ?? 0;

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
        Customers
      </Typography>

      <Paper sx={{ p: 2, mb: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            size="small"
            label="Search customers"
            placeholder="Search by first or last name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="Clear search"
                    onClick={() => {
                      setSearch("");
                      setPage(0);
                    }}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{ minWidth: 260, maxWidth: 500 }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: { xs: 0, sm: "auto" } }}
          >
            {total.toLocaleString()} customers
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small" aria-label="customers table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Wallet Total</TableCell>
                <TableCell>Pending Payout</TableCell>
                <TableCell>Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading customers...
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{row.customer_id}</TableCell>
                    <TableCell>{row.customer?.name ?? "-"}</TableCell>
                    <TableCell>{row.wallet_total}</TableCell>
                    <TableCell>{row.pending_payout}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.active ? "Active" : "Inactive"}
                        size="small"
                        color={row.active ? "success" : "default"}
                        variant={row.active ? "filled" : "outlined"}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[25, 50, 100, 200]}
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
