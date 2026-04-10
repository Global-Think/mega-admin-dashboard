import { Suspense } from 'react';

import {
  ProjectsPanelData,
  ProjectsPanelShell,
  ProjectsTableSkeleton,
} from '@/components/dashboard/projects-panel';
import { getProjects } from '@/lib/dashboard-data';
import type { ProjectRegistryRecord } from '@/types/project';

export const dynamic = 'force-dynamic';

export default function ProjectsPage() {
  return (
    <ProjectsPanelShell
      content={
        <Suspense fallback={<ProjectsTableSkeleton />}>
          <ProjectsDataSection />
        </Suspense>
      }
    />
  );
}

async function ProjectsDataSection() {
  let projects: ProjectRegistryRecord[] = [];
  let error: string | null = null;

  try {
    projects = await getProjects();
  } catch (fetchError) {
    error = fetchError instanceof Error ? fetchError.message : 'Could not load projects';
  }

  return <ProjectsPanelData projects={projects} error={error} jenkinsUrl={process.env.JENKINS_URL ?? null} />;
}
