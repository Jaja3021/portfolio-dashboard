import { PropertiesManager } from "@/components/admin/PropertiesManager";
import { getProperties } from "@/lib/data";

export default async function AdminPropertiesPage() {
  const properties = await getProperties();
  return <PropertiesManager initialProperties={properties} />;
}
