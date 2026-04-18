import Link from 'next/link';
import { Activity, AlertTriangle, ArrowRight, FolderKanban, Layers3 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  DistributionRowsSkeleton,
  DonutStatsSkeleton,
  ListItemsSkeleton,
  MetricValueSkeleton,
  MiniStatSkeleton,
  StatusGridSkeleton,
  TextLineSkeleton,
} from '@/components/ui/LoadingPrimitives';
import { formatDurationWords, formatRelativeTime } from '@/lib/utils';
import type { BoardRecord, ProjectOverview } from '@/types/project';

export type OverviewData = {
  recentProjects: BoardRecord[];
  latestBuilds: ProjectOverview[];
  frameworkCounts: Record<'nextjs' | 'vue3' | 'angular', number>;
  boardOverview: {
    totalCards: number;
    backlog: number;
    inProgress: number;
    inReview: number;
    done: number;
    highPriority: number;
    frontendCards: number;
    backendCards: number;
    completionRate: number;
  };
  buildCounts: {
    success: number;
    failed: number;
    running: number;
    never: number;
  };
  totals: {
    projects: number;
    openTasks: number;
    runningBuilds: number;
    failedBuilds: number;
  };
  jenkins: {
    error: string | null;
    disabledMessage: string | null;
    renderedAt: string;
  };
};

export function OverviewDashboardShell({
  metrics,
  taskSnapshot,
  buildSnapshot,
  coverage,
  pipelineActivity,
  recentProjects,
}: {
  metrics: React.ReactNode;
  taskSnapshot: React.ReactNode;
  buildSnapshot: React.ReactNode;
  coverage: React.ReactNode;
  pipelineActivity: React.ReactNode;
  recentProjects: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics}</section>

      <section className="grid gap-4 xl:grid-cols-3">
        {taskSnapshot}
        {buildSnapshot}
        {coverage}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        {pipelineActivity}
        {recentProjects}
      </section>
    </div>
  );
}

export function OverviewMetricCards({ totals }: { totals: OverviewData['totals'] }) {
  return (
    <>
      <MetricCard
        title="Tracked Projects"
        value={String(totals.projects)}
        description="Live workspaces in the platform."
        icon={FolderKanban}
      />
      <MetricCard
        title="Open Tasks"
        value={String(totals.openTasks)}
        description="Cards not yet moved to Done."
        icon={Layers3}
      />
      <MetricCard
        title="Running Builds"
        value={String(totals.runningBuilds)}
        description="Queued or active Jenkins jobs."
        icon={Activity}
      />
      <MetricCard
        title="Failed Builds"
        value={String(totals.failedBuilds)}
        description="Latest completed failures."
        icon={AlertTriangle}
      />
    </>
  );
}

export function OverviewMetricCardsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, index) => (
        <MetricCard
          key={index}
          title={METRIC_CARD_COPY[index].title}
          value={<MetricValueSkeleton />}
          description={METRIC_CARD_COPY[index].description}
          icon={METRIC_CARD_COPY[index].icon}
        />
      ))}
    </>
  );
}

const METRIC_CARD_COPY = [
  {
    title: 'Tracked Projects',
    description: 'Live workspaces in the platform.',
    icon: FolderKanban,
  },
  {
    title: 'Open Tasks',
    description: 'Cards not yet moved to Done.',
    icon: Layers3,
  },
  {
    title: 'Running Builds',
    description: 'Queued or active Jenkins jobs.',
    icon: Activity,
  },
  {
    title: 'Failed Builds',
    description: 'Latest completed failures.',
    icon: AlertTriangle,
  },
] as const;

export function TaskSnapshotCard({ data }: { data: OverviewData }) {
  const taskBuckets = [
    { label: 'Backlog', value: data.boardOverview.backlog },
    { label: 'In Progress', value: data.boardOverview.inProgress },
    { label: 'In Review', value: data.boardOverview.inReview },
    { label: 'Done', value: data.boardOverview.done },
  ];

  return (
    <CompactChartCard
      title="Task Snapshot"
      description="Current board workload."
      footer={`Completion rate ${data.boardOverview.completionRate}%`}
      items={taskBuckets}
      total={data.boardOverview.totalCards}
      stats={[
        { label: 'Frontend', value: data.boardOverview.frontendCards },
        { label: 'Backend', value: data.boardOverview.backendCards },
        { label: 'High Priority', value: data.boardOverview.highPriority },
      ]}
    />
  );
}

