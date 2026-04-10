import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva('relative w-full rounded-2xl border p-4', {
  variants: {
    variant: {
      default: 'bg-card text-card-foreground',
      subtle: 'bg-muted/40 text-foreground',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-950',
      error: 'border-red-200 bg-red-50 text-red-950',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  return <div role="alert" className={cn(alertVariants({ variant }), className)} {...props} />;
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}
