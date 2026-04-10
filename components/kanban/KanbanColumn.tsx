'use client';

import { memo } from 'react';
import { Droppable } from '@hello-pangea/dnd';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { KanbanCardRecord, KanbanColumnRecord } from '@/types/project';
import { KanbanCard } from './KanbanCard';

function KanbanColumnComponent({
  column,
  cards,
  onEditCard,
  onDeleteCard,
  syncingCardId,
  isBoardSyncing = false,
}: {
  column: KanbanColumnRecord;
  cards: KanbanCardRecord[];
  onEditCard: (card: KanbanCardRecord) => void;
  onDeleteCard: (card: KanbanCardRecord) => void;
  syncingCardId?: string | null;
  isBoardSyncing?: boolean;
}) {
  return (
    <Card className="flex h-full min-w-0 flex-col rounded-[1.5rem] border-0 bg-muted/30 p-3 shadow-none">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{column.name}</h3>
          <Badge variant="outline" className="rounded-full bg-background px-2.5 py-0.5 text-xs">
            {cards.length}
          </Badge>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'flex min-h-[280px] flex-1 flex-col gap-3 rounded-[1.2rem] border border-transparent p-0.5 transition-colors',
              snapshot.isDraggingOver ? 'bg-background/80 ring-1 ring-primary/20' : ''
            )}
          >
            {cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                onEdit={onEditCard}
                onDelete={onDeleteCard}
                isSyncing={syncingCardId === card.id}
                isBoardSyncing={isBoardSyncing}
              />
            ))}
            {!cards.length && !snapshot.isDraggingOver ? (
              <div className="flex min-h-[180px] items-center justify-center rounded-[1rem] border border-dashed bg-background/70 text-sm text-muted-foreground">
                No tasks yet
              </div>
            ) : null}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);
KanbanColumn.displayName = 'KanbanColumn';
