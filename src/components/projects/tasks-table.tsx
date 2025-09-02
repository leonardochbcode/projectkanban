'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useStore } from '@/hooks/use-store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';

interface TasksTableProps {
  tasks: Task[];
}

export function TasksTable({ tasks }: TasksTableProps) {
  const { getParticipant } = useStore();

  const statusColors: { [key: string]: string } = {
    'A Fazer': 'bg-yellow-500/20 text-yellow-700',
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    'Concluída': 'bg-green-500/20 text-green-700',
    'Cancelado': 'bg-gray-500/20 text-gray-700',
  };

  const priorityColors: { [key: string]: string } = {
    'Alta': 'bg-red-500/20 text-red-700',
    'Média': 'bg-yellow-500/20 text-yellow-700',
    'Baixa': 'bg-blue-500/20 text-blue-700',
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Prazo</TableHead>
          <TableHead className="text-right">Responsável</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const assignee = task.assigneeId ? getParticipant(task.assigneeId) : null;
          return (
            <TaskDetailsSheet key={task.id} task={task}>
                <TableRow className="cursor-pointer">
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn(statusColors[task.status])}>
                    {task.status}
                    </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className={cn(priorityColors[task.priority])}>
                    {task.priority}
                    </Badge>
                </TableCell>
                <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                    {assignee ? (
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                             <Avatar className="h-7 w-7 inline-block">
                                <AvatarImage src={assignee.avatar} />
                                <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{assignee.name}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    ) : (
                    <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                </TableCell>
                </TableRow>
            </TaskDetailsSheet>
          );
        })}
      </TableBody>
    </Table>
  );
}
