import { DealsManager } from "@/components/admin/DealsManager";
import { getDeals } from "@/lib/data";

export default async function AdminDealsPage() {
  const deals = await getDeals();
  return <DealsManager initialDeals={deals} />;
}
