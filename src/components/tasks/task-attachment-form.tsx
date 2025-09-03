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

    // In a real app, you would upload the file to a storage service (e.g., S3, Firebase Storage)
    // and then send the URL to your API. For this example, we'll simulate this.
    const formData = new FormData();
    formData.append('file', file);

    try {
        // This is where you would typically upload the file.
        // const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        // const { url } = await uploadResponse.json();

        // For now, we'll skip the actual upload and go straight to our API.
        const response = await fetch(`/api/tasks/${task.id}/attachments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: file.name,
                size: file.size,
                type: file.type,
                url: `/uploads/${task.id}/${file.name}` // Mock URL
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to add attachment');
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
