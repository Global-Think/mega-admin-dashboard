import { ProjectsPanelShell, ProjectsTableSkeleton } from '@/components/dashboard/projects-panel';

export default function ProjectsLoading() {
  return <ProjectsPanelShell content={<ProjectsTableSkeleton />} />;
}
