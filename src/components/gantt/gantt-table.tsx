'use client';

import { useStore } from '@/hooks/use-store';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';
import { useState } from 'react';
import type { Task } from '@/lib/types';
import { format, parseISO } from 'date-fns';

const statusColors: { [key: string]: string } = {
  'A Fazer': 'bg-yellow-500/20 text-yellow-700',
  'Em Andamento': 'bg-blue-500/20 text-blue-700',
  'Concluída': 'bg-green-500/20 text-green-700',
};

export function GanttTable({
  selectedProjectId,
  onSelectProject,
}: {
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}) {
  const { projects, getProjectTasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSheetOpen(true);
  };
  
  const onSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    if (!isOpen) {
      setSelectedTask(undefined);
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Projetos e Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => {
                const tasks = getProjectTasks(project.id);
                const isSelected = project.id === selectedProjectId;

                return (
                  <>
                    <TableRow
                      key={project.id}
                      onClick={() => onSelectProject(project.id)}
                      className={cn(
                        'cursor-pointer font-semibold',
                        isSelected && 'bg-muted hover:bg-muted'
                      )}
                    >
                      <TableCell>{project.name}</TableCell>
                      <TableCell>{format(parseISO(project.startDate), 'dd/MM/yy')}</TableCell>
                      <TableCell>{format(parseISO(project.endDate), 'dd/MM/yy')}</TableCell>
                    </TableRow>
                    {isSelected && tasks.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="p-0">
                          <div className="p-2 pl-8 bg-muted/50">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[50%]">Tarefa</TableHead>
                                  <TableHead>Prazo</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {tasks.map(task => (
                                  <TableRow key={task.id} className="cursor-pointer bg-card" onClick={() => handleTaskClick(task)}>
                                    <TableCell>{task.title}</TableCell>
                                    <TableCell>{format(parseISO(task.dueDate), 'dd/MM/yy')}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className={cn('text-xs', statusColors[task.status])}>
                                        {task.status}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedTask && (
        <TaskDetailsSheet
          task={selectedTask}
          open={isSheetOpen}
          onOpenChange={onSheetOpenChange}
        />
      )}
    </>
  );
}
