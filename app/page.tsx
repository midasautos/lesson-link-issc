import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { RecentIncidentsCard } from "@/components/dashboard/recent-incidents-card";
import { SeverityCard } from "@/components/dashboard/severity-card";
import { SiteOverviewCard } from "@/components/dashboard/site-overview-card";
import { TrendCard } from "@/components/dashboard/trend-card";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="flex flex-col items-stretch justify-between gap-5">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and incident overview
          </p>
        </div>

        <div className="grid grid-cols-3 justify-items-stretch gap-6">
          <div className="min-w-0 space-y-6 col-span-2">
              <SiteOverviewCard />
              <RecentIncidentsCard />
          </div>
          <div className="min-w-0 space-y-6">
            <SeverityCard />
            <TrendCard />
            <QuickActionsCard />
          </div>
        </div>
      </div>
    </div>
  );
}
