'use client';
import React, { useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/hooks/use-store';
import { TaskDetailsSheet } from '@/components/tasks/task-details-sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { useState } from 'react';

const ITEMS_PER_PAGE = 10;

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


function MyTasksPageContent() {
    const { tasks, currentUser, allProjects } = useStore();
    const [currentPage, setCurrentPage] = useState(1);

    const myTasks = useMemo(() => {
        if (!currentUser) return [];

        const filteredTasks = tasks.filter(task => task.assigneeId === currentUser.id);

        // Sort by due date (ascending)
        const sortedTasks = filteredTasks.sort((a, b) => 
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        );
        
        return sortedTasks;
    }, [tasks, currentUser]);

    const totalPages = Math.ceil(myTasks.length / ITEMS_PER_PAGE);
    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return myTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [myTasks, currentPage]);

    const getProjectName = (projectId: string) => {
        // We need to use the raw projects from the store, not the visible ones,
        // so we can show the project name even if the user doesn't have direct access to it.
        return allProjects?.find(p => p.id === projectId)?.name || 'Projeto não encontrado';
    }

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Minhas Tarefas</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Tarefas Atribuídas</CardTitle>
                    <CardDescription>
                        Todas as tarefas que foram atribuídas a você, ordenadas por prazo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tarefa</TableHead>
                                <TableHead>Projeto</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Prioridade</TableHead>
                                <TableHead>Prazo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTasks.map(task => (
                                <TaskDetailsSheet key={task.id} task={task}>
                                    <TableRow className="cursor-pointer">
                                        <TableCell className="font-medium">{task.title}</TableCell>
                                        <TableCell>
                                            <Link href={`/projects/${task.projectId}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                                {getProjectName(task.projectId)}
                                            </Link>
                                        </TableCell>
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
                                    </TableRow>
                                </TaskDetailsSheet>
                            ))}
                        </TableBody>
                    </Table>
                    {paginatedTasks.length > 0 ? (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            Você não tem nenhuma tarefa atribuída.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function MyTasksPage() {
    return (
        <AppLayout>
            <MyTasksPageContent />
        </AppLayout>
    );
}
