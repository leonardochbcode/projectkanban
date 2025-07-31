'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/hooks/use-store';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { getParticipant } = useStore();
  const assignee = task.assigneeId ? getParticipant(task.assigneeId) : null;

  const priorityColors: { [key: string]: string } = {
    Alta: 'bg-destructive text-destructive-foreground',
    Média: 'bg-secondary text-secondary-foreground',
    Baixa: 'bg-secondary text-secondary-foreground',
  };

  return (
    <TaskDetailsSheet task={task}>
      <Card className="hover:bg-card/90 cursor-pointer transition-colors">
        <CardHeader className="p-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base leading-snug">{task.title}</CardTitle>
            <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
              {task.priority}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
                Prazo: {new Date(task.dueDate).toLocaleDateString()}
            </div>
            {assignee && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignee.avatar} />
                      <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{assignee.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>
    </TaskDetailsSheet>
  );
}
