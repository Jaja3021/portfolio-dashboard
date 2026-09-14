import { ClientsManager } from "@/components/admin/ClientsManager";
import { getClients } from "@/lib/data";

export default async function AdminClientsPage() {
  const clients = await getClients();
  return <ClientsManager initialClients={clients} />;
}
