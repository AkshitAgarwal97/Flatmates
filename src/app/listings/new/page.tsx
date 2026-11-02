import type { Metadata } from "next";
import { ListingForm } from "@/components/ListingForm";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Post a room or flatmate listing",
  description:
    "Post a room share, seeker profile, or entire flat on Flatmates.co.in — free, ₹0 brokerage, phone numbers private.",
  path: "/listings/new",
  noIndex: true,
});

export default async function NewListingPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Post"
        title="Post a listing"
        lead="Choose a mode. Listings auto-expire in 21 days. Phone numbers stay private."
      />
      <ListingForm />
    </div>
  );
}
