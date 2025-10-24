'use client';
import { useSlate } from 'slate-react';
import { Editor, Transforms, Text } from 'slate';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline } from 'lucide-react';

const isMarkActive = (editor: Editor, format: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleMark = (editor: Editor, format: string) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const MarkButton = ({ format, icon }: { format: string, icon: React.ReactNode }) => {
  const editor = useSlate();
  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
      data-active={isMarkActive(editor, format)}
    >
      {icon}
    </Button>
  );
};

export function Toolbar() {
  return (
    <div className="flex gap-1 border p-2 rounded-t">
      <MarkButton format="bold" icon={<Bold className="h-4 w-4" />} />
      <MarkButton format="italic" icon={<Italic className="h-4 w-4" />} />
      <MarkButton format="underline" icon={<Underline className="h-4 w-4" />} />
    </div>
  );
}
