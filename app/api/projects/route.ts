import { NextResponse } from 'next/server';

import { getProjects } from '@/lib/dashboard-data';

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json(projects);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not load projects';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
