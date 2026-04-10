import { Suspense } from 'react';

import {
  BuildSnapshotCard,
  BuildSnapshotCardSkeleton,
  CoverageCard,
  CoverageCardSkeleton,
  OverviewDashboardShell,
  OverviewMetricCards,
  OverviewMetricCardsSkeleton,
  PipelineActivityCard,
  PipelineActivityCardSkeleton,
  RecentProjectsCard,
  RecentProjectsCardSkeleton,
  TaskSnapshotCard,
  TaskSnapshotCardSkeleton,
} from '@/components/dashboard/overview-dashboard';
import { getDashboardOverviewData } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default function DashboardOverviewPage() {
  return (
    <OverviewDashboardShell
      metrics={
        <Suspense fallback={<OverviewMetricCardsSkeleton />}>
          <OverviewMetricsSection />
        </Suspense>
      }
      taskSnapshot={
        <Suspense fallback={<TaskSnapshotCardSkeleton />}>
          <TaskSnapshotSection />
        </Suspense>
      }
      buildSnapshot={
        <Suspense fallback={<BuildSnapshotCardSkeleton />}>
          <BuildSnapshotSection />
        </Suspense>
      }
      coverage={
        <Suspense fallback={<CoverageCardSkeleton />}>
          <CoverageSection />
        </Suspense>
      }
      pipelineActivity={
        <Suspense fallback={<PipelineActivityCardSkeleton />}>
          <PipelineActivitySection />
        </Suspense>
      }
      recentProjects={
        <Suspense fallback={<RecentProjectsCardSkeleton />}>
          <RecentProjectsSection />
        </Suspense>
      }
    />
  );
}

async function OverviewMetricsSection() {
  const overview = await getDashboardOverviewData();

  return <OverviewMetricCards totals={overview.totals} />;
}

async function TaskSnapshotSection() {
  const overview = await getDashboardOverviewData();

  return <TaskSnapshotCard data={overview} />;
}

async function BuildSnapshotSection() {
  const overview = await getDashboardOverviewData();

  return <BuildSnapshotCard data={overview} />;
}

async function CoverageSection() {
  const overview = await getDashboardOverviewData();

  return <CoverageCard frameworkCounts={overview.frameworkCounts} />;
}

async function PipelineActivitySection() {
  const overview = await getDashboardOverviewData();

  return <PipelineActivityCard builds={overview.latestBuilds} />;
}

async function RecentProjectsSection() {
  const overview = await getDashboardOverviewData();

  return <RecentProjectsCard projects={overview.recentProjects} />;
}
