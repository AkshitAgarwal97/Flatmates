import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { getDb } from "@/lib/store";
import { redirect } from "next/navigation";
import { DashboardActions } from "@/components/DashboardActions";
import { PayButton } from "@/components/PayButton";
import { ListingCard } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";
import { VerifyCta } from "@/components/VerifyCta";
import { listingPath, pageMetadata } from "@/lib/seo";
import { postersById, verifiedLabel } from "@/lib/listing-ui";

export const metadata: Metadata = pageMetadata({
  title: "Dashboard",
  description: "Manage your Flatmates.co.in listings and favorites.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  const db = await getDb();
  const mine = db.listings.filter((l) => l.userId === user.id);
  const saved = db.listings.filter((l) => user.favorites.includes(l.id));
  const emails = db.emails.filter((e) => e.to === user.email).slice(-6);
  const notices = db.notices.filter((n) => n.userId === user.id).slice(-8);
  const views = mine.reduce((s, l) => s + (l.views || 0), 0);
  const posters = postersById(db.users);
  const badge = verifiedLabel(user);

  return (
    <div className="space-y-8">
      <PageHeader
        kicker="Account"
        title={user.name || user.email || "Account"}
        lead={`${user.email} · ${badge || "Unverified — use a company or college email below"}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <PayButton sku="pro" />
            <DashboardActions />
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Listings", mine.length],
          ["Views", views],
          ["Saved", saved.length],
          ["Orders", db.orders.filter((o) => o.userId === user.id).length],
        ].map(([k, v]) => (
          <div key={String(k)} className="glass rounded-2xl p-4">
            <p className="muted-2 text-xs">{k}</p>
            <p className="text-2xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
      <VerifyCta email={user.email} verified={badge} />
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((l) => (
          <div key={l.id} className="glass rounded-2xl p-4">
            <p className="kicker text-xs uppercase">
              {l.status} · {l.views} views
            </p>
            <a href={listingPath(l)} className="font-semibold">
              {l.title}
            </a>
            <DashboardActions listingId={l.id} />
            <div className="mt-2 flex flex-wrap gap-2">
              <PayButton sku="boost" listingId={l.id} />
              <PayButton sku="urgent" listingId={l.id} />
            </div>
          </div>
        ))}
      </div>
      {saved.length > 0 && (
        <div>
          <h2 className="mb-3 font-semibold">Saved</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {saved.map((l) => (
              <ListingCard key={l.id} listing={l} poster={posters[l.userId]} />
            ))}
          </div>
        </div>
      )}
      <div className="glass rounded-2xl p-4">
        <h2 className="font-semibold">Notifications</h2>
        <ul className="muted mt-2 space-y-2 text-sm">
          {notices.map((n) => (
            <li key={n.id}>{n.text}</li>
          ))}
          {emails.map((e) => (
            <li key={e.at + e.subject}>{e.subject}</li>
          ))}
          {!notices.length && !emails.length && <li>No alerts yet.</li>}
        </ul>
      </div>
    </div>
  );
}
