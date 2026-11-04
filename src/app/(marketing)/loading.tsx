export default function MarketingLoading() {
  return (
    <div className="container-page py-16 animate-in fade-in-50 duration-150">
      <div className="space-y-6">
        <div className="h-10 w-64 rounded bg-slate-200 animate-pulse mb-4" />
        <div className="h-5 w-96 rounded bg-slate-100 animate-pulse mb-8" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-56 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
          <div className="h-56 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
          <div className="h-56 rounded-2xl border border-slate-200/80 bg-white p-6 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
