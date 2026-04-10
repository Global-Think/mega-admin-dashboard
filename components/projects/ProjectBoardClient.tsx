'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';
import { PlusCircle } from 'lucide-react';

import { CardDialog } from '@/components/kanban/CardDialog';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import type { KanbanCardRecord, ProjectWithColumns } from '@/types/project';

type DialogState = {
  open: boolean;
  columnId?: string;
  card?: KanbanCardRecord | null;
};

export function ProjectBoardClient({ initialProject }: { initialProject: ProjectWithColumns }) {
  const [project, setProject] = useState<ProjectWithColumns>(initialProject);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>({ open: false });
  const [syncingCardId, setSyncingCardId] = useState<string | null>(null);
  const [activeSide, setActiveSide] = useState<'fe' | 'be'>('fe');

  const columns = useMemo(() => project.kanban_columns ?? [], [project]);

  const columnsBySide = useMemo(() => {
    const sorted = [...columns].sort((left, right) => left.position - right.position);
    return {
      fe: sorted.filter((column) => column.side === 'fe'),
      be: sorted.filter((column) => column.side === 'be'),
    };
  }, [columns]);

  const cardsByColumn = useMemo(() => {
    const entries: Record<string, KanbanCardRecord[]> = {};

    for (const column of columns) {
      entries[column.id] = [...(column.kanban_cards ?? [])].sort(
        (left, right) => left.position - right.position
      );
    }

    return entries;
  }, [columns]);

  const sideCounts = useMemo(
    () => ({
      fe: columnsBySide.fe.reduce((count, column) => count + (cardsByColumn[column.id]?.length ?? 0), 0),
      be: columnsBySide.be.reduce((count, column) => count + (cardsByColumn[column.id]?.length ?? 0), 0),
    }),
    [cardsByColumn, columnsBySide]
  );

  const setCardsLocally = useCallback((updater: (current: ProjectWithColumns) => ProjectWithColumns) => {
    setProject((current) => updater(current));
  }, []);

  const openCreateDialog = useCallback((columnId?: string) => {
    if (!columnId) {
      setBoardError('No column is available for this side yet.');
      return;
    }

    setBoardError(null);
    setDialogState({ open: true, columnId, card: null });
  }, []);

  const openEditDialog = useCallback((card: KanbanCardRecord) => {
    setBoardError(null);
    setDialogState({ open: true, card });
  }, []);

  const handleCreateCard = useCallback(async (payload: {
    title: string;
    description: string;
    priority: KanbanCardRecord['priority'];
    assignee: string;
  }) => {
    if (!dialogState.columnId) {
      return;
    }

    const columnId = dialogState.columnId;
    const existingCards = cardsByColumn[columnId] ?? [];
    const optimisticCard: KanbanCardRecord = {
      id: `temp-${Date.now()}`,
      column_id: columnId,
      project_id: project.id,
      title: payload.title,
      description: payload.description || null,
      position: existingCards.length,
      assignee: payload.assignee || null,
      priority: payload.priority,
      created_at: new Date().toISOString(),
    };

    const snapshot = project;
    setCardsLocally((current) => mutateCardCollection(current, columnId, [...existingCards, optimisticCard]));

    const response = await fetch(`/api/projects/${project.name}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        column_id: columnId,
        title: optimisticCard.title,
        description: optimisticCard.description,
        position: optimisticCard.position,
        assignee: optimisticCard.assignee,
        priority: optimisticCard.priority,
      }),
    });

    if (!response.ok) {
      setProject(snapshot);
      throw new Error('Could not create card.');
    }

    const savedCard = (await response.json()) as KanbanCardRecord;
    setCardsLocally((current) => replaceCard(current, optimisticCard.id, savedCard));
    setBoardError(null);
  }, [cardsByColumn, dialogState.columnId, project, setCardsLocally]);

  const handleSaveCard = useCallback(async (payload: {
    title: string;
    description: string;
    priority: KanbanCardRecord['priority'];
    assignee: string;
  }) => {
    try {
      if (!dialogState.card) {
        await handleCreateCard(payload);
        return;
      }

      const snapshot = project;
      const card = dialogState.card;
      const updatedCard: KanbanCardRecord = {
        ...card,
        title: payload.title,
        description: payload.description || null,
        priority: payload.priority,
        assignee: payload.assignee || null,
      };

      setCardsLocally((current) => replaceCard(current, card.id, updatedCard));

      const response = await fetch(`/api/projects/${project.name}/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: updatedCard.title,
          description: updatedCard.description,
          priority: updatedCard.priority,
          assignee: updatedCard.assignee,
        }),
      });

      if (!response.ok) {
        setProject(snapshot);
        throw new Error('Could not update card.');
      }

      setBoardError(null);
    } catch (saveError) {
      setBoardError(saveError instanceof Error ? saveError.message : 'Could not save card.');
      throw saveError;
    }
  }, [dialogState.card, handleCreateCard, project, setCardsLocally]);

  const handleDeleteCard = useCallback(async (card?: KanbanCardRecord) => {
    const target = card ?? dialogState.card;
    if (!target) {
      return;
    }

    const snapshot = project;
    setCardsLocally((current) =>
      mutateCardCollection(
        current,
        target.column_id,
        resequence((cardsByColumn[target.column_id] ?? []).filter((item) => item.id !== target.id))
      )
    );

    const response = await fetch(`/api/projects/${project.name}/cards/${target.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      setProject(snapshot);
      setBoardError('Could not delete card.');
      throw new Error('Could not delete card.');
    }

    setBoardError(null);
  }, [cardsByColumn, dialogState.card, project, setCardsLocally]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (syncingCardId) {
      return;
    }

    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const snapshot = project;
    const sourceCards = [...(cardsByColumn[source.droppableId] ?? [])];
    const destinationCards =
      source.droppableId === destination.droppableId
        ? sourceCards
        : [...(cardsByColumn[destination.droppableId] ?? [])];
    const [movedCard] = sourceCards.splice(source.index, 1);

    if (!movedCard) {
      return;
    }

    const updatedCard: KanbanCardRecord = {
      ...movedCard,
      column_id: destination.droppableId,
      position: destination.index,
    };
    destinationCards.splice(destination.index, 0, updatedCard);

    let nextProject = mutateCardCollection(project, source.droppableId, resequence(sourceCards));
    nextProject = mutateCardCollection(nextProject, destination.droppableId, resequence(destinationCards));
    setProject(nextProject);
    setSyncingCardId(draggableId);
    try {
      const response = await fetch(`/api/projects/${project.name}/cards/${draggableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          column_id: destination.droppableId,
          position: destination.index,
        }),
      });

      if (!response.ok) {
        setProject(snapshot);
        setBoardError('Could not move card. The board was restored.');
        return;
      }

      setBoardError(null);
    } catch {
      setProject(snapshot);
      setBoardError('Could not move card. The board was restored.');
    } finally {
      setSyncingCardId(null);
    }
  }, [cardsByColumn, project, syncingCardId]);

  const handleDeleteCardRequest = useCallback((card: KanbanCardRecord) => {
    void handleDeleteCard(card);
  }, [handleDeleteCard]);

  const handleDragEndRequest = useCallback((result: DropResult) => {
    void handleDragEnd(result);
  }, [handleDragEnd]);

  const handleDialogOpenChange = useCallback((open: boolean) => {
    setDialogState((current) => ({ ...current, open }));
  }, []);

  const handleDialogSave = useCallback((payload: {
    title: string;
    description: string;
    priority: KanbanCardRecord['priority'];
    assignee: string;
  }) => handleSaveCard(payload), [handleSaveCard]);

  const handleDialogDelete = useCallback(() => {
    if (dialogState.card) {
      return handleDeleteCard(dialogState.card);
    }

    return Promise.resolve();
  }, [dialogState.card, handleDeleteCard]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {boardError ? (
        <Alert variant="error">
          <AlertTitle>Board action could not be completed</AlertTitle>
          <AlertDescription className="text-red-700">{boardError}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={activeSide} onValueChange={(value) => setActiveSide(value as 'fe' | 'be')} className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Project tasks</h1>
            <p className="text-sm text-muted-foreground">
              Switch between frontend and backend workstreams, keep more tasks visible, and focus on one lane at a time.
            </p>
          </div>
          <TabsList className="w-full justify-start lg:w-auto">
            <TabsTrigger value="fe">Frontend Tasks</TabsTrigger>
            <TabsTrigger value="be">Backend Tasks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fe">
          <MemoizedBoardSection
            title="Frontend tasks"
            count={sideCounts.fe}
            columns={columnsBySide.fe}
            cardsByColumn={cardsByColumn}
            onAddCard={openCreateDialog}
            onEditCard={openEditDialog}
            onDeleteCard={handleDeleteCardRequest}
            onDragEnd={handleDragEndRequest}
            syncingCardId={syncingCardId}
            isBoardSyncing={syncingCardId != null}
          />
        </TabsContent>

        <TabsContent value="be">
          <MemoizedBoardSection
            title="Backend tasks"
            count={sideCounts.be}
            columns={columnsBySide.be}
            cardsByColumn={cardsByColumn}
            onAddCard={openCreateDialog}
            onEditCard={openEditDialog}
            onDeleteCard={handleDeleteCardRequest}
            onDragEnd={handleDragEndRequest}
            syncingCardId={syncingCardId}
            isBoardSyncing={syncingCardId != null}
          />
        </TabsContent>
      </Tabs>

      <CardDialog
        open={dialogState.open}
        onOpenChange={handleDialogOpenChange}
        initialCard={dialogState.card}
        onSave={handleDialogSave}
        onDelete={dialogState.card != null ? handleDialogDelete : undefined}
      />
    </div>
  );
}

function BoardSection({
  title,
  count,
  columns,
  cardsByColumn,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onDragEnd,
  syncingCardId,
  isBoardSyncing = false,
}: {
  title: string;
  count: number;
  columns: ProjectWithColumns['kanban_columns'];
  cardsByColumn: Record<string, KanbanCardRecord[]>;
  onAddCard: (columnId?: string) => void;
  onEditCard: (card: KanbanCardRecord) => void;
  onDeleteCard: (card: KanbanCardRecord) => void;
  onDragEnd: (result: DropResult) => void;
  syncingCardId?: string | null;
  isBoardSyncing?: boolean;
}) {
  return (
    <section>
      <Card className="rounded-[1.75rem] border shadow-none">
        <CardHeader className="flex flex-col gap-4 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl">{title}</CardTitle>
            <Badge className="px-3 py-1 text-sm">{count}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isBoardSyncing ? <Badge variant="secondary">Syncing board...</Badge> : null}
            <Button variant="secondary" size="sm" onClick={() => onAddCard(columns[0]?.id)} disabled={isBoardSyncing}>
              <PlusCircle className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {columns.length ? (
            <KanbanBoard
              columns={columns}
              cardsByColumn={cardsByColumn}
              onEditCard={onEditCard}
              onDeleteCard={onDeleteCard}
              onDragEnd={onDragEnd}
              syncingCardId={syncingCardId}
              isBoardSyncing={isBoardSyncing}
            />
          ) : (
            <div className="rounded-[1.5rem] border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              No columns were loaded for this task lane yet.
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

const MemoizedBoardSection = memo(BoardSection);
MemoizedBoardSection.displayName = 'MemoizedBoardSection';

function mutateCardCollection(
  project: ProjectWithColumns,
  columnId: string,
  cards: KanbanCardRecord[]
): ProjectWithColumns {
  return {
    ...project,
    kanban_columns: project.kanban_columns.map((column) =>
      column.id === columnId
        ? {
            ...column,
            kanban_cards: cards,
          }
        : column
    ),
  };
}

function replaceCard(
  project: ProjectWithColumns,
  targetId: string,
  replacement: KanbanCardRecord
): ProjectWithColumns {
  return {
    ...project,
    kanban_columns: project.kanban_columns.map((column) => {
      const cards = column.kanban_cards ?? [];
      const targetIndex = cards.findIndex((card) => card.id === targetId);

      if (targetIndex === -1) {
        return column;
      }

      const nextCards = [...cards];
      nextCards[targetIndex] = replacement;

      return {
        ...column,
        kanban_cards: nextCards,
      };
    }),
  };
}

function resequence(cards: KanbanCardRecord[]): KanbanCardRecord[] {
  return cards.map((card, index) => ({ ...card, position: index }));
}
