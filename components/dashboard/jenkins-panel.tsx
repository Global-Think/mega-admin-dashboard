import { Activity, FolderKanban, RefreshCcw, ServerCog, TriangleAlert } from 'lucide-react';

import { JenkinsJobsIsland } from '@/components/dashboard/JenkinsJobsIsland';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { MetricValueSkeleton, TableRowsSkeleton, TextLineSkeleton } from '@/components/ui/LoadingPrimitives';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { formatRelativeTime } from '@/lib/utils';
import type { JenkinsFolder } from '@/types/project';

export function JenkinsPanelShell({
  metrics,
  renderedAt,
  content,
}: {
  metrics: React.ReactNode;
  renderedAt: React.ReactNode;
  content: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics}</div>

      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Jenkins control panel</CardTitle>
            <CardDescription className="text-sm leading-7">
              Folder-first visibility, Jenkins-like status columns, and direct build triggering from the same
              workspace.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCcw className="h-4 w-4" />
            {renderedAt}
          </div>
        </CardHeader>

        <CardContent className="space-y-5">{content}</CardContent>
      </Card>
    </section>
  );
}

export function JenkinsMetricCards({
  folders,
}: {
  folders: JenkinsFolder[];
}) {
  const jobs = folders.flatMap((folder) => folder.jobs);
  const totals = {
    folders: folders.length,
    jobs: jobs.length,
    running: jobs.filter((job) => job.inQueue || job.lastBuild?.building || job.color.includes('_anime')).length,
    failed: jobs.filter((job) => job.color === 'red' || job.lastCompletedBuild?.result === 'FAILURE').length,
  };

  return (
    <>
      <MetricCard
        title="Jenkins Projects"
        value={String(totals.folders)}
        description="Top-level folders currently discovered in Jenkins."
        icon={FolderKanban}
      />
      <MetricCard
        title="Pipeline Jobs"
        value={String(totals.jobs)}
        description="Executable workflow jobs inside those Jenkins folders."
        icon={ServerCog}
      />
      <MetricCard
        title="Running Now"
        value={String(totals.running)}
        description="Builds that are queued or currently running in Jenkins."
        icon={Activity}
      />
      <MetricCard
        title="Failed"
        value={String(totals.failed)}
        description="Jobs whose latest completed build ended in failure."
        icon={TriangleAlert}
      />
    </>
  );
}

export function JenkinsMetricCardsSkeleton() {
  return (
    <>
      {JENKINS_METRIC_COPY.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={<MetricValueSkeleton />}
          description={metric.description}
          icon={metric.icon}
        />
      ))}
    </>
  );
}

const JENKINS_METRIC_COPY = [
  {
    title: 'Jenkins Projects',
    description: 'Top-level folders currently discovered in Jenkins.',
    icon: FolderKanban,
  },
  {
    title: 'Pipeline Jobs',
    description: 'Executable workflow jobs inside those Jenkins folders.',
    icon: ServerCog,
  },
  {
    title: 'Running Now',
    description: 'Builds that are queued or currently running in Jenkins.',
    icon: Activity,
  },
  {
    title: 'Failed',
    description: 'Jobs whose latest completed build ended in failure.',
    icon: TriangleAlert,
  },
] as const;

export function JenkinsRenderedAt({ renderedAt }: { renderedAt: string }) {
  return <>Snapshot rendered {formatRelativeTime(renderedAt)}.</>;
}

export function JenkinsRenderedAtSkeleton() {
  return (
    <span className="inline-flex items-center">
      <TextLineSkeleton className="w-36" />
    </span>
  );
}

export function JenkinsPanelData({
  folders,
  error,
  disabledMessage,
  renderedAt,
}: {
  folders: JenkinsFolder[];
  error: string | null;
  disabledMessage: string | null;
  renderedAt: string;
}) {
  return (
    <>
      {error ? (
        <Alert variant="error">
          <AlertTitle>Could not connect to Jenkins</AlertTitle>
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      ) : null}

      {disabledMessage ? (
        <Alert variant="subtle">
          <AlertTitle>Jenkins is paused</AlertTitle>
          <AlertDescription className="text-muted-foreground">{disabledMessage}</AlertDescription>
        </Alert>
      ) : null}

      {!folders.length && !error ? (
        <div className="rounded-[1.5rem] border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
          No Jenkins folders were found for this installation yet.
        </div>
      ) : null}

      {folders.length ? <JenkinsJobsIsland folders={folders} renderedAt={renderedAt} /> : null}
    </>
  );
}

export function JenkinsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-muted/30">
            <TableHead className="w-14 text-center">S</TableHead>
            <TableHead className="w-14 text-center">W</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Last Trigger</TableHead>
            <TableHead>Last Success</TableHead>
            <TableHead>Last Failure</TableHead>
            <TableHead>Last Duration</TableHead>
            <TableHead className="w-28 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRowsSkeleton rows={5} columns={8} />
        </TableBody>
      </Table>
    </div>
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
    <Card className="rounded-[1.75rem] border shadow-none">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.24em]">{title}</CardDescription>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border bg-muted/40">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
