'use client';

import type { JenkinsFolder } from '@/types/project';
import { JenkinsJobsClient } from '@/components/dashboard/JenkinsJobsClient';

export function JenkinsJobsIsland({
  folders,
  renderedAt,
}: {
  folders: JenkinsFolder[];
  renderedAt: string;
}) {
  return <JenkinsJobsClient initialFolders={folders} initialRenderedAt={renderedAt} />;
}
