'use client';
import { useStore } from '@/hooks/use-store';
import React, { useEffect, useRef, useMemo } from 'react';
import Gantt from 'frappe-gantt';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';
import { parseISO } from 'date-fns';

export function GanttChart() {
    const { projects, getProjectTasks, isLoaded } = useStore();
    const ganttContainerRef = useRef<HTMLDivElement | null>(null);
    const ganttInstance = useRef<Gantt | null>(null);

    const ganttTasks = useMemo(() => {
        const formattedTasks: any[] = [];
        
        projects.forEach(project => {
            if (!project.startDate || !project.endDate) return;

            try {
                const projectTasks = getProjectTasks(project.id);
                const totalTasks = projectTasks.length;
                const completedTasks = projectTasks.filter(t => t.status === 'Concluída').length;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                formattedTasks.push({
                    id: project.id,
                    name: project.name,
                    start: parseISO(project.startDate),
                    end: parseISO(project.endDate),
                    progress: progress,
                    custom_class: 'gantt-project-bar'
                });

                projectTasks.forEach(task => {
                    if (!task.dueDate) return;
                    try {
                        const dueDate = parseISO(task.dueDate);
                        formattedTasks.push({
                            id: task.id,
                            name: task.title,
                            start: dueDate,
                            end: dueDate, 
                            progress: task.status === 'Concluída' ? 100 : 0,
                            dependencies: project.id,
                            custom_class: 'gantt-task-bar'
                        });
                    } catch (taskError) {
                        console.error(`Erro ao processar data para a tarefa ID ${task.id}:`, taskError);
                    }
                });
            } catch (projectError) {
                console.error(`Erro ao processar data para o projeto ID ${project.id}:`, projectError);
            }
        });
        
        return formattedTasks;
    }, [projects, getProjectTasks]);

    useEffect(() => {
        if (ganttInstance.current) {
            ganttInstance.current.destroy();
            ganttInstance.current = null;
        }

        if (ganttContainerRef.current && ganttTasks.length > 0 && isLoaded) {
            ganttContainerRef.current.innerHTML = '';
            const ganttSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            ganttSvg.setAttribute('width', '100%');
            ganttSvg.setAttribute('height', '100%');
            ganttContainerRef.current.appendChild(ganttSvg);

            ganttInstance.current = new Gantt(ganttSvg, ganttTasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Week',
                language: 'pt',
                custom_popup_html: function(task) {
                  return `
                    <div class="p-2 bg-popover text-popover-foreground rounded-md border shadow-md">
                        <div class="font-bold">${task.name}</div>
                        <div>Progresso: ${task.progress}%</div>
                    </div>
                  `;
                }
            });
        }
        
        return () => {
            if (ganttInstance.current) {
                try {
                   ganttInstance.current.destroy();
                } catch (e) {
                   console.error("Erro ao destruir a instância do Gantt:", e);
                }
                ganttInstance.current = null;
            }
        };
    }, [ganttTasks, isLoaded]);

    if (!isLoaded) {
        return <Skeleton className="h-[600px] w-full" />;
    }

    return (
        <>
            <style jsx global>{`
                .gantt .grid-header {
                    fill: hsl(var(--muted));
                }
                .gantt .grid-row:nth-child(even) {
                     fill: hsl(var(--background));
                }
                .gantt .grid-row:nth-child(odd) {
                    fill: hsl(var(--muted) / 0.5);
                }
                .gantt .grid-body .grid-row line {
                    stroke: hsl(var(--border));
                }
                 .gantt .tick {
                    stroke: hsl(var(--border));
                }
                .gantt .bar-label, .gantt .bar-group .bar-label, .gantt .task-name {
                    fill: hsl(var(--foreground));
                }
                .gantt-project-bar .bar {
                    fill: hsl(var(--primary));
                }
                .gantt-project-bar .bar-progress {
                    fill: hsl(var(--primary) / 0.7);
                }
                 .gantt-task-bar .bar {
                    fill: hsl(var(--secondary));
                }
                .gantt-task-bar .bar-progress {
                    fill: hsl(var(--secondary-foreground) / 0.5);
                }
                .gantt-container .popup-wrapper {
                    background: transparent;
                    border: none;
                    box-shadow: none;
                }
            `}</style>
            <Card>
                <CardContent className="p-4">
                     <div ref={ganttContainerRef} className="w-full h-[600px]"></div>
                </CardContent>
            </Card>
        </>
    );
}
