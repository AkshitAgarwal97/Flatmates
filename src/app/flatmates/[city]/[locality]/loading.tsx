import { ListingGridSkeleton } from "@/components/ListingCard";
import { PageHeader } from "@/components/PageHeader";

export default function LocalityLoading() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="Locality" title="Loading listings…" lead="Finding rooms and flatmates in this locality." />
      <ListingGridSkeleton />
    </div>
  );
}
