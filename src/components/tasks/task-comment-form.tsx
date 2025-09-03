'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type Task, type TaskComment } from '@/lib/types';
import { useStore } from '@/hooks/use-store';

export function TaskCommentForm({ task }: { task: Task }) {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { participants, updateTask } = useStore();
  
  if(!participants.length) {
    return null;
  }
  const currentUser = participants[0]; // Assume first participant is the current user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsLoading(true);
    
    const newComment: TaskComment = {
        id: `comment-${Date.now()}`,
        content: comment,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
    }
    updateTask({...task, comments: [...task.comments, newComment]})
    setComment('');

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Digite seu comentário ou atualização aqui..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isLoading}
      />
      <Button type="submit" disabled={isLoading || !comment.trim()}>
        {isLoading ? 'Adicionando...' : 'Adicionar Comentário'}
      </Button>
    </form>
  );
}
