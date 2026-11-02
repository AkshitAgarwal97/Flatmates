export default function ListingLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr]">
      <div className="space-y-4">
        <div className="skeleton h-64 w-full rounded-3xl" />
        <div className="glass space-y-3 rounded-3xl p-6">
          <div className="skeleton h-3 w-40" />
          <div className="skeleton h-8 w-3/4" />
          <div className="skeleton h-20 w-full" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="skeleton h-40 rounded-3xl" />
        <div className="skeleton h-32 rounded-3xl" />
      </div>
    </div>
  );
}
