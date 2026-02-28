"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import RequireAuth from "@/components/RequireAuth";

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RequireAuth allowedUserTypes={["customer"]}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-3 sm:p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
