import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border bg-background text-foreground',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        neutral: 'border-zinc-200 bg-background text-foreground',
        warning: 'border-amber-200 bg-amber-50 text-amber-700',
        danger: 'border-red-200 bg-red-50 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  }
);

export function Badge({
  className,
  children,
  variant,
}: {
  className?: string;
  children: React.ReactNode;
  variant?: VariantProps<typeof badgeVariants>['variant'];
}) {
  return <span className={cn(badgeVariants({ variant }), className)}>{children}</span>;
}

export { badgeVariants };
