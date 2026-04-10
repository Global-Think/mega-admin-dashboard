import 'server-only';
import { cache } from 'react';

import type {
  JenkinsFolder,
  ProjectOverview,
  ProjectRecord,
  ProjectRegistryRecord,
  ProjectWithColumns,
} from '@/types/project';
import { getRepoSlug, listOwnedRepositoryNames, repositoryExists } from '@/lib/github';
import { flattenJenkinsJobs, getJenkinsFolders, isJenkinsConfigured, isJenkinsEnabled } from '@/lib/jenkins';
import { getSupabaseClient } from '@/lib/supabase';
import type { FrameworkType } from '@/types/project';

type JenkinsOverviewResult = {
  folders: JenkinsFolder[];
  jobs: ProjectOverview[];
  error: string | null;
  disabledMessage: string | null;
  renderedAt: string;
};

type BoardOverviewResult = {
  totalCards: number;
  backlog: number;
  inProgress: number;
  inReview: number;
  done: number;
  highPriority: number;
  frontendCards: number;
  backendCards: number;
  completionRate: number;
};

type ProjectRegistryQueryResult = ProjectRecord & {
  kanban_columns?: Array<{
    name: string;
    kanban_cards?: Array<{
      id: string;
    }>;
  }>;
};

export const getProjects = cache(async (): Promise<ProjectRegistryRecord[]> => {
  const { data, error } = await getSupabaseClient()
    .from('projects')
    .select('id, name, client_name, framework, repo_url, created_at, kanban_columns(name, kanban_cards(id))')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const visibleProjects = await filterProjectsWithExistingRepos((data ?? []) as ProjectRegistryQueryResult[]);

  return visibleProjects.map((project) => ({
    id: project.id,
    name: project.name,
    client_name: project.client_name,
    framework: project.framework,
    repo_url: project.repo_url,
    created_at: project.created_at,
    open_task_count: project.kanban_columns?.reduce((count, column) => {
      const isDoneColumn = column.name.trim().toLowerCase() === 'done';
      if (isDoneColumn) {
        return count;
      }

      return count + (column.kanban_cards?.length ?? 0);
    }, 0) ?? 0,
  }));
});

export const getProjectByName = cache(async (projectName: string): Promise<ProjectWithColumns> => {
  const { data, error } = await getSupabaseClient()
    .from('projects')
    .select(
      'id, name, client_name, framework, repo_url, created_at, kanban_columns(id, project_id, side, name, position, created_at, kanban_cards(id, column_id, project_id, title, description, position, assignee, priority, created_at))'
    )
    .eq('name', projectName)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not load project');
  }

  const repoSlug = getRepoSlug(data.name, data.repo_url);
  const shouldHideProject = await shouldHideProjectFromGitHub(repoSlug);

  if (shouldHideProject) {
    throw new Error('Project no longer exists in GitHub');
  }

  return data;
});

export const getJenkinsOverview = cache(async (): Promise<JenkinsOverviewResult> => {
  const renderedAt = new Date().toISOString();

  if (!isJenkinsEnabled()) {
    return {
      folders: [],
      jobs: [],
      error: null,
      disabledMessage: 'Jenkins integration is disabled for now.',
      renderedAt,
    };
  }

  if (!isJenkinsConfigured()) {
    return {
      folders: [],
      jobs: [],
      error: 'JENKINS_URL, JENKINS_USER, and JENKINS_TOKEN must be configured',
      disabledMessage: null,
      renderedAt,
    };
  }

  try {
    const folders = await getJenkinsFolders();
    const overview = flattenJenkinsJobs(folders);

    return {
      folders,
      jobs: overview,
      error: null,
      disabledMessage: null,
      renderedAt,
    };
  } catch (error) {
    return {
      folders: [],
      jobs: [],
      error: error instanceof Error ? error.message : 'Could not connect to Jenkins',
      disabledMessage: null,
      renderedAt,
    };
  }
});

