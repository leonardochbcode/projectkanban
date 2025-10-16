'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Gantt from 'frappe-gantt';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';

// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    // Ensure date is a Date object
    const d = typeof date === 'string' ? new Date(date) : date;
    // Add a day to the date to correct for timezone issues
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

function GanttPageContent() {
    const { projects } = useStore();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ganttRef = useRef<SVGSVGElement | null>(null);
    const ganttInstance = useRef<Gantt | null>(null);

    useEffect(() => {
        // Dynamically insert the stylesheet into the document head
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/frappe-gantt.css'; // We'll need to move the file to the public directory
        document.head.appendChild(link);

        return () => {
            // Clean up the link when the component unmounts
            document.head.removeChild(link);
        };
    }, []);

    const fetchAndGenerateChart = async (projectId: string) => {
        if (!projectId) return;

        setIsLoading(true);
        if (ganttInstance.current) {
            ganttInstance.current.clear();
        }

        try {
            const response = await fetch(`/api/projects/${projectId}/tasks`);
            if (!response.ok) {
                throw new Error('Falha ao buscar tarefas do projeto.');
            }
            const projectTasks: Task[] = await response.json();

            if (projectTasks.length === 0) {
                toast({
                    title: 'Sem tarefas',
                    description: 'Este projeto não possui tarefas para exibir no gráfico.',
                    variant: 'default',
                });
                setTasks([]); // Clear tasks to show the placeholder message
                return;
            }
            setTasks(projectTasks);
        } catch (error) {
            console.error(error);
            toast({
                title: 'Erro ao gerar gráfico',
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Automatically select the first project on initial load
    useEffect(() => {
        if (projects.length > 0 && !selectedProject) {
            const firstProjectId = projects[0].id;
            setSelectedProject(firstProjectId);
            fetchAndGenerateChart(firstProjectId);
        }
    }, [projects]);

    useEffect(() => {
        if (tasks.length > 0 && ganttRef.current) {
            // Clear previous chart
            if (ganttInstance.current) {
                ganttInstance.current.clear();
            }

            const ganttTasks = tasks.map(task => ({
                id: task.id,
                name: task.title,
                start: formatDate(task.startDate || task.creationDate),
                end: formatDate(task.conclusionDate || task.dueDate),
                progress: task.status === 'Concluída' ? 100 : 0, // Simplified progress
                dependencies: '', // Dependencies can be added later
            }));

            // Filter out tasks that don't have a valid start date
            const validGanttTasks = ganttTasks.filter(t => t.start);

            if (validGanttTasks.length === 0) {
                alert('Nenhuma das tarefas neste projeto tem datas de início válidas para exibir no gráfico.');
                return;
            }

            const getCustomBarClass = (status: Task['status']) => {
                switch (status) {
                    case 'A Fazer':
                        return 'bar-blue';
                    case 'Em Andamento':
                        return 'bar-orange';
                    case 'Concluída':
                        return 'bar-green';
                    case 'Cancelado':
                        return 'bar-red';
                    default:
                        return '';
                }
            };

            const ganttTasks = tasks.map(task => ({
                id: task.id,
                name: task.title,
                start: formatDate(task.startDate || task.creationDate),
                end: formatDate(task.conclusionDate || task.dueDate),
                progress: task.status === 'Concluída' ? 100 : 0, // Simplified progress
                dependencies: '', // Dependencies can be added later
                custom_class: getCustomBarClass(task.status),
            }));

            // Filter out tasks that don't have a valid start date
            const validGanttTasks = ganttTasks.filter(t => t.start);

            if (validGanttTasks.length === 0) {
                toast({
                    title: 'Sem tarefas válidas',
                    description: 'Nenhuma das tarefas neste projeto tem datas de início válidas para exibir no gráfico.',
                    variant: 'default',
                });
                return;
            }

            ganttInstance.current = new Gantt(ganttRef.current, validGanttTasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Week', // Default view changed to Week
                date_format: 'YYYY-MM-DD',
                language: 'pt',
                custom_popup_html: task => {
                    const originalTask = tasks.find(t => t.id === task.id);
                    return `
                        <div class="p-2 bg-white shadow-lg rounded-md border text-sm font-sans">
                            <h4 class="font-bold mb-2 text-primary">${task.name}</h4>
                            <p class="text-muted-foreground"><span class="font-semibold">Início:</span> ${formatDate(task._start)}</p>
                            <p class="text-muted-foreground"><span class="font-semibold">Fim:</span> ${formatDate(task._end)}</p>
                            ${originalTask ? `<p class="text-muted-foreground"><span class="font-semibold">Status:</span> ${originalTask.status}</p>` : ''}
                            <p class="text-muted-foreground"><span class="font-semibold">Progresso:</span> ${task.progress}%</p>
                        </div>
                    `;
                }
            });
        }
    }, [tasks]);

    const handleProjectSelect = (projectId: string) => {
        setSelectedProject(projectId);
        fetchAndGenerateChart(projectId);
    };

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Gráfico de Gantt</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Filtro de Projetos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            <Select onValueChange={handleProjectSelect} value={selectedProject || ''}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um projeto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={() => fetchAndGenerateChart(selectedProject!)} disabled={isLoading || !selectedProject}>
                            {isLoading ? 'Atualizando...' : 'Atualizar Gráfico'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Cronograma do Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tasks.length > 0 ? (
                            <div className="gantt-container overflow-x-auto">
                                <svg ref={ganttRef}></svg>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                Selecione um projeto e clique em "Gerar Gráfico" para visualizar o cronograma.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function GanttPage() {
  return (
    <AppLayout>
      <GanttPageContent />
    </AppLayout>
  )
}