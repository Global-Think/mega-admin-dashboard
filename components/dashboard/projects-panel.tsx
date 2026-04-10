import { RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
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
              Every provisioned project is listed here with framework, client, creation time, repository, and direct board
              access.
            </CardDescription>
          </div>
          <Button asChild variant="secondary">
            <HoverPrefetchLink href={refreshHref}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </HoverPrefetchLink>
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
        No projects have been provisioned yet.
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
