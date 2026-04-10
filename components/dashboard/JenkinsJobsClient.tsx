'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  CircleDashed,
  CircleX,
  Folder,
  LoaderCircle,
  Play,
  SunMedium,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { cn, formatDateTime, formatDurationWords, formatRelativeCompact } from '@/lib/utils';
import type { JenkinsFolder, JenkinsWorkflowJob } from '@/types/project';

type PendingJobMap = Record<
  string,
  {
    lastBuildNumber: number | null;
    lastBuildTimestamp: number | null;
  }
>;

export function JenkinsJobsClient({
  initialFolders,
  initialRenderedAt,
}: {
  initialFolders: JenkinsFolder[];
  initialRenderedAt: string;
}) {
  const [folders, setFolders] = useState(initialFolders);
  const [renderedAt, setRenderedAt] = useState(initialRenderedAt);
  const [busyJobUrl, setBusyJobUrl] = useState<string | null>(null);
  const [queuedJobs, setQueuedJobs] = useState<PendingJobMap>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [openFolderUrl, setOpenFolderUrl] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimers = useRef<number[]>([]);
  const jobsByUrl = useMemo(
    () =>
      new Map(
        folders.flatMap((folder) => folder.jobs.map((job) => [job.jobUrl, job] as const))
      ),
    [folders]
  );
  const hasLiveActivity =
    busyJobUrl != null ||
    Object.keys(queuedJobs).length > 0 ||
    folders.some((folder) =>
      folder.jobs.some((job) => job.inQueue || job.lastBuild?.building || job.color.includes('_anime'))
    );

  useEffect(() => {
    setQueuedJobs((current) => {
      const nextEntries = Object.entries(current).filter(([jobUrl, pending]) => {
        const job = jobsByUrl.get(jobUrl);

        if (!job) {
          return false;
        }

        if (job.inQueue || job.lastBuild?.building || job.color.includes('_anime')) {
          return true;
        }

        if (
          job.lastBuild?.number !== pending.lastBuildNumber ||
          job.lastBuild?.timestamp !== pending.lastBuildTimestamp
        ) {
          return false;
        }

        return true;
      });

      if (nextEntries.length === Object.keys(current).length) {
        return current;
      }

      return Object.fromEntries(nextEntries);
    });
  }, [jobsByUrl]);

  useEffect(() => {
    return () => {
      for (const timer of refreshTimers.current) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const refreshJobs = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const response = await fetch('/api/jenkins-jobs', {
        method: 'GET',
        cache: 'no-store',
      });

      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
        message?: string;
        data?: {
          folders: JenkinsFolder[];
          renderedAt: string;
        };
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.error ?? 'Could not refresh the Jenkins jobs.');
      }

      setFolders(payload.data.folders);
      setRenderedAt(payload.data.renderedAt);
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not refresh the Jenkins jobs.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const scheduleRefreshes = useCallback(() => {
    for (const timer of refreshTimers.current) {
      window.clearTimeout(timer);
    }

    refreshTimers.current = [1200, 4000, 9000].map((delay) =>
      window.setTimeout(() => {
        void refreshJobs();
      }, delay)
    );
  }, [refreshJobs]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') {
        return;
      }

      void refreshJobs();
    }, hasLiveActivity ? 5000 : 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshJobs();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasLiveActivity, refreshJobs]);

  const runBuild = async (job: JenkinsWorkflowJob) => {
    setBusyJobUrl(job.jobUrl);
    setActionError(null);

    try {
      const response = await fetch('/api/jenkins-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobUrl: job.jobUrl,
        }),
      });

      const payload = (await response.json()) as { success: boolean; error?: string };

      if (!response.ok || !payload.success) {
        throw new Error(payload.error ?? 'Could not trigger the Jenkins build.');
      }

      setQueuedJobs((current) => ({
        ...current,
        [job.jobUrl]: {
          lastBuildNumber: job.lastBuild?.number ?? null,
          lastBuildTimestamp: job.lastBuild?.timestamp ?? null,
        },
      }));
      scheduleRefreshes();
      void refreshJobs();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not trigger the Jenkins build.');
    } finally {
      setBusyJobUrl(null);
    }
  };

  return (
    <div className="space-y-4">
      {actionError ? (
        <Alert variant="error">
          <AlertTitle>Build trigger failed</AlertTitle>
          <AlertDescription className="text-red-700">{actionError}</AlertDescription>
        </Alert>
      ) : null}

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
            {folders.map((folder) => (
              <FolderRows
                key={folder.url}
                folder={folder}
                isOpen={openFolderUrl === folder.url}
                renderedAt={renderedAt}
                busyJobUrl={busyJobUrl}
                queuedJobs={queuedJobs}
                isRefreshing={isRefreshing}
                onRunBuild={runBuild}
                onToggle={() =>
                  setOpenFolderUrl((current) => (current === folder.url ? null : folder.url))
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function FolderRows({
  folder,
  isOpen,
  renderedAt,
  busyJobUrl,
  queuedJobs,
  isRefreshing,
  onRunBuild,
  onToggle,
}: {
  folder: JenkinsFolder;
  isOpen: boolean;
  renderedAt: string;
  busyJobUrl: string | null;
  queuedJobs: PendingJobMap;
  isRefreshing: boolean;
  onRunBuild: (job: JenkinsWorkflowJob) => void;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer bg-background hover:bg-muted/20"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <TableCell className="text-center">
          <div className="flex justify-center">
            <Folder className="h-5 w-5 text-foreground" />
          </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex justify-center">
            <WeatherIcon score={folder.healthReport[0]?.score ?? 0} title={folder.healthReport[0]?.description} />
          </div>
        </TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center gap-3">
            <ChevronRight className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-90')} />
            <span>{folder.name}</span>
          </div>
        </TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>

      {isOpen
        ? folder.jobs.map((job) => {
        const isRunning = job.lastBuild?.building || job.color.includes('_anime') || job.inQueue;
        const isQueued = Boolean(queuedJobs[job.jobUrl]);
        const isBusy = busyJobUrl === job.jobUrl;
        const disableRun = !job.buildable || isBusy || isRunning || isQueued || isRefreshing;

        return (
          <TableRow key={job.jobUrl}>
            <TableCell className="text-center">
              <div className="flex justify-center">
                <StatusIcon job={job} queued={isQueued} />
              </div>
            </TableCell>
            <TableCell className="text-center">
              <div className="flex justify-center">
                <WeatherIcon score={job.healthReport[0]?.score ?? 0} title={job.healthReport[0]?.description} />
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="block pl-8 transition-opacity hover:opacity-70"
              >
                <span className="font-medium">{job.jobName}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{job.folderName}</span>
              </Link>
            </TableCell>
            <TableCell>{renderTriggerCell(job.lastBuild)}</TableCell>
            <TableCell>{renderBuildCell(job.lastSuccessfulBuild, renderedAt)}</TableCell>
            <TableCell>{renderBuildCell(job.lastFailedBuild, renderedAt)}</TableCell>
            <TableCell className="text-muted-foreground">
              {formatDurationWords(job.lastCompletedBuild?.duration)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'min-w-[96px] justify-end',
                  !disableRun && 'text-emerald-700 hover:text-emerald-700',
                  (isRunning || isQueued) && 'text-foreground'
                )}
                disabled={disableRun}
                onClick={() => onRunBuild(job)}
              >
                {isBusy || isRunning || isQueued ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isBusy ? 'Queueing' : isQueued ? 'Queued' : isRunning ? 'Running' : 'Run'}
              </Button>
            </TableCell>
          </TableRow>
        );
      })
        : null}
    </>
  );
}

function renderBuildCell(
  build: JenkinsWorkflowJob['lastSuccessfulBuild'],
  renderedAt: string
) {
  if (!build) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span>{formatRelativeCompact(build.timestamp, renderedAt)}</span>
      <Link
        href={build.url}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-70"
      >
        #{build.number}
      </Link>
    </div>
  );
}

function renderTriggerCell(build: JenkinsWorkflowJob['lastBuild']) {
  if (!build) {
    return <span className="text-muted-foreground">N/A</span>;
  }

  return (
    <div className="space-y-1">
      <div>{formatDateTime(build.timestamp)}</div>
      <Link
        href={build.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-70"
      >
        #{build.number}
      </Link>
    </div>
  );
}


function StatusIcon({ job, queued }: { job: JenkinsWorkflowJob; queued: boolean }) {
  const title = job.lastBuild?.result ?? job.color ?? 'Unknown';

  if (queued || job.inQueue || job.lastBuild?.building || job.color.includes('_anime')) {
    return (
      <span title="Build running">
        <LoaderCircle className="h-5 w-5 animate-spin text-foreground" />
      </span>
    );
  }

  if (job.color === 'blue' || job.lastCompletedBuild?.result === 'SUCCESS') {
    return (
      <span title={title}>
        <CircleCheckBig className="h-5 w-5 text-emerald-600" />
      </span>
    );
  }

  if (job.color === 'red' || job.lastCompletedBuild?.result === 'FAILURE') {
    return (
      <span title={title}>
        <CircleX className="h-5 w-5 text-red-600" />
      </span>
    );
  }

  if (job.color === 'aborted' || job.lastCompletedBuild?.result === 'ABORTED') {
    return (
      <span title={title}>
        <CircleAlert className="h-5 w-5 text-amber-600" />
      </span>
    );
  }

  return (
    <span title={title}>
      <CircleDashed className="h-5 w-5 text-muted-foreground" />
    </span>
  );
}

function WeatherIcon({ score, title }: { score: number; title?: string }) {
  if (score >= 80) {
    return (
      <span title={title}>
        <SunMedium className="h-5 w-5 text-amber-500" />
      </span>
    );
  }

  if (score >= 60) {
    return (
      <span title={title}>
        <SunMedium className="h-5 w-5 text-amber-400" />
      </span>
    );
  }

  if (score >= 40) {
    return (
      <span title={title}>
        <SunMedium className="h-5 w-5 text-amber-300" />
      </span>
    );
  }

  return (
    <span title={title}>
      <SunMedium className="h-5 w-5 text-muted-foreground" />
    </span>
  );
}
