import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Mega Admin',
  description: 'Internal tooling for automated project bootstrapping and task visibility.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
