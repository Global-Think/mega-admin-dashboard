import 'server-only';

import { getSupabaseClient } from '@/lib/supabase';
import type { KanbanCardRecord } from '@/types/project';

type CardPriority = KanbanCardRecord['priority'];

type CreateCardInput = {
  title: string;
  description: string | null;
  priority: CardPriority;
  assignee: string | null;
  columnId: string;
};

type UpdateCardInput = {
  title?: string;
  description?: string | null;
  priority?: CardPriority;
  assignee?: string | null;
  columnId?: string;
  position?: number;
};

type ProjectIdentity = {
  id: string;
};

type ColumnIdentity = {
  id: string;
  project_id: string;
};

class KanbanMutationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'KanbanMutationError';
    this.status = status;
  }
}

const VALID_PRIORITIES: CardPriority[] = ['low', 'medium', 'high'];

export async function createCardForProject(
  projectName: string,
  input: CreateCardInput
): Promise<KanbanCardRecord> {
  const client = getSupabaseClient();
  const project = await getProjectByName(projectName);
  await getColumnForProject(input.columnId, project.id);

  const nextPosition = await getNextCardPosition(input.columnId);
  const { data, error } = await client
    .from('kanban_cards')
    .insert({
      project_id: project.id,
      column_id: input.columnId,
      title: sanitizeTitle(input.title),
      description: normalizeOptionalText(input.description),
      priority: validatePriority(input.priority),
      assignee: normalizeOptionalText(input.assignee),
      position: nextPosition,
    })
    .select()
    .single();

  if (error || !data) {
    throw new KanbanMutationError(error?.message ?? 'Could not create card.', 500);
  }

  return data as KanbanCardRecord;
}

export async function updateCardForProject(
  projectName: string,
  cardId: string,
  input: UpdateCardInput
): Promise<KanbanCardRecord> {
  const client = getSupabaseClient();
  const project = await getProjectByName(projectName);
  const existingCard = await getCardForProject(cardId, project.id);

  const updatePayload = {
    ...(input.title !== undefined ? { title: sanitizeTitle(input.title) } : {}),
    ...(input.description !== undefined ? { description: normalizeOptionalText(input.description) } : {}),
    ...(input.priority !== undefined ? { priority: validatePriority(input.priority) } : {}),
    ...(input.assignee !== undefined ? { assignee: normalizeOptionalText(input.assignee) } : {}),
  };

  const targetColumnId = input.columnId ?? existingCard.column_id;
  const requestedPosition = input.position ?? existingCard.position;
  const wantsReorder =
    input.columnId !== undefined ||
    input.position !== undefined;

  if (!wantsReorder) {
    const { data, error } = await client
      .from('kanban_cards')
      .update(updatePayload)
      .eq('id', cardId)
      .eq('project_id', project.id)
      .select()
      .single();

    if (error || !data) {
      throw new KanbanMutationError(error?.message ?? 'Could not update card.', 500);
    }

    return data as KanbanCardRecord;
  }

  await getColumnForProject(targetColumnId, project.id);

  const sourceCards = await listCardsForColumn(existingCard.column_id, project.id);
  const destinationCards =
    targetColumnId === existingCard.column_id
      ? sourceCards
      : await listCardsForColumn(targetColumnId, project.id);

  const sourceWithoutCard = sourceCards.filter((card) => card.id !== cardId);
  const destinationBase =
    targetColumnId === existingCard.column_id
      ? sourceWithoutCard
      : destinationCards;

  const nextCard: KanbanCardRecord = {
    ...existingCard,
    ...updatePayload,
    column_id: targetColumnId,
  };

  const clampedPosition = clamp(requestedPosition, 0, destinationBase.length);
  const destinationWithCard = [...destinationBase];
  destinationWithCard.splice(clampedPosition, 0, nextCard);

  const orderedSourceCards =
    targetColumnId === existingCard.column_id ? [] : resequenceCards(sourceWithoutCard);
  const orderedDestinationCards = resequenceCards(destinationWithCard);

  if (orderedSourceCards.length > 0) {
    await persistCardOrder(orderedSourceCards);
  }

  await persistCardOrder(orderedDestinationCards);

  const updatedCard = orderedDestinationCards.find((card) => card.id === cardId);
  if (!updatedCard) {
    throw new KanbanMutationError('Could not update card.', 500);
  }

  return updatedCard;
}

