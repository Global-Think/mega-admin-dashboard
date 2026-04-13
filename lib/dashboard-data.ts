import 'server-only';
import { cache } from 'react';

import type {
  BoardRecord,
  JenkinsFolder,
  ProjectOverview,
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

type RegistryBoardQueryResult = BoardRecord & {
  kanban_columns?: Array<{
    name: string;
    kanban_cards?: Array<{
      id: string;
    }>;
  }>;
};

type DashboardBoard = BoardRecord & {
  kanban_columns?: Array<{
    name: string;
    side: 'fe' | 'be';
    kanban_cards?: Array<{
      id: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }>;
};

export const getProjects = cache(async (): Promise<ProjectRegistryRecord[]> => {
  const { data, error } = await getSupabaseClient()
    .from('project_boards')
    .select(
      'id, slug, title, client_name, source_type, project_id, framework, repo_url, created_at, kanban_columns(name, kanban_cards(id))'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const visibleBoards = await filterVisibleBoards((data ?? []) as RegistryBoardQueryResult[]);

  return visibleBoards.map((board) => ({
    id: board.id,
    slug: board.slug,
    title: board.title,
    client_name: board.client_name,
    source_type: board.source_type,
    project_id: board.project_id,
    framework: board.framework,
    repo_url: board.repo_url,
    created_at: board.created_at,
    open_task_count: board.kanban_columns?.reduce((count, column) => {
      const isDoneColumn = column.name.trim().toLowerCase() === 'done';
      if (isDoneColumn) {
        return count;
      }

      return count + (column.kanban_cards?.length ?? 0);
    }, 0) ?? 0,
  }));
});

export const getProjectByName = cache(async (boardSlug: string): Promise<ProjectWithColumns> => {
  const { data, error } = await getSupabaseClient()
    .from('project_boards')
    .select(
      'id, slug, title, client_name, source_type, project_id, framework, repo_url, created_at, kanban_columns(id, board_id, side, name, position, created_at, kanban_cards(id, column_id, board_id, title, description, position, assignee, priority, created_at))'
    )
    .eq('slug', boardSlug)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Could not load project board');
  }

  if (data.source_type === 'provisioned') {
    const repoSlug = getRepoSlug(data.slug, data.repo_url);
    const shouldHideBoard = await shouldHideBoardFromGitHub(repoSlug);

    if (shouldHideBoard) {
      throw new Error('Project no longer exists in GitHub');
    }
  }

  return data as ProjectWithColumns;
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
  const [dashboardBoards, jenkins] = await Promise.all([getDashboardBoards(), getJenkinsOverview()]);

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

  for (const board of dashboardBoards) {
    if (isFrameworkType(board.framework)) {
      frameworkCounts[board.framework] += 1;
    }

    for (const column of board.kanban_columns ?? []) {
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

  const recentProjects = dashboardBoards.slice(0, 5).map((board) => ({
    id: board.id,
    slug: board.slug,
    title: board.title,
    client_name: board.client_name,
    source_type: board.source_type,
    project_id: board.project_id,
    framework: board.framework,
    repo_url: board.repo_url,
    created_at: board.created_at,
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
      projects: dashboardBoards.length,
      openTasks: Math.max(boardOverview.totalCards - boardOverview.done, 0),
      runningBuilds: buildCounts.running,
      failedBuilds: buildCounts.failed,
    },
  };
});

function isFrameworkType(value: string | null): value is FrameworkType {
  return value === 'nextjs' || value === 'vue3' || value === 'angular';
}

async function getDashboardBoards(): Promise<DashboardBoard[]> {
  const { data, error } = await getSupabaseClient()
    .from('project_boards')
    .select(
      'id, slug, title, client_name, source_type, project_id, framework, repo_url, created_at, kanban_columns(name, side, kanban_cards(id, priority))'
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return filterVisibleBoards((data ?? []) as DashboardBoard[]);
}

type GitHubBackedBoard = {
  slug: string;
  source_type: 'provisioned' | 'legacy';
  repo_url: string | null;
  created_at: string;
};

async function filterVisibleBoards<T extends GitHubBackedBoard>(boards: T[]): Promise<T[]> {
  if (boards.length === 0) {
    return [];
  }

  const legacyBoards = boards.filter((board) => board.source_type === 'legacy');
  const provisionedBoards = boards.filter((board) => board.source_type === 'provisioned');

  if (provisionedBoards.length === 0) {
    return legacyBoards;
  }

  try {
    const repositoryNames = await listOwnedRepositoryNames();
    const visibleProvisionedBoards = provisionedBoards.filter((board) =>
      repositoryNames.has(getRepoSlug(board.slug, board.repo_url).toLowerCase())
    );

    return [...legacyBoards, ...visibleProvisionedBoards].sort(
      (left, right) => Date.parse(right.created_at ?? '') - Date.parse(left.created_at ?? '')
    );
  } catch (error) {
    console.error('Could not verify project repositories against GitHub.', error);
    return boards;
  }
}

async function shouldHideBoardFromGitHub(repoSlug: string): Promise<boolean> {
  try {
    return !(await repositoryExists(repoSlug));
  } catch (error) {
    console.error(`Could not verify GitHub repository "${repoSlug}".`, error);
    return false;
  }
}
