import Link from 'next/link';
import { ArrowUpRight, FolderKanban } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FrameworkIcon } from '@/components/ui/FrameworkIcon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { buildJenkinsWebhookUrl } from '@/lib/jenkins-webhook';
import { formatRelativeTime } from '@/lib/utils';
import type { ProjectRegistryRecord } from '@/types/project';
import { ProjectWebhookDialogButton } from './ProjectWebhookDialogButton';

export function ProjectsTableClient({
  projects,
  jenkinsUrl,
}: {
  projects: ProjectRegistryRecord[];
  jenkinsUrl: string | null;
}) {
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
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{project.title}</p>
                    {project.source_type === 'legacy' ? <Badge variant="warning">Legacy</Badge> : null}
                  </div>
                  {project.source_type === 'provisioned' ? (
                    <p className="text-sm text-muted-foreground">{project.client_name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Board only</p>
                  )}
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
                {project.framework ? (
                  <Badge className="gap-1.5">
                    <FrameworkIcon framework={project.framework} />
                    {project.framework}
                  </Badge>
                ) : (
                  <Badge variant="neutral">Board only</Badge>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{project.open_task_count} active</Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{formatRelativeTime(project.created_at)}</TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="secondary">
                    <Link href={`/projects/${project.slug}`}>
                      <FolderKanban className="h-4 w-4" />
                      Open Board
                    </Link>
                  </Button>
                  {project.source_type === 'provisioned' ? (
                    <ProjectWebhookDialogButton
                      projectTitle={project.title}
                      projectSlug={project.slug}
                      webhookUrl={jenkinsUrl ? buildJenkinsWebhookUrl(jenkinsUrl, project.slug) : null}
                    />
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
