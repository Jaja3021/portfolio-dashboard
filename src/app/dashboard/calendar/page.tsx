import { CalendarView } from "@/components/admin/CalendarView";
import { getClients, getViewingRequests } from "@/lib/data";

export default async function AdminCalendarPage() {
  const [viewingRequests, clients] = await Promise.all([getViewingRequests(), getClients()]);
  return <CalendarView viewingRequests={viewingRequests} clients={clients} />;
}
