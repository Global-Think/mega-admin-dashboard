import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/Card';
import { Separator } from '@/components/ui/Separator';
import { Skeleton } from '@/components/ui/Skeleton';

type LoadingSurfaceProps = {
  title: string;
  description: string;
  className?: string;
  minHeightClassName?: string;
  footer?: string;
  statusLabels?: string[];
  children?: React.ReactNode;
};

export function LoadingSurface({
  title,
  description,
  className,
  minHeightClassName = 'min-h-[320px]',
  footer = 'Content will appear here as soon as the request is ready.',
  statusLabels = ['Loading data', 'Preparing layout'],
  children,
}: LoadingSurfaceProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[1.5rem] border bg-muted/[0.08]',
        minHeightClassName,
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-border/60">
        <div className="h-full w-1/3 rounded-full bg-primary/30 animate-pulse" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_42%)]" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {statusLabels.map((label) => (
              <Badge key={label} variant="secondary" className="rounded-full px-3 py-1 text-[11px] tracking-[0.18em]">
                {label}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">{title}</p>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>

          <Separator />

          {children ?? <DefaultLoadingPreview />}
        </div>

        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          {footer}
        </p>
      </div>
    </div>
  );
}

export function LoadingMetricCard({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Card className={cn('rounded-[1.75rem] border shadow-none', className)}>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardDescription className="text-xs font-medium uppercase tracking-[0.24em]">{title}</CardDescription>
          <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] tracking-[0.18em]">
            Loading
          </Badge>
        </div>

        <div className="space-y-3">
          <Skeleton className="h-2.5 w-24 rounded-full" />
          <div className="h-1.5 overflow-hidden rounded-full bg-border/70">
            <div className="h-full w-2/5 rounded-full bg-primary/30 animate-pulse" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function DefaultLoadingPreview() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
      <PreviewCard className="min-h-[180px]">
        <Skeleton className="h-3 w-32 rounded-full" />
        <Skeleton className="h-24 rounded-[1rem]" />
        <Skeleton className="h-16 rounded-[1rem]" />
      </PreviewCard>

      <div className="grid gap-4">
        <PreviewCard>
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-12 rounded-[1rem]" />
        </PreviewCard>
        <PreviewCard>
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="h-20 rounded-[1rem]" />
        </PreviewCard>
      </div>
    </div>
  );
}

function PreviewCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('space-y-4 rounded-[1.25rem] border bg-background/80 p-4', className)}>{children}</div>;
}
