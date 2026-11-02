import { PageHeader } from "@/components/PageHeader";
import { ListingGridSkeleton } from "@/components/ListingCard";

export default function BrowseLoading() {
  return (
    <div className="space-y-8">
      <PageHeader kicker="Search" title="Finding listings…" lead="Loading rooms, flats, and flatmates." />
      <ListingGridSkeleton />
    </div>
  );
}
