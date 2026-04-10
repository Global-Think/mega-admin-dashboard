const GITHUB_API_BASE = 'https://api.github.com';

function getGitHubHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    throw new Error('GITHUB_TOKEN is not configured');
  }

  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function getOwner(): string {
  const owner = process.env.GITHUB_OWNER;

  if (!owner) {
    throw new Error('GITHUB_OWNER is not configured');
  }

  return owner;
}

function getOwnerType(): 'user' | 'org' {
  const ownerType = process.env.GITHUB_OWNER_TYPE?.toLowerCase();

  if (ownerType === 'org') {
    return 'org';
  }

  return 'user';
}

async function githubRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...getGitHubHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatGitHubError(response.status, errorText));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

type GitHubErrorPayload = {
  message?: string;
  errors?: Array<{
    resource?: string;
    code?: string;
    field?: string;
    message?: string;
  }>;
};

function formatGitHubError(status: number, errorText: string): string {
  let payload: GitHubErrorPayload | null = null;

  try {
    payload = JSON.parse(errorText) as GitHubErrorPayload;
  } catch {
    payload = null;
  }

  const details = payload?.errors?.map((error) => error.message).filter(Boolean) ?? [];

  if (status === 422 && details.some((detail) => detail?.includes('name already exists on this account'))) {
    return 'A repository with this project name already exists in your GitHub account. Choose a different project name.';
  }

  if (status === 404) {
    return 'GitHub could not find the target account or repository. Check GITHUB_OWNER and repository permissions.';
  }

  if (status === 401 || status === 403) {
    return 'GitHub rejected the request. Check that your token is valid and has the required repository permissions.';
  }

  if (details.length > 0) {
    return details.join(' ');
  }

  if (payload?.message) {
    return payload.message;
  }

  return `GitHub request failed (${status}).`;
}

interface GitHubRepositoryResponse {
  name: string;
  clone_url: string;
  html_url: string;
  default_branch: string;
}

interface GitHubRefResponse {
  object: {
    sha: string;
  };
}

interface GitHubRepositoryListItem {
  name: string;
  owner?: {
    login?: string;
  };
}

export async function createRepo(projectName: string, clientName: string): Promise<string> {
  const owner = getOwner();
  const ownerType = getOwnerType();
  const url =
    ownerType === 'org'
      ? `${GITHUB_API_BASE}/orgs/${owner}/repos`
      : `${GITHUB_API_BASE}/user/repos`;

  const data = await githubRequest<GitHubRepositoryResponse>(url, {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      private: true,
      description: `Auto-generated repo for ${clientName}`,
      auto_init: false,
    }),
  });

  return data.clone_url;
}

export function getRepoSlug(projectName: string, repoUrl?: string | null): string {
  if (repoUrl) {
    const normalizedUrl = repoUrl.trim();

    if (normalizedUrl) {
      const sshMatch = normalizedUrl.match(/^[^:]+:([^/]+)\/(.+?)(?:\.git)?$/);
      if (sshMatch?.[2]) {
        return sshMatch[2];
      }

      try {
        const { pathname } = new URL(normalizedUrl);
        const segments = pathname.split('/').filter(Boolean);
        const repoName = segments.at(-1);

        if (repoName) {
          return repoName.replace(/\.git$/i, '');
        }
      } catch {
        // Fall back to the project name when the stored repo URL is malformed.
      }
    }
  }

  return projectName;
}

export async function repositoryExists(repoSlug: string): Promise<boolean> {
  const owner = getOwner();
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${encodeURIComponent(repoSlug)}`, {
    headers: getGitHubHeaders(),
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(formatGitHubError(response.status, errorText));
  }

  return true;
}

export async function listOwnedRepositoryNames(): Promise<Set<string>> {
  const owner = getOwner();
  const ownerType = getOwnerType();
  const names = new Set<string>();
  let page = 1;

  while (true) {
    const url =
      ownerType === 'org'
        ? `${GITHUB_API_BASE}/orgs/${owner}/repos?per_page=100&page=${page}&type=all`
        : `${GITHUB_API_BASE}/user/repos?per_page=100&page=${page}&affiliation=owner`;

    const repositories = await githubRequest<GitHubRepositoryListItem[]>(url);
    const ownedRepositories =
      ownerType === 'org'
        ? repositories.filter((repository) => repository.owner?.login?.toLowerCase() === owner.toLowerCase())
        : repositories;

    for (const repository of ownedRepositories) {
      names.add(repository.name.toLowerCase());
    }

    if (repositories.length < 100) {
      break;
    }

    page += 1;
  }

  return names;
}

export async function deleteRepo(repoSlug: string): Promise<void> {
  const owner = getOwner();

  await githubRequest(`${GITHUB_API_BASE}/repos/${owner}/${repoSlug}`, {
    method: 'DELETE',
  });
}

async function resolveBranchSha(repoSlug: string, fromBranch: string): Promise<string> {
  if (/^[a-f0-9]{7,40}$/i.test(fromBranch)) {
    return fromBranch;
  }

  const owner = getOwner();
  const data = await githubRequest<GitHubRefResponse>(
    `${GITHUB_API_BASE}/repos/${owner}/${repoSlug}/git/ref/heads/${fromBranch}`
  );

  return data.object.sha;
}

export async function createBranch(
  repoSlug: string,
  branchName: string,
  fromBranch: string
): Promise<void> {
  const owner = getOwner();
  const sha = await resolveBranchSha(repoSlug, fromBranch);

  await githubRequest(`${GITHUB_API_BASE}/repos/${owner}/${repoSlug}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha,
    }),
  });
}

export async function registerWebhook(repoSlug: string): Promise<void> {
  const owner = getOwner();
  const baseUrl = process.env.JENKINS_WEBHOOK_BASE_URL;

  if (!baseUrl) {
    throw new Error('JENKINS_WEBHOOK_BASE_URL is not configured');
  }

  await githubRequest(`${GITHUB_API_BASE}/repos/${owner}/${repoSlug}/hooks`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'web',
      active: true,
      events: ['push'],
      config: {
        url: `${baseUrl}?token=${repoSlug}`,
        content_type: 'json',
        insecure_ssl: '0',
      },
    }),
  });
}

export async function addTeamMembers(repoSlug: string, usernames: string[]): Promise<void> {
  const owner = getOwner();
  const normalizedOwner = owner.toLowerCase();
  const collaborators = usernames
    .map((username) => username.trim())
    .filter(Boolean)
    .filter((username, index, items) => items.findIndex((item) => item.toLowerCase() === username.toLowerCase()) === index)
    .filter((username) => username.toLowerCase() !== normalizedOwner);

  for (const username of collaborators) {
    await githubRequest(
      `${GITHUB_API_BASE}/repos/${owner}/${repoSlug}/collaborators/${encodeURIComponent(username)}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          permission: 'push',
        }),
      }
    );
  }
}
