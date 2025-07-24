'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/hooks/use-store';
import type { Project } from '@/lib/types';
import { AddTaskDialog } from '../tasks/add-task-dialog';
import { Button } from '../ui/button';
import { PlusCircle, Briefcase } from 'lucide-react';
import { Badge } from '../ui/badge';

export function ProjectHeader({ project }: { project: Project }) {
  const { getProjectTasks, getClient } = useStore();
  const tasks = getProjectTasks(project.id);
  const client = project.clientId ? getClient(project.clientId) : null;
  const completedTasks = tasks.filter((task) => task.status === 'Concluída').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center justify-between space-y-2 mb-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">{project.name}</h1>
                <div className="flex items-center gap-4">
                    <p className="text-muted-foreground">{project.description}</p>
                    {client && (
                        <Badge variant="secondary" className="gap-1.5">
                            <Briefcase className="h-3 w-3" />
                            {client.name}
                        </Badge>
                    )}
                </div>
            </div>
            <AddTaskDialog projectId={project.id}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Tarefa
                </Button>
            </AddTaskDialog>
        </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>{completedTasks} de {tasks.length} tarefas concluídas</span>
        </div>
      </div>
    </div>
  );
}
