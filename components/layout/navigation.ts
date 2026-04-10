export type NavIcon = 'overview' | 'launch' | 'projects' | 'builds' | 'board' | 'repo';

export type ShellNavSection = {
  label: string;
  items: Array<{
    label: string;
    description: string;
    icon: NavIcon;
    href: string;
    active?: boolean;
    external?: boolean;
  }>;
};

export type ShellAction = {
  label: string;
  href: string;
  variant?: 'default' | 'secondary' | 'ghost';
  icon?: NavIcon;
  external?: boolean;
};

export function getPrimaryNavigation(currentPath: string): ShellNavSection[] {
  return [
    {
      label: 'Workspace',
      items: [
        {
          label: 'Overview',
          description: 'Charts, metrics, and recent activity',
          icon: 'overview',
          href: '/',
          active: currentPath === '/',
        },
        {
          label: 'Launch Project',
          description: 'Create repo and seed board',
          icon: 'launch',
          href: '/launch',
          active: currentPath === '/launch',
        },
        {
          label: 'Projects Registry',
          description: 'Browse active boards',
          icon: 'projects',
          href: '/projects',
          active: currentPath === '/projects',
        },
        {
          label: 'Build Visibility',
          description: 'Track Jenkins status',
          icon: 'builds',
          href: '/builds',
          active: currentPath === '/builds',
        },
      ],
    },
  ];
}

export function getBoardNavigation(projectName: string): ShellNavSection[] {
  return [
    ...getPrimaryNavigation('/projects'),
    {
      label: 'Current Board',
      items: [
        {
          label: projectName,
          description: 'Active task board',
          icon: 'board',
          href: `/projects/${projectName}`,
          active: true,
        },
      ],
    },
  ];
}

export function getNavigationForPath(pathname: string): ShellNavSection[] {
  if (pathname.startsWith('/projects/') && pathname !== '/projects') {
    const projectName = decodeURIComponent(pathname.split('/')[2] ?? 'Project Board');
    return getBoardNavigation(projectName);
  }

  if (pathname === '/launch') {
    return getPrimaryNavigation('/launch');
  }

  if (pathname === '/projects') {
    return getPrimaryNavigation('/projects');
  }

  if (pathname === '/builds') {
    return getPrimaryNavigation('/builds');
  }

  return getPrimaryNavigation('/');
}
