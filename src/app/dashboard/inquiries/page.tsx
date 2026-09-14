import { InquiriesManager } from "@/components/admin/InquiriesManager";
import { getInquiries } from "@/lib/data";

export default async function AdminInquiriesPage() {
  const inquiries = await getInquiries();
  return <InquiriesManager initialInquiries={inquiries} />;
}
