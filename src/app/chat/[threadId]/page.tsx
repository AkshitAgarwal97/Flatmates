import { ChatThread } from "@/components/ChatThread";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: { threadId: string } }) {
  const user = await currentUser();
  if (!user) redirect("/login");
  return <ChatThread threadId={params.threadId} />;
}
