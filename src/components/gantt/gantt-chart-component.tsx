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
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';
import { useState } from 'react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusColors: { [key: string]: string } = {
  'A Fazer': 'hsl(var(--chart-2))',
  'Em Andamento': 'hsl(var(--chart-1))',
  'Concluída': 'hsl(var(--chart-4))',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const task = data.originalTask;
    return (
      <div className="bg-background border p-2 rounded-md shadow-lg text-sm">
        <p className="font-bold">{task.title}</p>
        <p>Status: {task.status}</p>
        <p>Prazo: {new Date(task.dueDate).toLocaleDateString()}</p>
        <p>Projeto: {data.projectName}</p>
      </div>
    );
  }
  return null;
};


export function GanttChartComponent() {
  const { projects, tasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const chartData = useMemo(() => {
    const today = startOfDay(new Date());

    return projects.flatMap((project) => {
      const projectTasks = tasks.filter((t) => t.projectId === project.id);
      if (projectTasks.length === 0) return [];
      
      const projectStartDate = parseISO(project.startDate);

      return projectTasks.map((task) => {
        const taskDueDate = parseISO(task.dueDate);
        const startDay = differenceInDays(taskDueDate, projectStartDate);
        
        return {
          name: project.name,
          taskName: task.title,
          projectName: project.name,
          range: [startDay, startDay + 1], // Gantt usually has a start and end, we'll represent it as a 1 day block
          status: task.status,
          originalTask: task,
        };
      });
    });
  }, [projects, tasks]);
  
  const processedData = useMemo(() => {
      const groupedData: Record<string, any[]> = {};
      chartData.forEach(item => {
          if (!groupedData[item.name]) {
              groupedData[item.name] = [];
          }
          groupedData[item.name].push(item);
      });
      
      return Object.entries(groupedData).map(([projectName, tasks]) => {
          const entry: any = { name: projectName };
          tasks.forEach((task, index) => {
              entry[`offset_${index}`] = task.range[0];
              entry[`duration_${index}`] = task.range[1] - task.range[0];
              entry[`status_${index}`] = task.status;
              entry[`taskName_${index}`] = task.taskName;
              entry[`originalTask_${index}`] = task.originalTask;
          });
          return entry;
      })

  }, [chartData])

  const handleBarClick = (data: any, index: number) => {
    // This is tricky because recharts doesn't directly support clicking on stacked bar segments
    // We try to find the clicked task based on the payload.
    if(data && data.payload && data.payload.originalTask_0) {
        // This is a simplification and might not work for stacked bars correctly.
        // It will open the first task of the project. A more complex solution would be needed
        // to identify which segment of the stacked bar was clicked.
        setSelectedTask(data.payload.originalTask_0);
        setIsSheetOpen(true);
    }
  };

  const onSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    if (!isOpen) {
      setSelectedTask(undefined);
    }
  };


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="h-[75vh] pr-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              barCategoryGap="30%"
            >
              <XAxis type="number" domain={['dataMin', 'dataMax + 5']} unit="d" />
              <YAxis type="category" dataKey="name" width={150} tick={{ width: 150 }} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
              
              {/* This is a trick to render multiple bars for tasks */}
              {processedData.length > 0 && Object.keys(processedData[0]).filter(k => k.startsWith('duration_')).map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={`duration_${index}`} 
                    stackId="a" 
                    layout="vertical"
                    onClick={handleBarClick}
                    className="cursor-pointer"
                  >
                     <LabelList dataKey={`taskName_${index}`} position="insideRight" fill="#fff" fontSize={10} />
                     {processedData.map((entry, entryIndex) => (
                          <Cell 
                            key={`cell-${entryIndex}`} 
                            fill={statusColors[entry[`status_${index}`] as keyof typeof statusColors] || '#ccc'}
                          />
                      ))}
                  </Bar>
              ))}

            </BarChart>
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
