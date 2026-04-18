import { LoaderCircle } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export function PageSpinnerLoadingState({
  title,
  description,
  label = 'Loading',
  className,
  minHeightClassName = 'min-h-[220px]',
}: {
  title: string;
  description: string;
  label?: string;
  className?: string;
  minHeightClassName?: string;
}) {
  return (
    <div className={cn('rounded-[1.75rem] border bg-muted/[0.08] p-6 sm:p-8', className)}>
      <div className={cn('flex flex-col items-center justify-center gap-5 text-center', minHeightClassName)}>
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full border bg-background/80 shadow-sm">
          <div className="page-spinner-ring h-10 w-10 rounded-full" />
          <LoaderCircle className="absolute h-4 w-4 animate-spin text-foreground motion-reduce:animate-none" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-center">
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] tracking-[0.18em]">
              {label}
            </Badge>
          </div>
          <p className="text-sm font-medium">{title}</p>
          <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
