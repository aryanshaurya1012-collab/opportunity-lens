import { PageContainer } from "@/components/app-shell/page-header";

export default function AppLoading() {
  return (
    <PageContainer className="animate-in fade-in-50 duration-150">
      <div className="space-y-6">
        <div className="h-28 rounded-2xl border border-border/40 bg-card/40 p-6 animate-pulse">
          <div className="h-3 w-24 rounded bg-muted/60 mb-3" />
          <div className="h-7 w-64 rounded bg-muted/80 mb-2" />
          <div className="h-4 w-96 max-w-full rounded bg-muted/40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-40 rounded-xl border border-border/40 bg-card/40 p-5 animate-pulse" />
          <div className="h-40 rounded-xl border border-border/40 bg-card/40 p-5 animate-pulse" />
          <div className="h-40 rounded-xl border border-border/40 bg-card/40 p-5 animate-pulse" />
        </div>
      </div>
    </PageContainer>
  );
}
