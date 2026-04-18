import Link from 'next/link';
import { RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageSpinnerLoadingState } from '@/components/ui/PageSpinnerLoadingState';
import { TableRowsSkeleton } from '@/components/ui/LoadingPrimitives';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ProjectsTableClient } from './projects-table-client';
import type { ProjectRegistryRecord } from '@/types/project';

export function ProjectsPanelShell({
  content,
  refreshHref = '/projects',
}: {
  content: React.ReactNode;
  refreshHref?: string;
}) {
  return (
    <section>
      <Card className="rounded-[2rem] border shadow-none">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl">Projects registry</CardTitle>
            <CardDescription className="text-sm leading-7">
              Provisioned projects and legacy board-only workspaces are listed here with direct board access.
            </CardDescription>
          </div>
          <Button asChild variant="secondary">
            <Link href={refreshHref}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-5">{content}</CardContent>
      </Card>
    </section>
  );
}

export function ProjectsPanelData({
  projects,
  error,
  jenkinsUrl,
}: {
  projects: ProjectRegistryRecord[];
  error: string | null;
  jenkinsUrl: string | null;
}) {
  if (error) {
    return (
      <Alert variant="error">
        <AlertTitle>Could not load projects</AlertTitle>
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  if (!projects.length) {
      return (
        <div className="rounded-[1.5rem] border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
        No boards have been created yet.
        </div>
      );
  }

  return <ProjectsTable projects={projects} jenkinsUrl={jenkinsUrl} />;
}

export function ProjectsTable({
  projects,
  jenkinsUrl,
}: {
  projects: ProjectRegistryRecord[];
  jenkinsUrl: string | null;
}) {
  return <ProjectsTableClient projects={projects} jenkinsUrl={jenkinsUrl} />;
}

export function ProjectsTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Framework</TableHead>
            <TableHead>Active Tasks</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Board</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRowsSkeleton rows={5} columns={5} />
        </TableBody>
      </Table>
    </div>
  );
}

export function ProjectsTableLoadingState() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border">
      <div className="grid grid-cols-[minmax(0,1.35fr)_0.8fr_0.8fr_0.9fr_0.7fr] gap-4 border-b bg-muted/20 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
        <span>Project</span>
        <span>Framework</span>
        <span>Active Tasks</span>
        <span>Created</span>
        <span className="text-right">Board</span>
      </div>

      <PageSpinnerLoadingState
        className="rounded-none border-0"
        label="Loading registry"
        title="Fetching latest project boards..."
        description="Preparing the projects registry and board metadata."
        minHeightClassName="min-h-[260px]"
      />
    </div>
  );
}
