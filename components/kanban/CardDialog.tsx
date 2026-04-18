'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { toRichTextHtml } from '@/lib/rich-text';
import type { KanbanCardRecord } from '@/types/project';

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor').then((module) => module.RichTextEditor),
  {
    loading: () => (
      <div className="min-h-[280px] rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
        Loading editor...
      </div>
    ),
  }
);

type CardFormState = {
  title: string;
  description: string;
  priority: KanbanCardRecord['priority'];
  assignee: string;
};

const defaultFormState: CardFormState = {
  title: '',
  description: '',
  priority: 'medium',
  assignee: '',
};

export function CardDialog({
  open,
  onOpenChange,
  initialCard,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCard?: KanbanCardRecord | null;
  onSave: (payload: CardFormState) => Promise<void> | void;
  onDelete?: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<CardFormState>(defaultFormState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialCard) {
      setForm({
        title: initialCard.title,
        description: toRichTextHtml(initialCard.description),
        priority: initialCard.priority,
        assignee: initialCard.assignee ?? '',
      });
      return;
    }

    setForm(defaultFormState);
  }, [initialCard, open]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) {
      return;
    }

    setSaving(true);
    try {
      await onDelete();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-6 sm:px-8">
          <DialogTitle className="text-2xl">{initialCard ? 'Card details' : 'Create card'}</DialogTitle>
          <DialogDescription>
            Open the full task context, update the notes, and manage the card from one focused workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6 sm:px-8">
          <div className="space-y-3">
            <Label htmlFor="card-title">Title</Label>
            <Input
              id="card-title"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ship scaffolded auth flow"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    priority: value as KanbanCardRecord['priority'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="card-assignee">Assignee</Label>
              <Input
                id="card-assignee"
                value={form.assignee}
                onChange={(event) => setForm((current) => ({ ...current, assignee: event.target.value }))}
                placeholder="durantula1"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="card-description">Description</Label>
            <RichTextEditor
              value={form.description}
              onChange={(value) => setForm((current) => ({ ...current, description: value }))}
            />
          </div>

          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {initialCard ? (
                <Button variant="outline" onClick={handleDelete} disabled={saving}>
                  <Trash2 className="h-4 w-4" />
                  Delete card
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.title.trim()} className="min-w-[160px]">
                {saving ? 'Saving...' : 'Save card'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
