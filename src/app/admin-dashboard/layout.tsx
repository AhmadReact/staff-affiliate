"use client";

import { useState } from "react";
import RequireAuth from "@/components/RequireAuth";
import Header from "@/components/Header";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminCompanySelector from "@/components/admin/AdminCompanySelector";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RequireAuth allowedUserTypes={["staff"]}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <AdminSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-6">
            <AdminCompanySelector />
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}

