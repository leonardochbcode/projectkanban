'use client';

import { useStore } from '@/hooks/use-store';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { differenceInDays, parseISO, startOfDay, isBefore } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';
import { useState } from 'react';
import type { Task, Project } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusColors: { [key: string]: string } = {
  'A Fazer': 'hsl(var(--chart-2))',
  'Em Andamento': 'hsl(var(--chart-1))',
  'Concluída': 'hsl(var(--chart-4))',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const task = data.originalTask;

    if (!task) return null;

    return (
      <div className="bg-background border p-2 rounded-md shadow-lg text-sm">
        <p className="font-bold">{task.title}</p>
        <p>Status: {task.status}</p>
        <p>Prazo: {new Date(task.dueDate).toLocaleDateString()}</p>
        <p>Projeto: {data.name}</p>
      </div>
    );
  }
  return null;
};


export function GanttChartComponent({ selectedProjectId }: { selectedProjectId: string | null }) {
  const { projects, getProjectTasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const processedData = useMemo(() => {
    const project = projects.find(p => p.id === selectedProjectId);
    if (!project) return { data: [], domain: [0, 30] };

    const tasks = getProjectTasks(project.id);
    if (tasks.length === 0) return { data: [], domain: [0, 30] };

    const projectStartDate = parseISO(project.startDate);
    const projectEndDate = parseISO(project.endDate);

    let overallStartDate = projectStartDate;
    let overallEndDate = projectEndDate;
    
    tasks.forEach(task => {
        const taskDate = parseISO(task.dueDate);
        if(isBefore(taskDate, overallStartDate)) overallStartDate = taskDate;
    })


    const data = tasks
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime())
      .map(task => {
          const taskDate = parseISO(task.dueDate);
          const offset = differenceInDays(startOfDay(taskDate), startOfDay(overallStartDate));

          return {
              name: task.title, 
              offset: offset,
              duration: 1, 
              taskName: task.title,
              status: task.status,
              originalTask: task
          };
      });

      const maxOffset = differenceInDays(startOfDay(overallEndDate), startOfDay(overallStartDate)) + 5;
      const domain = [0, maxOffset];

    return { data, domain };
  }, [selectedProjectId, projects, getProjectTasks]);


  const handleBarClick = (data: any) => {
    if(data && data.originalTask) {
        setSelectedTask(data.originalTask);
        setIsSheetOpen(true);
    }
  };

  const onSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    if (!isOpen) {
      setSelectedTask(undefined);
    }
  };

  if (!selectedProjectId) {
    return (
        <Card className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Selecione um projeto para ver o gráfico de Gantt.</p>
        </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Linha do Tempo das Tarefas</CardTitle>
        </CardHeader>
        <CardContent className="h-[90%] pr-4">
          <ResponsiveContainer width="100%" height="100%">
            {processedData.data.length > 0 ? (
                <BarChart
                    data={processedData.data}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 100, bottom: 5 }}
                    barCategoryGap="40%"
                >
                <XAxis type="number" dataKey="offset" domain={processedData.domain} unit=" dias" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, width: 120 }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
                
                <Bar 
                    dataKey="duration" 
                    stackId="a"
                    layout="vertical"
                    onClick={handleBarClick}
                    className="cursor-pointer"
                    minPointSize={10}
                >
                    {processedData.data.map((entry, entryIndex) => (
                        <Cell 
                            key={`cell-${entryIndex}`} 
                            fill={statusColors[entry.status as keyof typeof statusColors] || '#ccc'}
                        />
                    ))}
                </Bar>

                </BarChart>
            ) : (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Nenhuma tarefa para exibir neste projeto.</p>
                </div>
            )}
          </ResponsiveContainer>
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
