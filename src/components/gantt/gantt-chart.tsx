
'use client';
import { useStore } from '@/hooks/use-store';
import React, { useEffect, useRef, useMemo } from 'react';
import Gantt from 'frappe-gantt';
import { Skeleton } from '../ui/skeleton';
import { Card, CardContent } from '../ui/card';

export function GanttChart() {
    const { projects, getProjectTasks, isLoaded } = useStore();
    const ganttRef = useRef<SVGSVGElement | null>(null);
    const ganttInstance = useRef<Gantt | null>(null);

    const ganttTasks = useMemo(() => {
        const formattedTasks: any[] = [];
        
        projects.forEach(project => {
            const projectTasks = getProjectTasks(project.id);
            const totalTasks = projectTasks.length;
            const completedTasks = projectTasks.filter(t => t.status === 'Concluída').length;
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            
            // Adiciona o projeto como uma tarefa "pai"
            formattedTasks.push({
                id: project.id,
                name: project.name,
                start: project.startDate,
                end: project.endDate,
                progress: progress,
                custom_class: 'gantt-project-bar' // Classe para estilização
            });

            // Adiciona as tarefas reais do projeto
            projectTasks.forEach(task => {
                formattedTasks.push({
                    id: task.id,
                    name: task.title,
                    start: task.dueDate, // Gantt precisa de início e fim, vamos simplificar
                    end: task.dueDate,
                    progress: task.status === 'Concluída' ? 100 : 0,
                    dependencies: project.id, // Vincula a tarefa ao projeto
                    custom_class: 'gantt-task-bar'
                });
            });
        });
        
        return formattedTasks;
    }, [projects, getProjectTasks]);

    useEffect(() => {
        if (ganttRef.current && ganttTasks.length > 0 && isLoaded) {
            // Limpa a instância anterior para evitar renderizações múltiplas
            if (ganttInstance.current) {
                ganttInstance.current.destroy();
            }
            ganttRef.current.innerHTML = '';

            ganttInstance.current = new Gantt(ganttRef.current, ganttTasks, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Week',
                date_format: 'YYYY-MM-DD',
                language: 'pt', // Assuming this is supported or for custom setup
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

        // Cleanup on unmount
        return () => {
            if (ganttInstance.current) {
                ganttInstance.current.destroy();
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
                     <svg ref={ganttRef} className="w-full h-[600px]"></svg>
                </CardContent>
            </Card>
        </>
    );
}
