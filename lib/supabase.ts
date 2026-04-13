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
  const { data, error } = await client
    .from('project_boards')
    .select('id')
    .eq('slug', projectName)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data?.id);
}

export async function createProjectRecord(config: ProjectConfig, repoUrl: string): Promise<string> {
  const client = getSupabaseClient();
  let projectId: string | undefined;
  let boardId: string | undefined;

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

    boardId = await createBoardRecord({
      slug: config.projectName,
      title: config.projectName,
      clientName: config.clientName,
      sourceType: 'provisioned',
      framework: config.framework,
      repoUrl,
      projectId: project.id,
    });

    return project.id;
  } catch (error) {
    if (boardId) {
      await safeDeleteBoardRecord(boardId);
    }

    if (projectId) {
      await safeDeleteProjectRecord(projectId);
    }

    throw error;
  }
}

export async function createLegacyBoardRecord({
  slug,
  title,
  clientName,
}: {
  slug: string;
  title: string;
  clientName: string;
}): Promise<string> {
  return createBoardRecord({
    slug,
    title,
    clientName,
    sourceType: 'legacy',
    framework: null,
    repoUrl: null,
    projectId: null,
  });
}

function formatProjectInsertError(message?: string): string {
  if (message?.includes('projects_name_key')) {
    return 'A project with this name already exists in Mega Admin. Choose a different project name.';
  }

  return message ?? 'Could not create project record';
}

export async function deleteProjectRecord(projectId: string): Promise<void> {
  const client = getSupabaseClient();

  const { data: boards, error: boardsLookupError } = await client
    .from('project_boards')
    .select('id')
    .eq('project_id', projectId);

  if (boardsLookupError) {
    throw new Error(boardsLookupError.message);
  }

  for (const board of boards ?? []) {
    await deleteBoardRecord(board.id);
  }

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

export async function deleteBoardRecord(boardId: string): Promise<void> {
  const client = getSupabaseClient();

  const { error: cardsError } = await client.from('kanban_cards').delete().eq('board_id', boardId);
  if (cardsError) {
    throw new Error(cardsError.message);
  }

  const { error: columnsError } = await client.from('kanban_columns').delete().eq('board_id', boardId);
  if (columnsError) {
    throw new Error(columnsError.message);
  }

  const { error: boardError } = await client.from('project_boards').delete().eq('id', boardId);
  if (boardError) {
    throw new Error(boardError.message);
  }
}

async function safeDeleteProjectRecord(projectId: string): Promise<void> {
  try {
    await deleteProjectRecord(projectId);
  } catch {
    // Best-effort rollback: preserve the original provisioning error.
  }
}

async function safeDeleteBoardRecord(boardId: string): Promise<void> {
  try {
    await deleteBoardRecord(boardId);
  } catch {
    // Best-effort rollback: preserve the original provisioning error.
  }
}

async function createBoardRecord({
  slug,
  title,
  clientName,
  sourceType,
  framework,
  repoUrl,
  projectId,
}: {
  slug: string;
  title: string;
  clientName: string;
  sourceType: 'provisioned' | 'legacy';
  framework: ProjectConfig['framework'] | null;
  repoUrl: string | null;
  projectId: string | null;
}): Promise<string> {
  const client = getSupabaseClient();
  let boardId: string | undefined;

  try {
    const { data: board, error: boardError } = await client
      .from('project_boards')
      .insert({
        slug,
        title,
        client_name: clientName,
        source_type: sourceType,
        project_id: projectId,
        framework,
        repo_url: repoUrl,
      })
      .select('id')
      .single();

    if (boardError || !board) {
      throw new Error(formatBoardInsertError(boardError?.message));
    }

    boardId = board.id;
    await seedDefaultColumns(board.id, projectId);
    return board.id;
  } catch (error) {
    if (boardId) {
      await safeDeleteBoardRecord(boardId);
    }

    throw error;
  }
}

async function seedDefaultColumns(boardId: string, projectId: string | null): Promise<void> {
  const client = getSupabaseClient();
  const defaultColumns = ['Backlog', 'In Progress', 'In Review', 'Done'];
  const sides = ['fe', 'be'] as const;

  for (const side of sides) {
    for (let index = 0; index < defaultColumns.length; index += 1) {
      const { error } = await client.from('kanban_columns').insert({
        board_id: boardId,
        project_id: projectId,
        side,
        name: defaultColumns[index],
        position: index,
      });

      if (error) {
        throw new Error(error.message);
      }
    }
  }
}

function formatBoardInsertError(message?: string): string {
  if (message?.includes('project_boards_slug_key')) {
    return 'A board with this URL slug already exists in Mega Admin. Choose a different name.';
  }

  return message ?? 'Could not create board record';
}
