'use client';
import React, { useMemo, useCallback } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { Toolbar } from './toolbar';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const initialValue = useMemo((): Descendant[] => {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      // Fallback for plain text or invalid JSON
    }
    return [{ type: 'paragraph', children: [{ text: value || '' }] }];
  }, [value]);

  const handleChange = useCallback((newValue: Descendant[]) => {
    const isAstChange = editor.operations.some(
      op => 'set_selection' !== op.type
    );
    if (isAstChange) {
      const content = JSON.stringify(newValue);
      onChange(content);
    }
  }, [editor, onChange]);

  return (
    <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
      <Toolbar />
      <Editable
        placeholder={placeholder}
        className="border p-2 rounded-b"
        style={{ minHeight: '150px' }}
      />
    </Slate>
  );
}
