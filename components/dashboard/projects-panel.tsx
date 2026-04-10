import Link from 'next/link';
import { ArrowUpRight, FolderKanban, RefreshCw } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { FrameworkIcon } from '@/components/ui/FrameworkIcon';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { TableRowsSkeleton } from '@/components/ui/LoadingPrimitives';
import { formatRelativeTime } from '@/lib/utils';
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
}: {
  projects: ProjectRegistryRecord[];
  error: string | null;
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

  return <ProjectsTable projects={projects} />;
}

export function ProjectsTable({ projects }: { projects: ProjectRegistryRecord[] }) {
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
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.client_name}</p>
                  {project.repo_url ? (
                    <Link
                      href={project.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Open repo
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="gap-1.5">
                  <FrameworkIcon framework={project.framework} />
                  {project.framework}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{project.open_task_count} active</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatRelativeTime(project.created_at)}</TableCell>
              <TableCell className="text-right">
                <Button asChild variant="secondary">
                  <HoverPrefetchLink href={`/projects/${project.name}`}>
                    <FolderKanban className="h-4 w-4" />
                    Open Board
                  </HoverPrefetchLink>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
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
