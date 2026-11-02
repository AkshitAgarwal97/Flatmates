import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata, SITE_OWNER_NAME, SUPPORT_EMAIL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact support",
  description: "Contact Flatmates.co.in support for listing, safety, or billing help.",
  path: "/contact",
});

const TOPICS = [
  ["Listing help", "Posting, edits, expiry, photos, or a listing that will not go live."],
  ["Safety & reports", "Broker spam, fake rent, or someone asking you to pay off-platform."],
  ["Billing", "UPI boosts, urgent tags, or a Verified Pro badge."],
];

export default function ContactPage() {
  const mail = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Flatmates.co.in support")}`;
  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Support"
        title="Contact support"
        lead={`Operated by ${SITE_OWNER_NAME}. Chat between members stays in-app. Use email for account, safety, and billing.`}
      />
      <div className="grid gap-4 md:grid-cols-3">
        {TOPICS.map(([t, d]) => (
          <div key={t} className="glass rounded-2xl p-5">
            <h2 className="font-semibold">{t}</h2>
            <p className="muted mt-2 text-sm">{d}</p>
          </div>
        ))}
      </div>
      <div className="glass rounded-3xl p-6">
        <p className="text-sm muted">Email</p>
        <a href={mail} className="mt-1 block text-xl font-semibold kicker">
          {SUPPORT_EMAIL}
        </a>
        <p className="muted mt-3 text-sm">
          Include your listing URL if you have one. Do not send passwords. For an active conversation with a flatmate,
          use{" "}
          <Link href="/chat" className="kicker hover:underline">
            in-app chat
          </Link>
          .
        </p>
        <a href={mail} className="btn mt-4">
          Email support
        </a>
      </div>
    </div>
  );
}
