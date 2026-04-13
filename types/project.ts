export type FrameworkType = 'vue3' | 'nextjs' | 'angular';

export interface ProjectConfig {
  projectName: string;
  clientName: string;
  framework: FrameworkType;
  teamMembers: string[]; // GitHub usernames
}

export interface StepResult {
  step: string;
  success: boolean;
  message: string;
}

export interface JenkinsWebhookConfig {
  url: string;
  events: string[];
  contentType: 'json';
  status: 'registered' | 'skipped';
  reason?: string;
}

export interface CreateProjectResult {
  success: boolean;
  repoUrl?: string;
  projectId?: string;
  error?: string;
  jenkinsWebhook?: JenkinsWebhookConfig;
  steps: StepResult[];
}

export interface JenkinsHealthReport {
  description: string;
  iconClassName: string;
  score: number;
}

export interface JenkinsBuildStatus {
  result: 'SUCCESS' | 'FAILURE' | 'ABORTED' | null;
  timestamp: number;
  duration: number;
  url: string;
  number: number;
  building?: boolean;
}

export interface JenkinsWorkflowJob {
  folderName: string;
  folderUrl: string;
  jobName: string;
  jobUrl: string;
  color: string;
  buildable: boolean;
  inQueue: boolean;
  healthReport: JenkinsHealthReport[];
  lastBuild: JenkinsBuildStatus | null;
  lastCompletedBuild: JenkinsBuildStatus | null;
  lastSuccessfulBuild: JenkinsBuildStatus | null;
  lastFailedBuild: JenkinsBuildStatus | null;
}

export interface JenkinsFolder {
  name: string;
  url: string;
  healthReport: JenkinsHealthReport[];
  jobs: JenkinsWorkflowJob[];
}

export type ProjectOverview = JenkinsWorkflowJob;

export interface ProjectRecord {
  id: string;
  name: string;
  client_name: string;
  framework: FrameworkType;
  repo_url: string | null;
  created_at: string;
}

export type BoardSourceType = 'provisioned' | 'legacy';

export interface BoardRecord {
  id: string;
  slug: string;
  title: string;
  client_name: string;
  source_type: BoardSourceType;
  project_id: string | null;
  framework: FrameworkType | null;
  repo_url: string | null;
  created_at: string;
}

export interface ProjectRegistryRecord extends BoardRecord {
  open_task_count: number;
}

export interface KanbanCardRecord {
  id: string;
  column_id: string;
  board_id: string;
  title: string;
  description: string | null;
  position: number;
  assignee: string | null;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface KanbanColumnRecord {
  id: string;
  board_id: string;
  side: 'fe' | 'be';
  name: string;
  position: number;
  created_at: string;
  kanban_cards?: KanbanCardRecord[];
}

export interface ProjectWithColumns extends BoardRecord {
  kanban_columns: KanbanColumnRecord[];
}
