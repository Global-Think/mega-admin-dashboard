import { NextResponse } from 'next/server';

import { getProjectByName } from '@/lib/dashboard-data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectName: string }> }
) {
  const { projectName } = await params;

  try {
    const project = await getProjectByName(projectName);
    return NextResponse.json(project);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load project';
    const status = message === 'Project no longer exists in GitHub' ? 404 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