export function TaskSnapshotCardSkeleton() {
  return (
    <CompactChartCard
      title="Task Snapshot"
      description="Current board workload."
      footer={<TextLineSkeleton className="w-32" />}
      items={null}
      total={0}
      stats={null}
      skeletonBody={
        <>
          <DistributionRowsSkeleton rows={4} />
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniStatSkeleton />
            <MiniStatSkeleton />
            <MiniStatSkeleton />
          </div>
        </>
      }
    />
  );
}

export function BuildSnapshotCard({ data }: { data: OverviewData }) {
  const buildBuckets = [
    { label: 'Success', value: data.buildCounts.success },
    { label: 'Failed', value: data.buildCounts.failed },
    { label: 'Running', value: data.buildCounts.running },
    { label: 'Never', value: data.buildCounts.never },
  ];

  return (
    <CompactChartCard
      title="Build Snapshot"
      description="Current Jenkins state."
      footer={
        data.jenkins.error
          ? data.jenkins.error
          : data.jenkins.disabledMessage ?? `Rendered ${formatRelativeTime(data.jenkins.renderedAt)}`
      }
      items={buildBuckets}
      total={buildBuckets.reduce((sum, item) => sum + item.value, 0)}
      visual={<StatusGrid items={buildBuckets} />}
    />
  );
}

export function BuildSnapshotCardSkeleton() {
  return (
    <CompactChartCard
      title="Build Snapshot"
      description="Current Jenkins state."
      footer={<TextLineSkeleton className="w-28" />}
      items={null}
      total={0}
      visual={null}
      skeletonBody={
        <>
          <DistributionRowsSkeleton rows={4} />
          <div className="pt-1">
            <StatusGridSkeleton />
          </div>
        </>
      }
    />
  );
}

export function CoverageCard({ frameworkCounts }: { frameworkCounts: OverviewData['frameworkCounts'] }) {
  const frameworkEntries = [
    { label: 'Next.js', value: frameworkCounts.nextjs },
    { label: 'Vue 3', value: frameworkCounts.vue3 },
    { label: 'Angular', value: frameworkCounts.angular },
  ];
  const totalProjects = frameworkEntries.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Coverage</CardTitle>
        <CardDescription>Framework and ownership split.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {frameworkEntries.map((item) => (
            <DistributionRow key={item.label} label={item.label} value={item.value} total={totalProjects} />
          ))}
        </div>
        <DonutStats items={frameworkEntries} />
      </CardContent>
    </Card>
  );
}

export function CoverageCardSkeleton() {
  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Coverage</CardTitle>
        <CardDescription>Framework and ownership split.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DistributionRowsSkeleton rows={3} />
        <DonutStatsSkeleton />
      </CardContent>
    </Card>
  );
}

export function PipelineActivityCard({ builds }: { builds: ProjectOverview[] }) {
  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Latest Pipeline Activity</CardTitle>
          <CardDescription>Recent Jenkins jobs with their current state.</CardDescription>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/builds">
            Open Builds
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {builds.length ? (
          builds.slice(0, 3).map((job) => <PipelineActivityItem key={job.jobUrl} job={job} />)
        ) : (
          <EmptyInfo label="No Jenkins activity found yet." />
        )}
      </CardContent>
    </Card>
  );
}

export function PipelineActivityCardSkeleton() {
  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Latest Pipeline Activity</CardTitle>
          <CardDescription>Recent Jenkins jobs with their current state.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" disabled>
          Open Builds
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ListItemsSkeleton items={3} trailingWidth="w-20" />
      </CardContent>
    </Card>
  );
}

export function RecentProjectsCard({ projects }: { projects: BoardRecord[] }) {
  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Recent Boards</CardTitle>
          <CardDescription>Newest provisioned and legacy workspaces with fast board access.</CardDescription>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/projects">
            Open Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.length ? (
          projects.slice(0, 3).map((project) => <RecentProjectItem key={project.id} project={project} />)
        ) : (
          <EmptyInfo label="No boards have been created yet." />
        )}
      </CardContent>
    </Card>
  );
}

