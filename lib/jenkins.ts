import type {
  JenkinsBuildStatus,
  JenkinsFolder,
  JenkinsHealthReport,
  JenkinsWorkflowJob,
} from '@/types/project';

type JenkinsApiBuild = {
  result: JenkinsBuildStatus['result'];
  timestamp: number;
  duration: number;
  url: string;
  number: number;
  building?: boolean;
};

type JenkinsApiWorkflowJob = {
  name: string;
  url: string;
  color: string;
  buildable?: boolean;
  inQueue?: boolean;
  healthReport?: JenkinsHealthReport[];
  lastBuild?: JenkinsApiBuild | null;
  lastCompletedBuild?: JenkinsApiBuild | null;
  lastSuccessfulBuild?: JenkinsApiBuild | null;
  lastFailedBuild?: JenkinsApiBuild | null;
};

type JenkinsApiFolder = {
  name: string;
  url: string;
  jobs?: JenkinsApiWorkflowJob[];
};

type JenkinsApiRoot = {
  jobs?: JenkinsApiFolder[];
};

type JenkinsCrumbResponse = {
  crumb: string;
  crumbRequestField: string;
};

export function isJenkinsEnabled(): boolean {
  return process.env.ENABLE_JENKINS === 'true';
}

export function isJenkinsConfigured(): boolean {
  return Boolean(process.env.JENKINS_URL && process.env.JENKINS_USER && process.env.JENKINS_TOKEN);
}

function getJenkinsHeaders(): HeadersInit {
  const user = process.env.JENKINS_USER;
  const token = process.env.JENKINS_TOKEN;

  if (!user || !token) {
    throw new Error('JENKINS_URL, JENKINS_USER, and JENKINS_TOKEN must be configured');
  }

  const credentials = Buffer.from(`${user}:${token}`).toString('base64');

  return {
    Authorization: `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

function getJenkinsBaseUrl(): string {
  const url = process.env.JENKINS_URL;

  if (!url) {
    throw new Error('JENKINS_URL is not configured');
  }

  return url.replace(/\/$/, '');
}

async function jenkinsJsonRequest<T>(pathOrUrl: string, init?: RequestInit): Promise<T> {
  const target = encodeURI(resolveJenkinsUrl(pathOrUrl));
  const response = await fetch(target, {
    ...init,
    headers: {
      ...getJenkinsHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Jenkins request failed (${response.status}): ${await response.text()}`);
  }

  return (await response.json()) as T;
}

async function getCrumb(): Promise<JenkinsCrumbResponse> {
  return jenkinsJsonRequest<JenkinsCrumbResponse>('/crumbIssuer/api/json');
}

function resolveJenkinsUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return `${getJenkinsBaseUrl()}${pathOrUrl}`;
}

function normalizeBuild(build?: JenkinsApiBuild | null): JenkinsBuildStatus | null {
  if (!build) {
    return null;
  }

  return {
    result: build.result ?? null,
    timestamp: build.timestamp,
    duration: build.duration,
    url: build.url,
    number: build.number,
    building: build.building ?? false,
  };
}

function deriveFolderHealth(jobs: JenkinsWorkflowJob[]): JenkinsHealthReport[] {
  const scores = jobs.flatMap((job) => job.healthReport.map((item) => item.score));
  const average = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;

  const health =
    average >= 80
      ? { description: 'Build stability is healthy across this folder.', iconClassName: 'icon-health-80plus', score: average }
      : average >= 60
        ? { description: 'Build stability is fair across this folder.', iconClassName: 'icon-health-60to79', score: average }
        : average >= 40
          ? { description: 'Build stability needs attention in this folder.', iconClassName: 'icon-health-40to59', score: average }
          : { description: 'Build stability is poor in this folder.', iconClassName: 'icon-health-00to19', score: average };

  return jobs.length ? [health] : [];
}

function normalizeWorkflowJob(folder: JenkinsApiFolder, job: JenkinsApiWorkflowJob): JenkinsWorkflowJob {
  return {
    folderName: folder.name,
    folderUrl: folder.url,
    jobName: job.name,
    jobUrl: job.url,
    color: job.color ?? 'notbuilt',
    buildable: job.buildable ?? false,
    inQueue: job.inQueue ?? false,
    healthReport: job.healthReport ?? [],
    lastBuild: normalizeBuild(job.lastBuild),
    lastCompletedBuild: normalizeBuild(job.lastCompletedBuild),
    lastSuccessfulBuild: normalizeBuild(job.lastSuccessfulBuild),
    lastFailedBuild: normalizeBuild(job.lastFailedBuild),
  };
}

export async function getJenkinsFolders(): Promise<JenkinsFolder[]> {
  const data = await jenkinsJsonRequest<JenkinsApiRoot>(
    '/api/json?tree=jobs[name,url,jobs[name,url,color,buildable,inQueue,healthReport[description,iconClassName,score],lastBuild[number,url,building,result,timestamp,duration],lastCompletedBuild[number,url,result,timestamp,duration],lastSuccessfulBuild[number,url,result,timestamp,duration],lastFailedBuild[number,url,result,timestamp,duration]]]'
  );

  const folders = data.jobs ?? [];

  return folders.map((folder) => {
    const jobs = (folder.jobs ?? []).map((job) => normalizeWorkflowJob(folder, job));

    return {
      name: folder.name,
      url: folder.url,
      healthReport: deriveFolderHealth(jobs),
      jobs,
    };
  });
}

export async function getAllJobs(): Promise<JenkinsWorkflowJob[]> {
  const folders = await getJenkinsFolders();
  return flattenJenkinsJobs(folders);
}

export function flattenJenkinsJobs(folders: JenkinsFolder[]): JenkinsWorkflowJob[] {
  return folders.flatMap((folder) => folder.jobs);
}

export async function triggerBuild(jobUrl: string): Promise<{ queueUrl: string | null }> {
  const normalizedJobUrl = validateJobUrl(jobUrl);
  const crumb = await getCrumb();
  const response = await fetch(`${normalizedJobUrl.replace(/\/$/, '')}/build?delay=0sec`, {
    method: 'POST',
    headers: {
      ...getJenkinsHeaders(),
      [crumb.crumbRequestField]: crumb.crumb,
    },
    cache: 'no-store',
    redirect: 'manual',
  });

  if (![200, 201, 202, 302].includes(response.status)) {
    throw new Error(`Jenkins build trigger failed (${response.status}): ${await response.text()}`);
  }

  return {
    queueUrl: response.headers.get('location'),
  };
}

function validateJobUrl(jobUrl: string): string {
  const baseUrl = getJenkinsBaseUrl();

  if (!jobUrl.startsWith(baseUrl)) {
    throw new Error('Invalid Jenkins job URL');
  }

  return jobUrl;
}
