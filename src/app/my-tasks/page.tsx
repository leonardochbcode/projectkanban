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
import { useState, useEffect } from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Task } from '@/lib/types';

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
    const { currentUser, projects } = useStore();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    const [selectedProject, setSelectedProject] = useState<string | undefined>(undefined);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['A Fazer', 'Em Andamento']);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

    useEffect(() => {
        const fetchTasks = async () => {
            if (!currentUser) return;
            setIsLoading(true);
            const params = new URLSearchParams();
            if (selectedProject) params.append('projectId', selectedProject);
            if (selectedStatuses.length > 0) params.append('status', selectedStatuses.join(','));
            if (selectedPriorities.length > 0) params.append('priority', selectedPriorities.join(','));

            try {
                const response = await fetch(`/api/my-tasks?${params.toString()}`);
                if (!response.ok) throw new Error('Failed to fetch tasks');
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [currentUser, selectedProject, selectedStatuses, selectedPriorities]);

    const totalPages = Math.ceil(tasks.length / ITEMS_PER_PAGE);
    const paginatedTasks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return tasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [tasks, currentPage]);

    const getProjectName = (projectId: string) => {
        return projects?.find(p => p.id === projectId)?.name || 'Projeto não encontrado';
    }

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Minhas Tarefas</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <Select value={selectedProject} onValueChange={(value) => setSelectedProject(value === 'all' ? undefined : value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Filtrar por projeto..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os Projetos</SelectItem>
                        {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <MultiSelect
                    options={[
                        { label: 'A Fazer', value: 'A Fazer' },
                        { label: 'Em Andamento', value: 'Em Andamento' },
                        { label: 'Concluída', value: 'Concluída' },
                        { label: 'Cancelado', value: 'Cancelado' },
                    ]}
                    value={selectedStatuses}
                    onValueChange={setSelectedStatuses}
                    placeholder="Filtrar por status..."
                />
                <MultiSelect
                    options={[
                        { label: 'Baixa', value: 'Baixa' },
                        { label: 'Média', value: 'Média' },
                        { label: 'Alta', value: 'Alta' },
                    ]}
                    value={selectedPriorities}
                    onValueChange={setSelectedPriorities}
                    placeholder="Filtrar por prioridade..."
                />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Lista de Tarefas</CardTitle>
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
                                    <TableRow className="cursor-pointer text-xs">
                                        <TableCell className="font-medium flex items-center gap-2">
                                            {task.title}
                                            {new Date(task.dueDate) < new Date() && task.status !== 'Concluída' && task.status !== 'Cancelado' && (
                                                <Badge variant="destructive" className="text-xs">Atrasada</Badge>
                                            )}
                                        </TableCell>
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
