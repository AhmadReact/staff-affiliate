"use client";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import { useMemo, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useGetAdminCompaniesQuery } from "@/store/admin/adminApi";

interface CustomerRateRow {
  id: number;
  customerId: number;
  customerName: string;
  planName: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: string;
  createdAt: string;
}

const mockRows: CustomerRateRow[] = [];

export default function AdminCustomerRatesPage() {
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );
  const { data: companies = [] } = useGetAdminCompaniesQuery();
  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const pagedRows = mockRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

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

      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small" aria-label="customer rates table">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Customer ID</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell>Effective From</TableCell>
                <TableCell>Effective To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No rows
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.customerId}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell>{row.planName}</TableCell>
                    <TableCell align="right">
                      {row.rate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{row.effectiveFrom}</TableCell>
                    <TableCell>{row.effectiveTo ?? "-"}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.createdAt}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPageOptions={[25, 50, 100]}
          count={mockRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

