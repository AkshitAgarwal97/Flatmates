import Link from "next/link";
import { CITY_RANK_FLOOR } from "@/lib/city-supply";

interface PosterNextProps {
  justPosted: boolean;
  city: string;
  cityHref: string;
  cityLive: number;
  thin: boolean;
  whatsappHref: string;
}

export function PosterNext({ justPosted, city, cityHref, cityLive, thin, whatsappHref }: PosterNextProps) {
  if (!justPosted && !thin) return null;

  return (
    <section className="glass rounded-3xl p-5 space-y-3" aria-label="Share your listing">
      {justPosted ? (
        <div>
          <p className="kicker text-xs uppercase tracking-widest">Next step</p>
          <h2 className="mt-1 text-xl font-semibold">Your listing is live</h2>
          <p className="muted mt-2 text-sm">
            Send it to the WhatsApp group for this society, PG, or campus. People already in that chat are the ones who
            can reply.
          </p>
        </div>
      ) : (
        <h2 className="text-lg font-semibold">Share this listing</h2>
      )}

      <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="btn inline-flex w-full justify-center sm:w-auto">
        Share on WhatsApp
      </a>

      {thin ? (
        <p className="text-sm muted">
          {city} has {cityLive} live {cityLive === 1 ? "listing" : "listings"}. A city page starts to earn search visits
          around {CITY_RANK_FLOOR}.{" "}
          <Link href={cityHref} className="text-teal-700 underline dark:text-teal-200">
            Open the {city} page
          </Link>{" "}
          and share this room into a group you belong to.
        </p>
      ) : null}
    </section>
  );
}
