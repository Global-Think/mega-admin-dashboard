import { Suspense } from 'react';
import Link from 'next/link';

import { ProjectBoardClient } from '@/components/projects/ProjectBoardClient';
import { ProjectBoardLoadingState } from '@/components/projects/ProjectBoardLoadingState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { getProjectByName } from '@/lib/dashboard-data';

export const dynamic = 'force-dynamic';

export default function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  return (
    <Suspense fallback={<ProjectBoardLoadingState />}>
      <ProjectBoardContent params={params} />
    </Suspense>
  );
}

async function ProjectBoardContent({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  const { projectName } = await params;
  const result = await getProjectByName(projectName)
    .then((project) => ({ project, error: null as string | null }))
    .catch((error) => ({
      project: null,
      error: error instanceof Error ? error.message : 'Project not found',
    }));

  if (!result.project) {
    return (
      <Alert variant="error">
        <AlertTitle>Unable to load the board</AlertTitle>
        <AlertDescription className="text-red-700">
          {result.error}.{' '}
          <Link href="/projects" className="underline underline-offset-4">
            Return to the projects registry
          </Link>
          .
        </AlertDescription>
      </Alert>
    );
  }

  const project = result.project;

  return <ProjectBoardClient initialProject={project} />;
}
