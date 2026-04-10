import { Suspense } from 'react';

import {
  JenkinsMetricCards,
  JenkinsMetricCardsSkeleton,
  JenkinsPanelData,
  JenkinsPanelShell,
  JenkinsRenderedAt,
  JenkinsRenderedAtSkeleton,
  JenkinsTableSkeleton,
} from '@/components/dashboard/jenkins-panel';
import { getJenkinsOverview } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default function BuildsPage() {
  return (
    <JenkinsPanelShell
      metrics={
        <Suspense fallback={<JenkinsMetricCardsSkeleton />}>
          <JenkinsMetricsSection />
        </Suspense>
      }
      renderedAt={
        <Suspense fallback={<JenkinsRenderedAtSkeleton />}>
          <JenkinsRenderedAtSection />
        </Suspense>
      }
      content={
        <Suspense fallback={<JenkinsTableSkeleton />}>
          <JenkinsContentSection />
        </Suspense>
      }
    />
  );
}

async function JenkinsMetricsSection() {
  const overview = await getJenkinsOverview();

  return <JenkinsMetricCards folders={overview.folders} />;
}

async function JenkinsRenderedAtSection() {
  const overview = await getJenkinsOverview();

  return <JenkinsRenderedAt renderedAt={overview.renderedAt} />;
}

async function JenkinsContentSection() {
  const overview = await getJenkinsOverview();

  return (
    <JenkinsPanelData
      folders={overview.folders}
      error={overview.error}
      disabledMessage={overview.disabledMessage}
      renderedAt={overview.renderedAt}
    />
  );
}
