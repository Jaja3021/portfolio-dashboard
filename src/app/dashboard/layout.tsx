import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getNotificationCounts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const counts = await getNotificationCounts();

  return (
    <div className="admin-light flex min-h-screen bg-muted">
      <AdminSidebar
        inquiriesCount={counts.inquiries}
        viewingRequestsCount={counts.viewingRequests}
        notificationsCount={counts.inquiries + counts.viewingRequests}
      />
      <div className="flex-1">
        {!isSupabaseConfigured && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-center text-sm text-amber-800">
            Supabase isn&apos;t connected — showing local sample data. Add-ons/edits won&apos;t be saved
            until a project is connected.
          </div>
        )}
        <main className="p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
