import {
  JenkinsMetricCardsSkeleton,
  JenkinsPanelShell,
  JenkinsRenderedAtSkeleton,
  JenkinsTableSkeleton,
} from '@/components/dashboard/jenkins-panel';

export default function BuildsLoading() {
  return (
    <JenkinsPanelShell
      metrics={<JenkinsMetricCardsSkeleton />}
      renderedAt={<JenkinsRenderedAtSkeleton />}
      content={<JenkinsTableSkeleton />}
    />
  );
}
