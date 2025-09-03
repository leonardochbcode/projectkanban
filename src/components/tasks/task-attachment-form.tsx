'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Task, TaskAttachment } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

export function TaskAttachmentForm({ task }: { task: Task }) {
  const [isLoading, setIsLoading] = useState(false);
  const { updateTask } = useStore();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    const file = files[0];
    const newAttachment: TaskAttachment = {
      id: `task-attachment-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Mock URL for local preview
      createdAt: new Date().toISOString(),
    };

    const updatedAttachments = [...(task.attachments || []), newAttachment];
    updateTask({ ...task, attachments: updatedAttachments });

    toast({
        title: 'Anexo adicionado',
        description: `O arquivo "${file.name}" foi anexado à tarefa.`,
    });
    
    setIsLoading(false);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      <Button onClick={handleButtonClick} disabled={isLoading} variant="outline" className="w-full">
        <Upload className="mr-2 h-4 w-4" />
        {isLoading ? 'Anexando...' : 'Adicionar Anexo'}
      </Button>
    </div>
  );
}
