"use client";

import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useGetAdminCompaniesQuery } from "@/store/admin/adminApi";
import { setSelectedCompanyId } from "@/store/slices/adminCompanySlice";

export default function AdminCompanySelector() {
  const dispatch = useAppDispatch();
  const selectedCompanyId = useAppSelector(
    (state) => state.adminCompany.selectedCompanyId,
  );

  const { data: apiCompanies } = useGetAdminCompaniesQuery();

  const companies = useMemo(
    () =>
      apiCompanies?.map((company) => ({
        id: String((company as any).id),
        name: company.name,
      })) ?? [],
    [apiCompanies],
  );

  const selectedCompany = useMemo(
    () =>
      companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      dispatch(setSelectedCompanyId(companies[0].id));
    }
  }, [selectedCompanyId, companies, dispatch]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
        {selectedCompany && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 0.25 }}
          >
            Showing data for{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 500, color: "text.primary" }}
            >
              {selectedCompany.name}
            </Typography>
          </Typography>
        )}
      </Box>

      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="admin-company-select-label">Select Company</InputLabel>
        <Select
          labelId="admin-company-select-label"
          label="Select Company"
          value={selectedCompanyId ?? ""}
          onChange={(event) => {
            const value = event.target.value as string;
            dispatch(setSelectedCompanyId(value || null));
          }}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

