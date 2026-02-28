import { createContext, useContext, useState, ReactNode } from "react";

export interface AdminCompany {
  id: string;
  name: string;
}

interface AdminCompanyContextValue {
  companies: AdminCompany[];
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string | null) => void;
  selectedCompany: AdminCompany | null;
}

const AdminCompanyContext = createContext<AdminCompanyContextValue | undefined>(
  undefined,
);

const DEFAULT_COMPANIES: AdminCompany[] = [
  { id: "1", name: "Company A" },
  { id: "2", name: "Company B" },
  { id: "3", name: "Company C" },
];

export function AdminCompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    DEFAULT_COMPANIES[0]?.id ?? null,
  );

  const selectedCompany =
    DEFAULT_COMPANIES.find((c) => c.id === selectedCompanyId) ?? null;

  return (
    <AdminCompanyContext.Provider
      value={{
        companies: DEFAULT_COMPANIES,
        selectedCompanyId,
        setSelectedCompanyId,
        selectedCompany,
      }}
    >
      {children}
    </AdminCompanyContext.Provider>
  );
}

export function useAdminCompany() {
  const ctx = useContext(AdminCompanyContext);
  if (!ctx) {
    throw new Error("useAdminCompany must be used within AdminCompanyProvider");
  }
  return ctx;
}

