import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { ChatInbox } from "@/components/ChatInbox";
import { PageHeader } from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: "Chat",
  description: "Private in-app chat on Flatmates.co.in.",
  path: "/chat",
  noIndex: true,
});

export default async function ChatListPage() {
  const user = await currentUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-8">
      <PageHeader kicker="Chat" title="In-app chat" lead="Messages stay in-app. New replies appear here automatically." />
      <ChatInbox />
    </div>
  );
}
