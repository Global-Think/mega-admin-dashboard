import { NextResponse } from 'next/server';

import {
  createCardForProject,
  getKanbanMutationMessage,
  getKanbanMutationStatus,
} from '@/lib/kanban-data';
import type { KanbanCardRecord } from '@/types/project';

type CreateCardPayload = Pick<
  KanbanCardRecord,
  'column_id' | 'title' | 'description' | 'priority' | 'assignee'
>;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectName: string }> }
) {
  try {
    const body = (await req.json()) as Partial<CreateCardPayload>;
    const { projectName } = await params;
    const card = await createCardForProject(projectName, {
      columnId: String(body.column_id ?? ''),
      title: String(body.title ?? ''),
      description: body.description ?? null,
      priority: String(body.priority ?? '') as KanbanCardRecord['priority'],
      assignee: body.assignee ?? null,
    });

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: getKanbanMutationMessage(error, 'Could not create card.') },
      { status: getKanbanMutationStatus(error) }
    );
  }
}
