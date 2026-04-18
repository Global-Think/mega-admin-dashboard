'use client';

import { useEffect } from 'react';
import { Bold, Code2, Italic, List, ListOrdered, Quote } from 'lucide-react';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { toRichTextHtml } from '@/lib/rich-text';

const toolbarItems = [
  { key: 'bold', label: 'Bold', icon: Bold, isActive: (editor: Editor | null) => editor?.isActive('bold') ?? false, run: (editor: Editor | null) => editor?.chain().focus().toggleBold().run() },
  { key: 'italic', label: 'Italic', icon: Italic, isActive: (editor: Editor | null) => editor?.isActive('italic') ?? false, run: (editor: Editor | null) => editor?.chain().focus().toggleItalic().run() },
  { key: 'bulletList', label: 'Bullet list', icon: List, isActive: (editor: Editor | null) => editor?.isActive('bulletList') ?? false, run: (editor: Editor | null) => editor?.chain().focus().toggleBulletList().run() },
  { key: 'orderedList', label: 'Ordered list', icon: ListOrdered, isActive: (editor: Editor | null) => editor?.isActive('orderedList') ?? false, run: (editor: Editor | null) => editor?.chain().focus().toggleOrderedList().run() },
  { key: 'blockquote', label: 'Quote', icon: Quote, isActive: (editor: Editor | null) => editor?.isActive('blockquote') ?? false, run: (editor: Editor | null) => editor?.chain().focus().toggleBlockquote().run() },
  { key: 'codeBlock', label: 'Code block', icon: Code2, isActive: (editor: Editor | null) => editor?.isActive('codeBlock') ?? false, run: (editor: Editor | null) => editor?.chain().focus().toggleCodeBlock().run() },
] as const;

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Add implementation notes, blockers, acceptance criteria, or anything the team needs to know.',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        horizontalRule: false,
      }),
    ],
    content: toRichTextHtml(value),
    editorProps: {
      attributes: {
        class:
          'min-h-[280px] px-4 py-3 text-sm leading-7 focus:outline-none prose-none [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-3 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:pl-6',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextValue = toRichTextHtml(value);
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <div className={cn('rounded-xl border bg-background', className)}>
      <div className="flex flex-wrap gap-2 border-b px-3 py-3">
        {toolbarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.isActive(editor);

          return (
            <Button
              key={item.key}
              type="button"
              variant={isActive ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-2.5"
              onClick={() => item.run(editor)}
              disabled={!editor}
              aria-label={item.label}
              title={item.label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>

      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <div className="min-h-[280px] px-4 py-3 text-sm text-muted-foreground">{placeholder}</div>
      )}
    </div>
  );
}