export function RecentProjectsCardSkeleton() {
  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">Recent Boards</CardTitle>
          <CardDescription>Newest provisioned and legacy workspaces with fast board access.</CardDescription>
        </div>
        <Button variant="secondary" size="sm" disabled>
          Open Projects
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <ListItemsSkeleton items={3} trailingWidth="w-16" />
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: React.ReactNode;
  description: string;
  icon: typeof FolderKanban;
}) {
  return (
    <Card className="rounded-[1.5rem] border shadow-none">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-[11px] font-medium uppercase tracking-[0.22em]">
            {title}
          </CardDescription>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border bg-muted/40">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function CompactChartCard({
  title,
  description,
  footer,
  items,
  total,
  stats,
  visual,
  skeletonBody,
}: {
  title: string;
  description: string;
  footer: React.ReactNode;
  items: Array<{ label: string; value: number }> | null;
  total: number;
  stats?: Array<{ label: string; value: number | string }> | null;
  visual?: React.ReactNode;
  skeletonBody?: React.ReactNode;
}) {
  return (
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items ? (
          <>
            <div className="grid gap-3">
              {items.map((item) => (
                <DistributionRow key={item.label} label={item.label} value={item.value} total={total} />
              ))}
            </div>
            {stats?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((item) => (
                  <MiniStat key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            ) : null}
            {visual ? <div className="pt-1">{visual}</div> : null}
          </>
        ) : (
          skeletonBody
        )}
        <div className="text-xs text-muted-foreground">{footer}</div>
      </CardContent>
    </Card>
  );
}

function DistributionRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  const width = `${(value / safeTotal) * 100}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted/40">
        <div className="h-2.5 rounded-full bg-primary" style={{ width }} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.25rem] border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StatusGrid({ items }: { items: Array<{ label: string; value: number }> }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item, index) => (
        <div key={item.label} className="rounded-[1.1rem] border bg-muted/15 p-3">
          <div className="flex items-center gap-2">
            <span
              className={
                index % 2 === 0
                  ? 'h-2.5 w-2.5 rounded-full bg-primary'
                  : 'h-2.5 w-2.5 rounded-full bg-primary/45'
              }
            />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function DonutStats({ items }: { items: Array<{ label: string; value: number }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = Math.max(total, 1);
  const segments = items.reduce<
    Array<{
      label: string;
      value: number;
      color: string;
      start: number;
      end: number;
    }>
  >((acc, item, index) => {
    const previousEnd = acc.at(-1)?.end ?? 0;
    const slice = (item.value / safeTotal) * 100;

    acc.push({
      ...item,
      color: index % 2 === 0 ? 'hsl(var(--foreground))' : 'hsl(var(--foreground) / 0.35)',
      start: previousEnd,
      end: previousEnd + slice,
    });

    return acc;
  }, []);

  return (
    <div className="flex items-center gap-4 rounded-[1.25rem] border bg-muted/15 p-4">
      <div className="relative h-24 w-24 shrink-0">
        <div
          className="h-24 w-24 rounded-full"
          style={{
            background: `conic-gradient(${segments
              .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
              .join(', ')})`,
          }}
        />
        <div className="absolute inset-4 rounded-full bg-background" />
        <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{total}</div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: segment.color }} />
              <span>{segment.label}</span>
            </div>
            <span className="text-muted-foreground">{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyInfo({ label }: { label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function PipelineActivityItem({ job }: { job: ProjectOverview }) {
  return (
    <Link
      href={job.jobUrl}
      target="_blank"
      rel="noreferrer"
      className="block rounded-[1.25rem] border p-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{job.jobName}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{job.folderName}</p>
        </div>
        <Badge variant={getBuildBadgeVariant(job)}>{getBuildLabel(job)}</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>{job.lastBuild ? formatRelativeTime(job.lastBuild.timestamp) : 'Never triggered'}</span>
        <span>{formatDurationWords(job.lastCompletedBuild?.duration)}</span>
      </div>
    </Link>
  );
}

function RecentProjectItem({ project }: { project: BoardRecord }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block rounded-[1.25rem] border p-3 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{project.title}</p>
          <p className="mt-1 truncate text-sm text-muted-foreground">{project.client_name}</p>
        </div>
        <Badge variant={project.source_type === 'legacy' ? 'warning' : 'outline'}>
          {project.framework ?? 'Board only'}
        </Badge>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Created {formatRelativeTime(project.created_at)}</p>
    </Link>
  );
}

function getBuildLabel(job: ProjectOverview) {
  if (job.inQueue || job.lastBuild?.building || job.color.includes('_anime')) {
    return 'Running';
  }

  if (job.lastCompletedBuild?.result === 'FAILURE' || job.color === 'red') {
    return 'Failed';
  }

  if (job.lastCompletedBuild?.result === 'SUCCESS' || job.color === 'blue') {
    return 'Success';
  }

  return 'No Build';
}

function getBuildBadgeVariant(job: ProjectOverview): 'success' | 'neutral' | 'danger' {
  if (job.inQueue || job.lastBuild?.building || job.color.includes('_anime')) {
    return 'neutral';
  }

  if (job.lastCompletedBuild?.result === 'FAILURE' || job.color === 'red') {
    return 'danger';
  }

  if (job.lastCompletedBuild?.result === 'SUCCESS' || job.color === 'blue') {
    return 'success';
  }

  return 'neutral';
}
