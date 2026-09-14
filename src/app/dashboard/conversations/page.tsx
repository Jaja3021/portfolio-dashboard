import { ConversationsManager } from "@/components/admin/ConversationsManager";
import { getConversations } from "@/lib/data";

export default async function AdminConversationsPage() {
  const conversations = await getConversations();
  return <ConversationsManager initialConversations={conversations} />;
}
