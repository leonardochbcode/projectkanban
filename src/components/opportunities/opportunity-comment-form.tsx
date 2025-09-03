'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { type Opportunity, type OpportunityComment } from '@/lib/types';
import { useStore } from '@/hooks/use-store';

export function OpportunityCommentForm({ opportunity }: { opportunity: Opportunity }) {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { updateOpportunity, currentUser } = useStore();
  
  if(!currentUser) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsLoading(true);
    
    const newComment: OpportunityComment = {
        id: `opportunity-comment-${Date.now()}`,
        content: comment,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
    }
    updateOpportunity({...opportunity, comments: [...opportunity.comments, newComment]})
    setComment('');

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Digite seu apontamento ou comentário aqui..."
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
