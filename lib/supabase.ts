import { createClient } from '@supabase/supabase-js';

import type { ProjectConfig } from '@/types/project';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured');
  }

  return supabase;
}

export async function projectNameExists(projectName: string): Promise<boolean> {
  const client = getSupabaseClient();
  const { data, error } = await client.from('projects').select('id').eq('name', projectName).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.id);
}

export async function createProjectRecord(config: ProjectConfig, repoUrl: string): Promise<string> {
  const client = getSupabaseClient();
  let projectId: string | undefined;

  try {
    const { data: project, error: projectError } = await client
      .from('projects')
      .insert({
        name: config.projectName,
        client_name: config.clientName,
        framework: config.framework,
        repo_url: repoUrl,
      })
      .select()
      .single();

    if (projectError || !project) {
      throw new Error(formatProjectInsertError(projectError?.message));
    }

    projectId = project.id;

    const defaultColumns = ['Backlog', 'In Progress', 'In Review', 'Done'];
    const sides = ['fe', 'be'] as const;

    for (const side of sides) {
      for (let index = 0; index < defaultColumns.length; index += 1) {
        const { error } = await client.from('kanban_columns').insert({
          project_id: project.id,
          side,
          name: defaultColumns[index],
          position: index,
        });

        if (error) {
          throw new Error(error.message);
        }
      }
    }

    return project.id;
  } catch (error) {
    if (projectId) {
      await safeDeleteProjectRecord(projectId);
    }

    throw error;
  }
}

function formatProjectInsertError(message?: string): string {
  if (message?.includes('projects_name_key')) {
    return 'A project with this name already exists in Mega Admin. Choose a different project name.';
  }

  return message ?? 'Could not create project record';
}

export async function deleteProjectRecord(projectId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error: cardsError } = await client.from('kanban_cards').delete().eq('project_id', projectId);
  if (cardsError) {
    throw new Error(cardsError.message);
  }

  const { error: columnsError } = await client.from('kanban_columns').delete().eq('project_id', projectId);
  if (columnsError) {
    throw new Error(columnsError.message);
  }

  const { error: projectError } = await client.from('projects').delete().eq('id', projectId);
  if (projectError) {
    throw new Error(projectError.message);
  }
}

async function safeDeleteProjectRecord(projectId: string): Promise<void> {
  try {
    await deleteProjectRecord(projectId);
  } catch {
    // Best-effort rollback: preserve the original provisioning error.
  }
}
