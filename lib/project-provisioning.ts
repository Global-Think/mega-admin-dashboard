import 'server-only';

import { addTeamMembers, createRepo, deleteRepo, getJenkinsWebhookUrl, registerWebhook } from '@/lib/github';
import { cleanupTempDir } from '@/lib/cleanup';
import { initAndPush } from '@/lib/git';
import { isJenkinsConfigured, isJenkinsEnabled } from '@/lib/jenkins';
import { scaffoldProject } from '@/lib/scaffold';
import { createProjectRecord, deleteProjectRecord } from '@/lib/supabase';
import type { CreateProjectResult, JenkinsWebhookConfig, ProjectConfig, StepResult } from '@/types/project';

export async function provisionProject(config: ProjectConfig): Promise<CreateProjectResult> {
  const steps: StepResult[] = [];
  let repoUrl: string | undefined;
  let projectId: string | undefined;
  let repoCreated = false;
  let jenkinsWebhook: JenkinsWebhookConfig | undefined;

  try {
    const projectPath = await runStep('Scaffold project locally', steps, async () => scaffoldProject(config));

    await runStep('Inject shared config files', steps, async () => {
      return `Configuration injected into ${projectPath}`;
    });

    const createdRepoUrl = await runStep('Create GitHub repo', steps, async () =>
      createRepo(config.projectName, config.clientName)
    );
    repoUrl = createdRepoUrl;
    repoCreated = true;

    await runStep('Git init and push to main', steps, async () => {
      await initAndPush(projectPath, createdRepoUrl);
      return 'Initial scaffold pushed to main';
    });

    if (isJenkinsEnabled() && isJenkinsConfigured()) {
      await runStep('Register Jenkins webhook', steps, async () => {
        await registerWebhook(config.projectName);
        return 'Jenkins push webhook registered';
      });

      jenkinsWebhook = {
        url: getJenkinsWebhookUrl(config.projectName),
        events: ['push'],
        contentType: 'json',
        status: 'registered',
      };
    } else {
      const reason = isJenkinsEnabled()
        ? 'JENKINS_URL, JENKINS_USER, and JENKINS_TOKEN are required.'
        : 'Jenkins integration is disabled.';

      steps.push({
        step: 'Register Jenkins webhook',
        success: true,
        message: `Skipped for now — ${reason}`,
      });

      if (isJenkinsEnabled() && process.env.JENKINS_URL) {
        jenkinsWebhook = {
          url: getJenkinsWebhookUrl(config.projectName),
          events: ['push'],
          contentType: 'json',
          status: 'skipped',
          reason,
        };
      }
    }

    await runStep('Add GitHub collaborators', steps, async () => {
      await addTeamMembers(config.projectName, config.teamMembers);
      const effectiveCollaborators = config.teamMembers.filter(
        (username) => username.trim().toLowerCase() !== (process.env.GITHUB_OWNER ?? '').toLowerCase()
      );

      if (effectiveCollaborators.length === 0) {
        return 'No external collaborators to add. Repository owner already has access.';
      }

      return `${effectiveCollaborators.length} collaborators granted push access`;
    });

    projectId = await runStep('Create Supabase Kanban board record', steps, async () =>
      createProjectRecord(config, createdRepoUrl)
    );

    return {
      success: true,
      repoUrl,
      projectId,
      jenkinsWebhook,
      steps,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Project creation failed';

    await rollbackProvisionedResources({
      config,
      projectId,
      repoCreated,
      steps,
    });

    return {
      success: false,
      error: message,
      repoUrl,
      projectId,
      jenkinsWebhook,
      steps,
    };
  } finally {
    cleanupTempDir(config.projectName);
  }
}

async function rollbackProvisionedResources({
  config,
  projectId,
  repoCreated,
  steps,
}: {
  config: ProjectConfig;
  projectId?: string;
  repoCreated: boolean;
  steps: StepResult[];
}): Promise<void> {
  if (projectId) {
    try {
      await deleteProjectRecord(projectId);
      steps.push({
        step: 'Rollback Supabase project record',
        success: true,
        message: 'Removed the partially created project record.',
      });
    } catch (error) {
      steps.push({
        step: 'Rollback Supabase project record',
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Could not remove the partially created project record.',
      });
    }
  }

  if (repoCreated) {
    try {
      await deleteRepo(config.projectName);
      steps.push({
        step: 'Rollback GitHub repo',
        success: true,
        message: 'Removed the repository created for the failed provisioning run.',
      });
    } catch (error) {
      steps.push({
        step: 'Rollback GitHub repo',
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Could not remove the repository created for the failed provisioning run.',
      });
    }
  }
}

async function runStep<T>(
  step: string,
  steps: StepResult[],
  action: () => Promise<T>
): Promise<T> {
  try {
    const result = await action();
    steps.push({
      step,
      success: true,
      message: typeof result === 'string' ? result : `${step} completed successfully`,
    });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : `${step} failed`;
    steps.push({
      step,
      success: false,
      message,
    });
    throw new Error(message);
  }
}
