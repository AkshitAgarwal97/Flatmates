import Link from "next/link";

export function AdSlot({ slot }: { slot: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  return (
    <aside className="glass rounded-2xl p-3 text-center text-xs muted">
      {client ? (
        <ins className="adsbygoogle block min-h-20" data-ad-client={client} data-ad-slot={slot} />
      ) : (
        <p>Sponsored · AdSense slot {slot} (set NEXT_PUBLIC_ADSENSE_CLIENT when approved)</p>
      )}
    </aside>
  );
}

const PARTNERS = [
  ["Movers", "Packers who work in your metro — ask support to connect you."],
  ["Furniture", "Rental sofas and beds without a long lock-in."],
  ["Cleaning", "Move-in clean before you split the deposit."],
] as const;

export function Affiliates({ city }: { city?: string }) {
  return (
    <div className="space-y-3">
      <p className="kicker text-xs uppercase tracking-wide">Local help{city ? ` · ${city}` : ""}</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {PARTNERS.map(([t, d]) => (
          <div key={t} className="glass rounded-2xl p-4">
            <p className="font-semibold text-sm">{t}</p>
            <p className="muted mt-1 text-xs">{d}</p>
            <Link href="/contact" className="kicker mt-2 inline-block text-xs hover:underline">
              Partner inquiry
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
