import { NextRequest, NextResponse } from 'next/server';

import { getJenkinsFolders, isJenkinsConfigured, isJenkinsEnabled, triggerBuild } from '@/lib/jenkins';

export async function GET() {
  const renderedAt = new Date().toISOString();

  if (!isJenkinsEnabled()) {
    return NextResponse.json({
      success: true,
      data: {
        folders: [],
        renderedAt,
      },
      disabled: true,
      message: 'Jenkins integration is disabled for now.',
    });
  }

  if (!isJenkinsConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'JENKINS_URL, JENKINS_USER, and JENKINS_TOKEN must be configured',
      },
      { status: 500 }
    );
  }

  try {
    const folders = await getJenkinsFolders();

    return NextResponse.json({ success: true, data: { folders, renderedAt } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not connect to Jenkins';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isJenkinsEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error: 'Jenkins integration is disabled.',
      },
      { status: 400 }
    );
  }

  if (!isJenkinsConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error: 'JENKINS_URL, JENKINS_USER, and JENKINS_TOKEN must be configured',
      },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as { jobUrl?: string };

    if (!body.jobUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'A Jenkins job URL is required.',
        },
        { status: 400 }
      );
    }

    const result = await triggerBuild(body.jobUrl);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not trigger the Jenkins build';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