export async function deleteCardForProject(projectName: string, cardId: string): Promise<void> {
  const client = getSupabaseClient();
  const project = await getProjectByName(projectName);
  const existingCard = await getCardForProject(cardId, project.id);

  const { error } = await client
    .from('kanban_cards')
    .delete()
    .eq('id', cardId)
    .eq('project_id', project.id);

  if (error) {
    throw new KanbanMutationError(error.message, 500);
  }

  const remainingCards = await listCardsForColumn(existingCard.column_id, project.id);
  await persistCardOrder(resequenceCards(remainingCards));
}

export function getKanbanMutationStatus(error: unknown): number {
  return error instanceof KanbanMutationError ? error.status : 500;
}

export function getKanbanMutationMessage(error: unknown, fallback: string): string {
  if (error instanceof KanbanMutationError) {
    return error.message;
  }

  return error instanceof Error ? error.message : fallback;
}

async function getProjectByName(projectName: string): Promise<ProjectIdentity> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('projects')
    .select('id')
    .eq('name', projectName)
    .single();

  if (error || !data) {
    throw new KanbanMutationError('Project not found.', 404);
  }

  return data as ProjectIdentity;
}

async function getColumnForProject(columnId: string, projectId: string): Promise<ColumnIdentity> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('kanban_columns')
    .select('id, project_id')
    .eq('id', columnId)
    .eq('project_id', projectId)
    .single();

  if (error || !data) {
    throw new KanbanMutationError('Column not found for this project.', 404);
  }

  return data as ColumnIdentity;
}

async function getCardForProject(cardId: string, projectId: string): Promise<KanbanCardRecord> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('kanban_cards')
    .select('*')
    .eq('id', cardId)
    .eq('project_id', projectId)
    .single();

  if (error || !data) {
    throw new KanbanMutationError('Card not found for this project.', 404);
  }

  return data as KanbanCardRecord;
}

async function listCardsForColumn(columnId: string, projectId: string): Promise<KanbanCardRecord[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('kanban_cards')
    .select('*')
    .eq('column_id', columnId)
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new KanbanMutationError(error.message, 500);
  }

  return (data ?? []) as KanbanCardRecord[];
}

async function getNextCardPosition(columnId: string): Promise<number> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('kanban_cards')
    .select('position')
    .eq('column_id', columnId)
    .order('position', { ascending: false })
    .limit(1);

  if (error) {
    throw new KanbanMutationError(error.message, 500);
  }

  return data?.[0]?.position != null ? Number(data[0].position) + 1 : 0;
}

async function persistCardOrder(cards: KanbanCardRecord[]): Promise<void> {
  const client = getSupabaseClient();

  for (const card of cards) {
    const { error } = await client
      .from('kanban_cards')
      .update({
        title: card.title,
        description: card.description,
        priority: card.priority,
        assignee: card.assignee,
        column_id: card.column_id,
        position: card.position,
      })
      .eq('id', card.id)
      .eq('project_id', card.project_id);

    if (error) {
      throw new KanbanMutationError(error.message, 500);
    }
  }
}

function resequenceCards(cards: KanbanCardRecord[]): KanbanCardRecord[] {
  return cards.map((card, index) => ({
    ...card,
    position: index,
  }));
}

function sanitizeTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new KanbanMutationError('Card title is required.', 400);
  }

  return trimmed;
}

function normalizeOptionalText(value?: string | null): string | null {
  if (value == null) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function validatePriority(value: string): CardPriority {
  if (!VALID_PRIORITIES.includes(value as CardPriority)) {
    throw new KanbanMutationError('Invalid card priority.', 400);
  }

  return value as CardPriority;
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isInteger(value)) {
    throw new KanbanMutationError('Card position must be an integer.', 400);
  }

  return Math.min(Math.max(value, min), max);
}
