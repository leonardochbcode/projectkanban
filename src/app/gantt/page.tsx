'use client';

import { useState, useEffect, useRef } from 'react';
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react';
import { useStore } from '@/hooks/use-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Gantt from 'frappe-gantt';
import type { Task } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppLayout } from '@/components/layout/app-layout';
import { Label } from '@/components/ui/label';

// Helper to format date to YYYY-MM-DD
const formatDate = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const viewModes = ['Day', 'Month'];
type ViewMode = 'Day' | 'Month';

function GanttPageContent() {
    const { projects } = useStore();
    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('Day');

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

    const handleZoomIn = () => {
        const currentIndex = viewModes.indexOf(viewMode);
        if (currentIndex > 0) {
            const newViewMode = viewModes[currentIndex - 1] as ViewMode;
            setViewMode(newViewMode);
            ganttInstance.current?.change_view_mode(newViewMode);
        }
    };

    const handleZoomOut = () => {
        const currentIndex = viewModes.indexOf(viewMode);
        if (currentIndex < viewModes.length - 1) {
            const newViewMode = viewModes[currentIndex + 1] as ViewMode;
            setViewMode(newViewMode);
            ganttInstance.current?.change_view_mode(newViewMode);
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
            if (!response.ok) throw new Error('Falha ao buscar tarefas do projeto.');

            let projectTasks: Task[] = await response.json();

            // Filter tasks by date range if provided
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                projectTasks = projectTasks.filter(task => {
                    const taskStart = new Date(task.startDate || task.creationDate);
                    return taskStart >= start && taskStart <= end;
                });
            }

            if (projectTasks.length === 0) {
                alert('Nenhuma tarefa encontrada para os filtros aplicados.');
                ganttInstance.current?.clear();
                setTasks([]);
            } else {
                setTasks(projectTasks);
            }

        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (tasks.length > 0 && ganttRef.current) {
            ganttInstance.current?.clear();

            const ganttTasks = tasks.map(task => ({
                id: task.id,
                name: `Tarefa: ${task.title}`,
                start: formatDate(task.startDate || task.creationDate),
                end: formatDate(task.conclusionDate || task.dueDate),
                progress: task.status === 'Concluída' ? 100 : 0,
                dependencies: '',
            }));

            const validGanttTasks = ganttTasks.filter(t => t.start && t.end);

            if (validGanttTasks.length === 0) {
                alert('Nenhuma das tarefas filtradas tem datas válidas para exibir.');
                return;
            }

            ganttInstance.current = new Gantt(ganttRef.current, validGanttTasks, {
                header_height: 60,
                column_width: 30,
                step: 24,
                view_modes: viewModes,
                bar_height: 30,
                bar_corner_radius: 6,
                arrow_curve: 10,
                padding: 35,
                view_mode: viewMode,
                date_format: 'YYYY-MM-DD',
                language: 'pt',
                scroll_to: 'start',
                custom_popup_html: task => {
                    const ganttTask = tasks.find(t => t.id === task.id);
                    return `
                        <div class="p-3 bg-white shadow-lg rounded-lg border text-base">
                            <h4 class="font-bold text-lg mb-2">${task.name}</h4>
                            <p class="text-muted-foreground">Início: ${formatDate(ganttTask?.startDate)}</p>
                            <p class="text-muted-foreground">Fim: ${formatDate(ganttTask?.dueDate)}</p>
                            <p class="text-muted-foreground mt-1">Status: ${ganttTask?.status}</p>
                        </div>
                    `;
                }
            });
        }
    }, [tasks]);


    return (
        <div className="flex-1 space-y-2 p-4 sm:p-5 pt-6">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <h1 className="text-xl font-bold tracking-tight font-headline">Gráfico de Gantt</h1>
            </div>
            <Card>
                <CardContent className='py-2'>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="space-y-2">
                            <Label htmlFor="project-select">Projeto</Label>
                            <Select onValueChange={setSelectedProject} value={selectedProject || ''}>
                                <SelectTrigger id="project-select" className='h-7'>
                                    <SelectValue placeholder="Selecione um projeto" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {`Projeto: ${project.name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="start-date">Data de Início</Label>
                            <Input
                                className='h-7'
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end-date">Data de Fim</Label>
                            <Input
                                className='h-7'
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <Button onClick={handleGenerateChart} disabled={isLoading || !selectedProject} size={'xs'}>
                                {isLoading ? 'Gerando...' : 'Gerar Gráfico'}
                            </Button>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <div className="mt-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between py-1">
                        <CardTitle className='text-lg'>Cronograma do Projeto</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={handleZoomIn} title="Aproximar">
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleZoomOut} title="Afastar">
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleToggleFullScreen} title="Ver em Tela Cheia">
                                <Maximize className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {tasks.length > 0 ? (
                            <div
                                ref={chartContainerRef}
                                className="gantt-container overflow-x-auto bg-background"
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