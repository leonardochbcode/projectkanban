'use client';
import type { Task, Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Pagination } from '../ui/pagination';

interface TaskChecklistProps {
  tasks: Task[];
  projects: Project[];
}

const ITEMS_PER_PAGE = 6;

export function TaskChecklist({ tasks, projects }: TaskChecklistProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [tasks, currentPage]);

    const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);

    const getProjectName = (projectId: string) => {
        return projects.find(p => p.id === projectId)?.name || 'N/A';
    };

    const getDueDateBadge = (dueDate: string) => {
        const today = new Date();
        const date = new Date(dueDate);
        today.setHours(0, 0, 0, 0);

        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return <Badge variant="destructive">Vencido</Badge>;
        }
        if (diffDays === 0) {
            return <Badge className="bg-yellow-500 text-white">Vence Hoje</Badge>;
        }
        return <Badge variant="outline">{date.toLocaleDateString()}</Badge>;
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklist de Tarefas</CardTitle>
        <CardDescription>Tarefas com prazo próximo ou vencidas.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead className="text-right">Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                    <Link href={`/projects/${task.projectId}?taskId=${task.id}`} className="hover:underline">
                        {task.title}
                    </Link>
                </TableCell>
                <TableCell>{getProjectName(task.projectId)}</TableCell>
                <TableCell className="text-right">
                    {getDueDateBadge(task.dueDate)}
                </TableCell>
              </TableRow>
            ))}
            {tasks.length === 0 && (
                <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                        Nenhuma tarefa com prazo próximo.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}