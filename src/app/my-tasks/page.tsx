'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/hooks/use-store';
import { TaskDetailsSheet } from '@/components/tasks/task-details-sheet';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { Task } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const ITEMS_PER_PAGE = 10;

const statusOptions = ['A Fazer', 'Em Andamento', 'Concluída', 'Cancelado'];
const priorityOptions = ['Baixa', 'Média', 'Alta'];

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
    const { projects, getProjectName } = useStore();
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [projectFilter, setProjectFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    useEffect(() => {
        const fetchMyTasks = async () => {
            setIsLoading(true);
            const params = new URLSearchParams();
            if (projectFilter !== 'all') params.append('projectId', projectFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (priorityFilter !== 'all') params.append('priority', priorityFilter);

            try {
                const response = await fetch(`/api/my-tasks?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch tasks');
                const tasks = await response.json();
                setMyTasks(tasks);
            } catch (error) {
                console.error(error);
                // Handle error state in UI if necessary
            } finally {
                setIsLoading(false);
                setCurrentPage(1); // Reset to first page on filter change
            }
        };

        fetchMyTasks();
    }, [projectFilter, statusFilter, priorityFilter]);


    const totalPages = Math.ceil(myTasks.length / ITEMS_PER_PAGE);
    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return myTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [myTasks, currentPage]);

    const isTaskOverdue = (task: Task) => {
        return new Date(task.dueDate) < new Date() && task.status !== 'Concluída' && task.status !== 'Cancelado';
    };

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Minhas Tarefas</h1>
            </div>

            <Card>
                <CardContent className="grid sm:grid-cols-3 gap-4 p-4">
                    <div className="space-y-2">
                        <Label>Projeto</Label>
                        <Select value={projectFilter} onValueChange={setProjectFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos os projetos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os projetos</SelectItem>
                                {projects?.map(project => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                {statusOptions.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todas as prioridades" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as prioridades</SelectItem>
                                {priorityOptions.map(priority => (
                                    <SelectItem key={priority} value={priority}>
                                        {priority}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Tarefas Atribuídas</CardTitle>
                    <CardDescription>
                        Todas as tarefas atribuídas a você, com as atrasadas no topo.
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Carregando tarefas...</TableCell>
                                </TableRow>
                            ) : paginatedTasks.map(task => (
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
                                        <TableCell className="flex items-center gap-2">
                                            {new Date(task.dueDate).toLocaleDateString()}
                                            {isTaskOverdue(task) && (
                                                <Badge variant="destructive">Atrasada</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                </TaskDetailsSheet>
                            ))}
                        </TableBody>
                    </Table>
                    {!isLoading && paginatedTasks.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            Nenhuma tarefa encontrada para os filtros selecionados.
                        </div>
                    )}
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
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
