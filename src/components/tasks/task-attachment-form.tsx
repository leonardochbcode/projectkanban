'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Task, TaskAttachment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface TaskAttachmentFormProps {
  task: Task;
  onAttachmentAdded: () => void;
}

export function TaskAttachmentForm({ task, onAttachmentAdded }: TaskAttachmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);

    const file = files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('taskId', task.id);

    try {
        // 1. Upload the file to the server
        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('File upload failed');
        }

        const uploadResult = await uploadResponse.json();
        const { url } = uploadResult;

        // 2. Create the attachment record in the database with the new URL
        const attachmentResponse = await fetch(`/api/tasks/${task.id}/attachments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: file.name,
                size: file.size,
                type: file.type,
                url: url,
            }),
        });

        if (!attachmentResponse.ok) {
            throw new Error('Failed to create attachment record');
        }

        toast({
            title: 'Anexo adicionado',
            description: `O arquivo "${file.name}" foi anexado à tarefa.`,
        });

        onAttachmentAdded();

    } catch (error) {
        console.error("Error adding attachment:", error);
        toast({
            title: 'Erro',
            description: 'Não foi possível adicionar o anexo. Tente novamente.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
        // Reset the file input
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
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
