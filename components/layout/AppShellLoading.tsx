import { LoaderCircle, PlusCircle, RefreshCcw } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  JenkinsMetricCardsSkeleton,
  JenkinsPanelShell,
  JenkinsRenderedAtSkeleton,
  JenkinsTableSkeleton,
} from '@/components/dashboard/jenkins-panel';
import {
  BuildSnapshotCardSkeleton,
  CoverageCardSkeleton,
  OverviewDashboardShell,
  OverviewMetricCardsSkeleton,
  PipelineActivityCardSkeleton,
  RecentProjectsCardSkeleton,
  TaskSnapshotCardSkeleton,
} from '@/components/dashboard/overview-dashboard';
import { ProjectsPanelShell, ProjectsTableSkeleton } from '@/components/dashboard/projects-panel';
import { Skeleton } from '@/components/ui/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';

export function AppShellLoading({
  page,
}: {
  page: 'overview' | 'launch' | 'projects' | 'builds' | 'board' | 'generic';
}) {
  switch (page) {
    case 'overview':
      return (
        <OverviewDashboardShell
          metrics={<OverviewMetricCardsSkeleton />}
          taskSnapshot={<TaskSnapshotCardSkeleton />}
          buildSnapshot={<BuildSnapshotCardSkeleton />}
          coverage={<CoverageCardSkeleton />}
          pipelineActivity={<PipelineActivityCardSkeleton />}
          recentProjects={<RecentProjectsCardSkeleton />}
        />
      );
    case 'launch':
      return <LaunchPageSkeleton />;
    case 'projects':
      return <ProjectsPanelShell content={<ProjectsTableSkeleton />} />;
    case 'builds':
      return (
        <JenkinsPanelShell
          metrics={<JenkinsMetricCardsSkeleton />}
          renderedAt={<JenkinsRenderedAtSkeleton />}
          content={<JenkinsTableSkeleton />}
        />
      );
    case 'board':
      return <BoardPageSkeleton />;
    case 'generic':
    default:
      return <GenericRouteSkeleton />;
  }
}

function BoardPageSkeleton() {
  return (
    <div className="space-y-8 lg:space-y-10 pt-14 lg:pt-0">
      <Tabs value="fe" className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Project tasks</h1>
            <p className="text-sm text-muted-foreground">
              Switch between frontend and backend workstreams, keep more tasks visible, and focus on one lane at a time.
            </p>
          </div>
          <TabsList className="w-full justify-start lg:w-auto">
            <TabsTrigger value="fe">Frontend Tasks</TabsTrigger>
            <TabsTrigger value="be">Backend Tasks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fe">
          <section>
            <Card className="rounded-[1.75rem] border shadow-none">
              <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Frontend tasks</CardTitle>
                  <Badge className="px-3 py-1 text-sm">...</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" disabled>
                    <PlusCircle className="h-4 w-4" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex min-h-[360px] items-center justify-center rounded-[1.5rem] border border-dashed bg-muted/10 px-6">
                  <div className="inline-flex items-center gap-3 rounded-full border bg-background/90 px-5 py-3 text-sm text-muted-foreground shadow-sm backdrop-blur-sm">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>Opening board...</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LaunchPageSkeleton() {
  return (
    <section className="space-y-8 pt-14 lg:pt-0">
      <div className="space-y-2">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="rounded-[2rem] border shadow-none">
          <CardHeader className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-full max-w-2xl" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-14 rounded-2xl" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-28 rounded-[1.5rem]" />
              <Skeleton className="h-28 rounded-[1.5rem]" />
              <Skeleton className="h-28 rounded-[1.5rem]" />
            </div>
            <Skeleton className="h-14 rounded-2xl" />
            <Skeleton className="h-12 w-full md:w-52 rounded-2xl" />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border shadow-none">
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-5 w-full max-w-xs" />
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-[1.5rem] border bg-zinc-950 px-4 py-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                </div>
                <Skeleton className="h-3 w-14 bg-white/10" />
              </div>
              <div className="space-y-4 pt-4">
                <Skeleton className="h-20 rounded-[1rem] bg-white/10" />
                <div className="grid gap-3 md:grid-cols-3">
                  <Skeleton className="h-16 rounded-[1rem] bg-white/10" />
                  <Skeleton className="h-16 rounded-[1rem] bg-white/10" />
                  <Skeleton className="h-16 rounded-[1rem] bg-white/10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function GenericRouteSkeleton() {
  return (
    <section className="space-y-5 pt-14 lg:pt-0">
      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="space-y-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-muted/30">
              <RefreshCcw className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="step-live-bar h-2 rounded-full bg-muted/60" />
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-24 rounded-[1.5rem]" />
            <Skeleton className="h-24 rounded-[1.5rem]" />
            <Skeleton className="h-24 rounded-[1.5rem]" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
