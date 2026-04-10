'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

type HoverPrefetchLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
    children: ReactNode;
  };

export function HoverPrefetchLink({
  href,
  onMouseEnter,
  onFocus,
  onTouchStart,
  children,
  ...props
}: HoverPrefetchLinkProps) {
  const router = useRouter();

  const prefetchHref = () => {
    if (typeof href !== 'string' || !href.startsWith('/')) {
      return;
    }

    router.prefetch(href);
  };

  return (
    <Link
      href={href}
      onMouseEnter={(event) => {
        prefetchHref();
        onMouseEnter?.(event);
      }}
      onFocus={(event) => {
        prefetchHref();
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        prefetchHref();
        onTouchStart?.(event);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
