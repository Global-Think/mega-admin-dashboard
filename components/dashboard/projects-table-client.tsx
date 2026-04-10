'use client';

import Link from 'next/link';
import { ArrowUpRight, Copy, FolderKanban, Info } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { FrameworkIcon } from '@/components/ui/FrameworkIcon';
import { HoverPrefetchLink } from '@/components/ui/HoverPrefetchLink';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { buildJenkinsWebhookUrl } from '@/lib/jenkins-webhook';
import { formatRelativeTime } from '@/lib/utils';
import type { ProjectRegistryRecord } from '@/types/project';

export function ProjectsTableClient({
  projects,
  jenkinsUrl,
}: {
  projects: ProjectRegistryRecord[];
  jenkinsUrl: string | null;
}) {
  const [selectedProject, setSelectedProject] = useState<ProjectRegistryRecord | null>(null);
  const selectedWebhookUrl =
    selectedProject && jenkinsUrl ? buildJenkinsWebhookUrl(jenkinsUrl, selectedProject.name) : null;

  return (
    <>
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
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="secondary">
                      <HoverPrefetchLink href={`/projects/${project.name}`}>
                        <FolderKanban className="h-4 w-4" />
                        Open Board
                      </HoverPrefetchLink>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      aria-label={`Open webhook details for ${project.name}`}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={Boolean(selectedProject)} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook details</DialogTitle>
            <DialogDescription>
              {selectedProject ? `${selectedProject.name} GitHub webhook target for Jenkins.` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedProject ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <ConfigStat label="Repository token" value={selectedProject.name} />
                <ConfigStat label="Events" value="push" />
                <ConfigStat label="Content type" value="json" />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Webhook URL</p>
                <div className="rounded-[1rem] border bg-muted/20 px-4 py-3">
                  <p className="break-all font-mono text-sm">
                    {selectedWebhookUrl ?? 'JENKINS_URL is not configured on the server.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!selectedWebhookUrl) return;
                    await navigator.clipboard.writeText(selectedWebhookUrl);
                  }}
                  disabled={!selectedWebhookUrl}
                >
                  <Copy className="h-4 w-4" />
                  Copy URL
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ConfigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border bg-background px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}