export const getDashboardOverviewData = cache(async () => {
  const [dashboardProjects, jenkins] = await Promise.all([getDashboardProjects(), getJenkinsOverview()]);

  const frameworkCounts = {
    nextjs: 0,
    vue3: 0,
    angular: 0,
  };

  const boardOverview: BoardOverviewResult = {
    totalCards: 0,
    backlog: 0,
    inProgress: 0,
    inReview: 0,
    done: 0,
    highPriority: 0,
    frontendCards: 0,
    backendCards: 0,
    completionRate: 0,
  };

  for (const project of dashboardProjects) {
    if (isFrameworkType(project.framework)) {
      frameworkCounts[project.framework] += 1;
    }

    for (const column of project.kanban_columns ?? []) {
      const cards = column.kanban_cards ?? [];
      const normalizedName = column.name.trim().toLowerCase();

      boardOverview.totalCards += cards.length;

      if (column.side === 'fe') {
        boardOverview.frontendCards += cards.length;
      }

      if (column.side === 'be') {
        boardOverview.backendCards += cards.length;
      }

      for (const card of cards) {
        if (card.priority === 'high') {
          boardOverview.highPriority += 1;
        }
      }

      if (normalizedName === 'backlog') {
        boardOverview.backlog += cards.length;
      } else if (normalizedName === 'in progress') {
        boardOverview.inProgress += cards.length;
      } else if (normalizedName === 'in review') {
        boardOverview.inReview += cards.length;
      } else if (normalizedName === 'done') {
        boardOverview.done += cards.length;
      }
    }
  }

  boardOverview.completionRate = boardOverview.totalCards
    ? Math.round((boardOverview.done / boardOverview.totalCards) * 100)
    : 0;

  const buildCounts = {
    success: jenkins.jobs.filter((job) => job.color === 'blue').length,
    failed: jenkins.jobs.filter((job) => job.color === 'red').length,
    running: jenkins.jobs.filter((job) => job.color.includes('_anime') || job.inQueue).length,
    never: jenkins.jobs.filter((job) => job.color === 'notbuilt').length,
  };

  const recentProjects = dashboardProjects.slice(0, 5).map((project) => ({
    id: project.id,
    name: project.name,
    client_name: project.client_name,
    framework: project.framework,
    repo_url: project.repo_url,
    created_at: project.created_at,
  }));
  const latestBuilds = [...jenkins.jobs]
    .filter((job) => job.lastBuild)
    .sort((left, right) => (right.lastBuild?.timestamp ?? 0) - (left.lastBuild?.timestamp ?? 0))
    .slice(0, 6);

  return {
    jenkins,
    recentProjects,
    latestBuilds,
    frameworkCounts,
    boardOverview,
    buildCounts,
    totals: {
      projects: dashboardProjects.length,
      openTasks: Math.max(boardOverview.totalCards - boardOverview.done, 0),
      runningBuilds: buildCounts.running,
      failedBuilds: buildCounts.failed,
    },
  };
});

function isFrameworkType(value: string): value is FrameworkType {
  return value === 'nextjs' || value === 'vue3' || value === 'angular';
}

type DashboardProject = ProjectRecord & {
  kanban_columns?: Array<{
    name: string;
    side: 'fe' | 'be';
    kanban_cards?: Array<{
      id: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }>;
};

async function getDashboardProjects(): Promise<DashboardProject[]> {
  const { data, error } = await getSupabaseClient()
    .from('projects')
    .select(
      'id, name, client_name, framework, repo_url, created_at, kanban_columns(name, side, kanban_cards(id, priority))'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return filterProjectsWithExistingRepos((data ?? []) as DashboardProject[]);
}

type GitHubBackedProject = {
  name: string;
  repo_url: string | null;
};

async function filterProjectsWithExistingRepos<T extends GitHubBackedProject>(projects: T[]): Promise<T[]> {
  if (projects.length === 0) {
    return [];
  }

  try {
    const repositoryNames = await listOwnedRepositoryNames();

    return projects.filter((project) =>
      repositoryNames.has(getRepoSlug(project.name, project.repo_url).toLowerCase())
    );
  } catch (error) {
    console.error('Could not verify project repositories against GitHub.', error);
    return projects;
  }
}

async function shouldHideProjectFromGitHub(repoSlug: string): Promise<boolean> {
  try {
    return !(await repositoryExists(repoSlug));
  } catch (error) {
    console.error(`Could not verify GitHub repository "${repoSlug}".`, error);
    return false;
  }
}
