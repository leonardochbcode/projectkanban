'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalysis } from '@/app/actions';
import { type Task, type TaskComment } from '@/lib/types';
import { Wand2, Zap, UserSwitch } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useStore } from '@/hooks/use-store';

type AnalysisResult = {
  priorityActionItems: string;
  suggestedReassignments: string;
};

export function AiTaskAnalyzer({ task }: { task: Task }) {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { participants, updateTask } = useStore();
  const currentUser = participants[0]; // Assume first participant is the current user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsLoading(true);
    setAnalysis(null);
    setError(null);
    
    // In a real app, you'd combine all recent comments. Here we use the new one.
    const allComments = [...task.comments.map(c => c.content), comment].join('\n\n');

    try {
      const result = await getAnalysis({ taskComments: allComments });
      if (result.priorityActionItems && result.suggestedReassignments) {
        setAnalysis(result);

        // Add the comment to the task
        const newComment: TaskComment = {
            id: `comment-${Date.now()}`,
            content: comment,
            authorId: currentUser.id,
            createdAt: new Date().toISOString(),
        }
        updateTask({...task, comments: [...task.comments, newComment]})
        setComment('');

      } else {
        throw new Error('Invalid analysis result');
      }
    } catch (err) {
      setError('Falha ao analisar comentários. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3 className="font-semibold mb-2 font-headline">Analisador de Tarefas com IA</h3>
      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary"/>
                <CardTitle className="text-base font-headline">Análise de Discussão da Equipe</CardTitle>
            </div>
            <CardDescription>
                Adicione um comentário e deixe a IA analisar a discussão para extrair itens de ação e sugerir reatribuições.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              placeholder="Digite seu comentário ou atualização aqui..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !comment.trim()}>
              {isLoading ? 'Analisando...' : 'Adicionar Comentário e Analisar'}
            </Button>
          </form>

          {error && <p className="text-red-500 mt-4">{error}</p>}

          {analysis && (
            <div className="mt-6 space-y-4">
               <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle className="font-headline">Itens de Ação Prioritários</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{analysis.priorityActionItems}</AlertDescription>
                </Alert>
                <Alert>
                    <UserSwitch className="h-4 w-4" />
                    <AlertTitle className="font-headline">Reatribuições Sugeridas</AlertTitle>
                    <AlertDescription className="whitespace-pre-wrap">{analysis.suggestedReassignments}</AlertDescription>
                </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
