import { NotificationsFeed } from "@/components/admin/NotificationsFeed";
import { getInquiries, getViewingRequests } from "@/lib/data";

export default async function AdminNotificationsPage() {
  const [inquiries, viewingRequests] = await Promise.all([getInquiries(), getViewingRequests()]);
  return <NotificationsFeed initialInquiries={inquiries} initialViewingRequests={viewingRequests} />;
}
