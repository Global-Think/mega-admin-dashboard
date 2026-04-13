import {
  BuildSnapshotCardSkeleton,
  CoverageCardSkeleton,
  OverviewDashboardShell,
  OverviewMetricCardsSkeleton,
  PipelineActivityCardSkeleton,
  RecentProjectsCardSkeleton,
  TaskSnapshotCardSkeleton,
} from '@/components/dashboard/overview-dashboard';

export default function AppLoading() {
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
}
