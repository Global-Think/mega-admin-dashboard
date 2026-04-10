import { Skeleton } from '@/components/ui/Skeleton';

export function MetricValueSkeleton() {
  return <Skeleton className="h-9 w-14" />;
}

export function CountBadgeSkeleton({ className }: { className?: string }) {
  return <Skeleton className={`h-6 w-10 rounded-full ${className ?? ''}`} />;
}

export function TextLineSkeleton({
  className,
}: {
  className?: string;
}) {
  return <Skeleton className={`h-4 rounded-full ${className ?? ''}`} />;
}

export function MiniStatSkeleton() {
  return (
    <div className="rounded-[1.25rem] border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">Loading</p>
      <div className="mt-1">
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function DistributionRowsSkeleton({
  rows,
}: {
  rows: number;
}) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground/70">Loading</span>
            <Skeleton className="h-4 w-8 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function StatusGridSkeleton({ items = 4 }: { items?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="rounded-[1.1rem] border bg-muted/15 p-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
            <span className="text-xs text-muted-foreground">Loading</span>
          </div>
          <div className="mt-2">
            <Skeleton className="h-8 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutStatsSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-[1.25rem] border bg-muted/15 p-4">
      <div className="relative h-24 w-24 shrink-0">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-5 w-8" />
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
              <span className="text-foreground/70">Loading</span>
            </div>
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListItemsSkeleton({
  items,
  trailingWidth = 'w-20',
}: {
  items: number;
  trailingWidth?: string;
}) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="rounded-[1.25rem] border p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <TextLineSkeleton className="w-40" />
              <TextLineSkeleton className="w-28" />
            </div>
            <Skeleton className={`h-6 rounded-full ${trailingWidth}`} />
          </div>
          <div className="mt-3 flex flex-wrap gap-4">
            <TextLineSkeleton className="w-24" />
            <TextLineSkeleton className="w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({
  rows,
  columns,
}: {
  rows: number;
  columns: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <td key={columnIndex} className="p-4 align-middle">
              <Skeleton className="h-5 w-full max-w-[140px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function BoardCountSkeleton({
  size = 'xs',
}: {
  size?: 'xs' | 'sm';
}) {
  return (
    <span className="inline-flex items-center justify-center">
      <Skeleton
        className={size === 'sm' ? 'h-[1.15rem] w-6 rounded-full' : 'h-[1rem] w-5 rounded-full'}
      />
    </span>
  );
}

export function BoardColumnLoadingState() {
  return (
    <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center rounded-[1rem] border border-dashed bg-background/70 px-6 text-sm text-muted-foreground">
      <div className="flex w-full max-w-[180px] flex-col items-center gap-3 text-center">
        <Skeleton className="h-2 w-20 rounded-full" />
        <span>Loading tasks...</span>
        <Skeleton className="h-2 w-28 rounded-full" />
      </div>
    </div>
  );
}
