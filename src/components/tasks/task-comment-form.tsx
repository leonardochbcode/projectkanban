'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type Task, type TaskComment } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface TaskCommentFormProps {
  task: Task;
  onCommentAdded: () => void;
}

export function TaskCommentForm({ task, onCommentAdded }: TaskCommentFormProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      setComment('');
      onCommentAdded(); // Callback to refresh the task details
      toast({
        title: "Comentário adicionado",
        description: "Seu comentário foi salvo com sucesso.",
      });

    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o seu comentário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Digite seu comentário ou atualização aqui..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
      />
      <Button type="submit" disabled={isSubmitting || !comment.trim()}>
        {isSubmitting ? 'Adicionando...' : 'Adicionar Comentário'}
      </Button>
    </form>
  );
}
