import { ProjectsPanelShell, ProjectsTableLoadingState } from '@/components/dashboard/projects-panel';

export default function ProjectsLoading() {
  return <ProjectsPanelShell content={<ProjectsTableLoadingState />} />;
}
