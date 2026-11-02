import { ListingGridSkeleton } from "@/components/ListingCard";

export default function RootLoading() {
  return (
    <div className="space-y-8">
      <div className="glass rounded-3xl p-8 md:p-12 space-y-4">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-10 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-12 w-full" />
      </div>
      <ListingGridSkeleton />
    </div>
  );
}
