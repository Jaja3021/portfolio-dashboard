"use client";

import { ListIcon as Menu } from "@phosphor-icons/react/ssr";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface DashboardShellProps {
  inquiriesCount: number;
  viewingRequestsCount: number;
  conversationsCount: number;
  notificationsCount: number;
  children: React.ReactNode;
}

export function DashboardShell({
  inquiriesCount,
  viewingRequestsCount,
  conversationsCount,
  notificationsCount,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted">
      <AdminSidebar
        inquiriesCount={inquiriesCount}
        viewingRequestsCount={viewingRequestsCount}
        conversationsCount={conversationsCount}
        notificationsCount={notificationsCount}
        open={open}
        onClose={() => setOpen(false)}
      />
      <div className="flex min-h-screen min-w-0 flex-col md:ml-64">
        <div className="flex items-center gap-3 border-b border-border bg-white px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-1.5 text-foreground/60 hover:bg-muted"
          >
            <Menu className="h-6 w-6" />
          </button>
          <p className="text-sm font-bold text-foreground">Admin Dashboard</p>
        </div>
        {children}
      </div>
    </div>
  );
}
