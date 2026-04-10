'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  PlusCircle,
  Workflow,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { SignOutButton } from './SignOutButton';
import { getNavigationForPath, type ShellNavSection } from './navigation';
import type { NavIcon } from './navigation';

const SIDEBAR_STORAGE_KEY = 'mega-admin-sidebar-collapsed';
const sidebarListeners = new Set<() => void>();

function subscribeToSidebarStore(listener: () => void) {
  sidebarListeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SIDEBAR_STORAGE_KEY) {
      listener();
    }
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    sidebarListeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
}

function getSidebarSnapshot() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
}

function updateSidebarSnapshot(nextValue: boolean) {
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextValue));
  sidebarListeners.forEach((listener) => listener());
}

const iconMap = {
  overview: LayoutDashboard,
  launch: PlusCircle,
  projects: FolderKanban,
  builds: Workflow,
  board: BarChart3,
  repo: GitBranch,
} satisfies Record<NavIcon, typeof LayoutDashboard>;

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const collapsed = useSyncExternalStore(subscribeToSidebarStore, getSidebarSnapshot, () => false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthRoute = pathname === '/login' || pathname.startsWith('/auth/');

  if (isAuthRoute) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  const navSections = getNavigationForPath(pathname);

  return (
    <main className="page-fade min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px] gap-6 px-4 py-4 md:px-6 md:py-6">
        <div className="lg:hidden">
          <Button
            variant="secondary"
            size="icon"
            className="fixed left-4 top-4 z-40 rounded-full"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-[290px] bg-background p-3" onClick={(event) => event.stopPropagation()}>
              <SidebarCard
                collapsed={false}
                navSections={navSections}
                onToggleCollapse={() => setMobileOpen(false)}
                mobile
              />
            </div>
          </div>
        ) : null}

        <aside
          className={cn(
            'hidden shrink-0 transition-[width] duration-200 lg:block',
            collapsed ? 'w-20' : 'w-64'
          )}
        >
          <SidebarCard
            collapsed={collapsed}
            navSections={navSections}
            onToggleCollapse={() => updateSidebarSnapshot(!collapsed)}
          />
        </aside>

        <div className="min-w-0 flex-1 pt-14 lg:pt-0">{children}</div>
      </div>
    </main>
  );
}

function SidebarCard({
  collapsed,
  navSections,
  onToggleCollapse,
  mobile = false,
}: {
  collapsed: boolean;
  navSections: ShellNavSection[];
  onToggleCollapse: () => void;
  mobile?: boolean;
}) {
  return (
    <Card className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[2rem] border shadow-none">
      <div className="border-b px-3 py-3">
        <div
          className={cn(
            'flex items-center gap-3',
            collapsed && !mobile ? 'flex-col justify-center' : 'justify-between'
          )}
        >
          <div
            className={cn(
              'flex min-w-0 items-center gap-3 overflow-hidden',
              collapsed && !mobile ? 'justify-center' : ''
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-primary text-primary-foreground">
              <span className="text-sm font-semibold tracking-tight">MA</span>
            </div>
            {!collapsed || mobile ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">Mega Admin</p>
                <p className="truncate text-xs text-muted-foreground">Internal task console</p>
              </div>
            ) : null}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onToggleCollapse}
            aria-label={mobile ? 'Close navigation' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {mobile ? (
              <X className="h-4 w-4" />
            ) : collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {navSections.map((section) => (
          <div key={section.label} className="space-y-2">
            {!collapsed || mobile ? (
              <p className="px-2 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {section.label}
              </p>
            ) : null}
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarItem key={item.href} item={item} collapsed={collapsed && !mobile} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t px-2 py-3">
        <SignOutButton collapsed={collapsed && !mobile} />
      </div>
    </Card>
  );
}

function SidebarItem({
  item,
  collapsed,
}: {
  item: ShellNavSection['items'][number];
  collapsed: boolean;
}) {
  const Icon = iconMap[item.icon];
  const classes = cn(
    'group flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors',
    item.active
      ? 'border-primary bg-primary text-primary-foreground hover:border-primary hover:bg-primary hover:text-primary-foreground'
      : 'border-transparent text-foreground hover:border-border hover:bg-muted/50 hover:text-foreground',
    collapsed ? 'justify-center px-2' : ''
  );

  return (
    <Link
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noreferrer' : undefined}
      className={classes}
      title={collapsed ? item.label : undefined}
    >
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border',
            item.active ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-border bg-background'
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        {!collapsed ? (
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{item.label}</span>
            <span className={cn('mt-1 block text-xs', item.active ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              {item.description}
            </span>
          </span>
        ) : null}

        {!collapsed && item.external ? <ArrowUpRight className="h-4 w-4 opacity-60" /> : null}
    </Link>
  );
}
