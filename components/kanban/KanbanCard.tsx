'use client';

import { memo } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Clock3, LoaderCircle, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { getInitials, formatRelativeTime, cn } from '@/lib/utils';
import type { KanbanCardRecord } from '@/types/project';

const priorityVariants: Record<KanbanCardRecord['priority'], 'danger' | 'warning' | 'success'> = {
  high: 'danger',
  medium: 'warning',
  low: 'success',
};

function KanbanCardComponent({
  card,
  index,
  onEdit,
  onDelete,
  isSyncing = false,
  isBoardSyncing = false,
}: {
  card: KanbanCardRecord;
  index: number;
  onEdit: (card: KanbanCardRecord) => void;
  onDelete: (card: KanbanCardRecord) => void;
  isSyncing?: boolean;
  isBoardSyncing?: boolean;
}) {
  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={isBoardSyncing}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Card
            className={cn(
              'space-y-4 rounded-[1.25rem] border bg-background p-4 shadow-sm transition-colors',
              snapshot.isDragging ? 'border-primary bg-muted/50' : 'hover:bg-background',
              isSyncing ? 'border-primary bg-muted/40 opacity-90' : ''
            )}
          >
            <div
              role="button"
              tabIndex={0}
              className="space-y-4"
              onClick={() => {
                if (!isBoardSyncing) {
                  onEdit(card);
                }
              }}
              onKeyDown={(event) => {
                if (!isBoardSyncing && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onEdit(card);
                }
              }}
            >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-2">
                <h4 className="line-clamp-2 text-[1.05rem] font-semibold leading-6">{card.title}</h4>
                {isSyncing ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground">
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    Syncing...
                  </div>
                ) : null}
                {card.description ? (
                  <p className="text-sm leading-7 text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                    {card.description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  if (!isBoardSyncing) {
                    onDelete(card);
                  }
                }}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Delete card"
                disabled={isBoardSyncing}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Badge
                variant={priorityVariants[card.priority]}
                className="border-0 px-3 py-1 text-xs font-medium capitalize"
              >
                {card.priority}
              </Badge>
              {card.assignee ? (
                <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border bg-muted/50 text-[10px] font-medium">
                    {getInitials(card.assignee)}
                  </div>
                  <span className="truncate">{card.assignee}</span>
                </div>
              ) : null}
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {formatRelativeTime(card.created_at)}
                </span>
              </div>
            </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
}

export const KanbanCard = memo(KanbanCardComponent);
KanbanCard.displayName = 'KanbanCard';
