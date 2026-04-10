'use client';

import { memo } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';

import type { KanbanCardRecord, KanbanColumnRecord } from '@/types/project';
import { KanbanColumn } from './KanbanColumn';

function KanbanBoardComponent({
  columns,
  cardsByColumn,
  onEditCard,
  onDeleteCard,
  onDragEnd,
  syncingCardId,
  isBoardSyncing = false,
}: {
  columns: KanbanColumnRecord[];
  cardsByColumn: Record<string, KanbanCardRecord[]>;
  onEditCard: (card: KanbanCardRecord) => void;
  onDeleteCard: (card: KanbanCardRecord) => void;
  onDragEnd: (result: DropResult) => void;
  syncingCardId?: string | null;
  isBoardSyncing?: boolean;
}) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cardsByColumn[column.id] ?? []}
            onEditCard={onEditCard}
            onDeleteCard={onDeleteCard}
            syncingCardId={syncingCardId}
            isBoardSyncing={isBoardSyncing}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

export const KanbanBoard = memo(KanbanBoardComponent);
KanbanBoard.displayName = 'KanbanBoard';
