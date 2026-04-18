import { AppSidebarClient } from '@/components/layout/AppSidebarClient';

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 px-4 py-4 md:px-6 md:py-6">
        <AppSidebarClient />
        <div className="min-w-0 flex-1 pt-14 lg:pt-0">{children}</div>
      </div>
    </main>
  );
}
