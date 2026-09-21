import { DashboardShell } from "@/components/admin/DashboardShell";
import { getNotificationCounts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const counts = await getNotificationCounts();

  return (
    <div className="admin-light">
      <DashboardShell
        inquiriesCount={counts.inquiries}
        viewingRequestsCount={counts.viewingRequests}
        conversationsCount={counts.conversations}
        notificationsCount={counts.inquiries + counts.viewingRequests}
      >
        {!isSupabaseConfigured && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800 sm:px-6">
            Supabase isn&apos;t connected — showing local sample data. Add-ons/edits won&apos;t be saved
            until a project is connected.
          </div>
        )}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </DashboardShell>
    </div>
  );
}
