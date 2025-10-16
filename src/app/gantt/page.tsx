'use client';

import { useState, useEffect, useRef } from 'react';
import { Maximize } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Gantt from 'frappe-gantt';
import './frappe-gantt.css';
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
    const chartContainerRef = useRef<HTMLDivElement | null>(null);

    const handleToggleFullScreen = () => {
        const element = chartContainerRef.current;
        if (!element) return;

        if (!document.fullscreenElement) {
            element.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const handleGenerateChart = async () => {
        if (!selectedProject) {
            alert('Por favor, selecione um projeto.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${selectedProject}/tasks`);
            if (!response.ok) {
                throw new Error('Falha ao buscar tarefas do projeto.');
            }
            const projectTasks: Task[] = await response.json();

            if (projectTasks.length === 0) {
                alert('Este projeto não possui tarefas para exibir no gráfico.');
                if (ganttInstance.current) {
                    ganttInstance.current.clear();
                }
                setTasks([]);
                setIsLoading(false);
                return;
            }

            setTasks(projectTasks);

        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

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

            ganttInstance.current = new Gantt(ganttRef.current, validGanttTasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Day',
                date_format: 'YYYY-MM-DD',
                language: 'pt',
                custom_popup_html: task => {
                    return `
                        <div class="p-2 bg-white shadow-lg rounded-md border text-sm">
                            <h4 class="font-bold mb-1">${task.name}</h4>
                            <p class="text-muted-foreground">Início: ${formatDate(task._start)}</p>
                            <p class="text-muted-foreground">Fim: ${formatDate(task._end)}</p>
                            <p class="text-muted-foreground">Progresso: ${task.progress}%</p>
                        </div>
                    `;
                }
            });
        }
    }, [tasks]);

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
                            <Select onValueChange={setSelectedProject} value={selectedProject || ''}>
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
                        <Button onClick={handleGenerateChart} disabled={isLoading || !selectedProject}>
                            {isLoading ? 'Gerando...' : 'Gerar Gráfico Gantt'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Cronograma do Projeto</CardTitle>
                        <Button variant="outline" size="icon" onClick={handleToggleFullScreen} title="Ver em Tela Cheia">
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {tasks.length > 0 ? (
                            <div
                                ref={chartContainerRef}
                                className="gantt-container overflow-x-auto bg-background"
                                style={{ maxWidth: '82vw', height: '600px' }}
                            >
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