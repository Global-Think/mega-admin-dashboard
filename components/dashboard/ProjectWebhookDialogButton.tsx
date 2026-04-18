'use client';

import { Copy, Info } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

export function ProjectWebhookDialogButton({
  projectTitle,
  projectSlug,
  webhookUrl,
}: {
  projectTitle: string;
  projectSlug: string;
  webhookUrl: string | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open webhook details for ${projectTitle}`}
      >
        <Info className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Webhook details</DialogTitle>
            <DialogDescription>{projectTitle} GitHub webhook target for Jenkins.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <ConfigStat label="Repository token" value={projectSlug} />
              <ConfigStat label="Events" value="push" />
              <ConfigStat label="Content type" value="json" />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">Webhook URL</p>
              <div className="rounded-[1rem] border bg-muted/20 px-4 py-3">
                <p className="break-all font-mono text-sm">
                  {webhookUrl ?? 'JENKINS_URL is not configured on the server.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!webhookUrl) return;
                  await navigator.clipboard.writeText(webhookUrl);
                }}
                disabled={!webhookUrl}
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </Button>
            </div>
          </div>
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
