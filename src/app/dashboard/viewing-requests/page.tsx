import { ViewingRequestsManager } from "@/components/admin/ViewingRequestsManager";
import { getViewingRequests } from "@/lib/data";

export default async function AdminViewingRequestsPage() {
  const requests = await getViewingRequests();
  return <ViewingRequestsManager initialRequests={requests} />;
}
