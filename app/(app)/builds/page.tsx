import { Suspense } from 'react';

import {
  JenkinsMetricCards,
  JenkinsPanelData,
  JenkinsPanelLoadingState,
  JenkinsPanelShell,
  JenkinsRenderedAt,
} from '@/components/dashboard/jenkins-panel';
import { getJenkinsOverview } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default function BuildsPage() {
  return (
    <Suspense fallback={<JenkinsPanelLoadingState />}>
      <BuildsContentSection />
    </Suspense>
  );
}

async function BuildsContentSection() {
  const overview = await getJenkinsOverview();

  return (
    <JenkinsPanelShell
      metrics={<JenkinsMetricCards folders={overview.folders} />}
      renderedAt={<JenkinsRenderedAt renderedAt={overview.renderedAt} />}
      content={
        <JenkinsPanelData
          folders={overview.folders}
          error={overview.error}
          disabledMessage={overview.disabledMessage}
          renderedAt={overview.renderedAt}
        />
      }
    />
  );
}
