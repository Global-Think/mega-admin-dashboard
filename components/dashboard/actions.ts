'use server';

import { revalidatePath } from 'next/cache';

import type { FormErrors } from '@/components/dashboard/types';
import { provisionProject } from '@/lib/project-provisioning';
import { projectNameExists } from '@/lib/supabase';
import type { CreateProjectResult, FrameworkType, ProjectConfig } from '@/types/project';

export type CreateProjectActionState = {
  errors: FormErrors;
  result: CreateProjectResult | null;
  submittedProjectName: string;
};

export async function createProjectAction(
  _previousState: CreateProjectActionState,
  formData: FormData
): Promise<CreateProjectActionState> {
  const projectName = String(formData.get('projectName') ?? '').trim();
  const clientName = String(formData.get('clientName') ?? '').trim();
  const frameworkValue = String(formData.get('framework') ?? '').trim();
  const teamInput = String(formData.get('teamMembers') ?? '');

  const errors: FormErrors = {};

  if (!projectName) {
    errors.projectName = 'Project name is required.';
  } else if (!/^[a-z0-9-]+$/.test(projectName)) {
    errors.projectName = 'Use lowercase letters, numbers, and hyphens only.';
  }

  if (!clientName) {
    errors.clientName = 'Client name is required.';
  }

  if (projectName && /^[a-z0-9-]+$/.test(projectName)) {
    const exists = await projectNameExists(projectName);
    if (exists) {
      errors.projectName = 'A project with this name already exists in Mega Admin.';
    }
  }

  if (!isFrameworkType(frameworkValue)) {
    errors.framework = 'Please select a framework.';
  }

  const teamMembers = parseHandles(teamInput);
  if (teamInput.trim()) {
    const invalid = teamMembers.some((handle) => !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37})$/.test(handle));
    if (invalid) {
      errors.teamMembers = 'Enter valid comma-separated GitHub usernames.';
    }
  }

  if (Object.keys(errors).length > 0 || !isFrameworkType(frameworkValue)) {
    return {
      errors,
      result: null,
      submittedProjectName: projectName,
    };
  }

  const config: ProjectConfig = {
    projectName,
    clientName,
    framework: frameworkValue,
    teamMembers,
  };

  const result = await provisionProject(config);

  if (result.success) {
    revalidatePath('/');
    revalidatePath('/launch');
    revalidatePath('/projects');
    revalidatePath(`/projects/${config.projectName}`);
  }

  return {
    errors: {},
    result,
    submittedProjectName: config.projectName,
  };
}

function parseHandles(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .map((item) => item.replace(/^@/, ''))
    .filter(Boolean);
}

function isFrameworkType(value: string): value is FrameworkType {
  return value === 'nextjs' || value === 'vue3' || value === 'angular';
}
