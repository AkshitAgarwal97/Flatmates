import type { Metadata } from "next";
import { PayButton } from "@/components/PayButton";
import { AdSlot, Affiliates } from "@/components/Monetize";
import { SKUS } from "@/lib/pay";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/PageHeader";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — optional boosts · core flatmate matching stays free",
  description:
    "Flatmates.co.in core matching is free. Optional UPI boosts for listing visibility. Zero brokerage on rooms and flatmates.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Pricing"
        title="Optional boosts · free core matching"
        lead="Finding rooms and flatmates stays free. Optional UPI boosts help listings surface higher. Brokerage remains ₹0."
      />
      <AdSlot slot="browse-top" />
      <div className="grid gap-4 md:grid-cols-3">
        {(["boost", "urgent", "pro"] as const).map((sku) => (
          <div key={sku} className="glass rounded-2xl p-5">
            <p className="text-2xl font-semibold">₹{SKUS[sku].amount}</p>
            <p className="muted mt-1 text-sm">{SKUS[sku].label}</p>
            <div className="mt-4">
              <PayButton sku={sku} />
            </div>
            <p className="muted-2 mt-2 text-[11px]">
              Boost/Urgent: open a listing you own, or pay from dashboard.
            </p>
          </div>
        ))}
      </div>
      <Affiliates />
    </div>
  );
}
