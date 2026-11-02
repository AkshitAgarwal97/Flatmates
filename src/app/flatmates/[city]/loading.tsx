import { ListingGridSkeleton } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";

export default function CityLoading() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="City" title="Loading listings…" lead="Finding rooms and flatmates in this city." />
      <div className="glass rounded-2xl p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-8 rounded-lg" />
          ))}
        </div>
      </div>
      <ListingGridSkeleton />
    </div>
  );
}
