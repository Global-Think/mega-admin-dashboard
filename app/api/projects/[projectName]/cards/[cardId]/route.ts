import { NextResponse } from 'next/server';

import {
  deleteCardForProject,
  getKanbanMutationMessage,
  getKanbanMutationStatus,
  updateCardForProject,
} from '@/lib/kanban-data';
import type { KanbanCardRecord } from '@/types/project';

type UpdateCardPayload = Partial<
  Pick<KanbanCardRecord, 'title' | 'description' | 'priority' | 'assignee' | 'column_id' | 'position'>
>;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectName: string; cardId: string }> }
) {
  try {
    const body = (await req.json()) as UpdateCardPayload;
    const { projectName, cardId } = await params;
    const card = await updateCardForProject(projectName, cardId, {
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.priority !== undefined ? { priority: String(body.priority) as KanbanCardRecord['priority'] } : {}),
      ...(body.assignee !== undefined ? { assignee: body.assignee } : {}),
      ...(body.column_id !== undefined ? { columnId: String(body.column_id) } : {}),
      ...(body.position !== undefined ? { position: Number(body.position) } : {}),
    });

    return NextResponse.json(card);
  } catch (error) {
    return NextResponse.json(
      { error: getKanbanMutationMessage(error, 'Could not update card.') },
      { status: getKanbanMutationStatus(error) }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ projectName: string; cardId: string }> }
) {
  try {
    const { projectName, cardId } = await params;
    await deleteCardForProject(projectName, cardId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: getKanbanMutationMessage(error, 'Could not delete card.') },
      { status: getKanbanMutationStatus(error) }
    );
  }
}
