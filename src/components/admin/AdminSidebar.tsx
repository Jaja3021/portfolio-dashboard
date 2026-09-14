"use client";

import {
  BellIcon as Bell,
  CalendarBlankIcon as CalendarDays,
  ChatsCircleIcon as ChatsCircle,
  ClipboardTextIcon as ClipboardList,
  HandshakeIcon as Handshake,
  HouseIcon as Home,
  SquaresFourIcon as LayoutDashboard,
  ChatCircleTextIcon as MessageSquareText,
  QuotesIcon as Quote,
  GearIcon as Settings,
  UsersIcon as Users,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { PUBLIC_SITE_URL } from "@/lib/site";

const NAV = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/properties", label: "Properties", icon: Home },
  { href: "/dashboard/clients", label: "Clients / Leads", icon: Users },
  { href: "/dashboard/inquiries", label: "Inquiries", icon: MessageSquareText, countKey: "inquiriesCount" },
  {
    href: "/dashboard/viewing-requests",
    label: "Viewing Requests",
    icon: ClipboardList,
    countKey: "viewingRequestsCount",
  },
  { href: "/dashboard/deals", label: "Transactions / Deals", icon: Handshake },
  { href: "/dashboard/conversations", label: "Conversations", icon: ChatsCircle },
  { href: "/dashboard/calendar", label: "Calendar / Schedule", icon: CalendarDays },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, countKey: "notificationsCount" },
  { href: "/dashboard/testimonials", label: "Testimonials", icon: Quote },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

interface AdminSidebarProps {
  inquiriesCount?: number;
  viewingRequestsCount?: number;
  notificationsCount?: number;
}

export function AdminSidebar({
  inquiriesCount = 0,
  viewingRequestsCount = 0,
  notificationsCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const counts = { inquiriesCount, viewingRequestsCount, notificationsCount };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <p className="text-sm font-bold text-foreground">ARNOLD B. FADRIQUILA</p>
        <p className="text-xs font-medium text-accent">Admin Dashboard</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          const count = "countKey" in item ? counts[item.countKey] : 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-accent-light text-accent-dark" : "text-foreground/60 hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <a
          href={PUBLIC_SITE_URL}
          className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-muted"
        >
          ← View Site
        </a>
        <LogoutButton />
      </div>
    </aside>
  );
}
