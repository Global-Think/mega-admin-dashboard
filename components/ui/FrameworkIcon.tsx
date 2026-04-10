import { cn } from '@/lib/utils';
import type { FrameworkType } from '@/types/project';

export function FrameworkIcon({
  framework,
  className,
}: {
  framework: FrameworkType;
  className?: string;
}) {
  if (framework === 'nextjs') {
    return (
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={cn('h-4 w-4', className)}
        fill="none"
      >
        <path
          d="M24.3 24 12.5 8.5H9.2v15h2.6V12l10.4 13.5c.7-.4 1.4-.9 1.7-1.5Z"
          fill="currentColor"
        />
        <path d="M20.7 8.5h2.6v15h-2.6z" fill="currentColor" />
      </svg>
    );
  }

  if (framework === 'vue3') {
    return (
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={cn('h-4 w-4', className)}
        fill="none"
      >
        <path d="M26.7 6h-5.1L16 15.2 10.4 6H5.3L16 24.6 26.7 6Z" fill="#41B883" />
        <path d="M21.6 6h-3.7L16 9.2 14.1 6h-3.7L16 15.7 21.6 6Z" fill="#35495E" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('h-4 w-4', className)}
      fill="none"
    >
      <path
        d="M16 3 4.6 7.1l1.7 15L16 29l9.7-6.9 1.7-15L16 3Z"
        fill="#DD0031"
      />
      <path
        d="M16 3v26l9.7-6.9 1.7-15L16 3Z"
        fill="#C3002F"
      />
      <path
        d="m16 5.9-7.1 15.9h2.6l1.4-3.4h6.1l1.4 3.4H23L16 5.9Zm2 10.4h-4l2-4.8 2 4.8Z"
        fill="#fff"
      />
    </svg>
  );
}
