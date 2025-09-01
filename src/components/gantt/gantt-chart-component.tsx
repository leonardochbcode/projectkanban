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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // A chave do tooltip não nos diz qual barra foi clicada.
    // O `label` é o nome do projeto (eixo Y).
    // O payload contém múltiplas entradas para a barra empilhada.
    // Precisamos encontrar a entrada de dados correta.
    // No entanto, `recharts` não facilita a identificação do segmento específico.
    // O payload[0] geralmente contém as informações da barra mais relevante.
    const data = payload[0].payload;
    const task = data.originalTask; // `originalTask` deve estar no objeto de dados.

    if (!task) return null;

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
          range: [startDay, startDay + 1], 
          status: task.status,
          originalTask: task,
        };
      });
    });
  }, [projects, tasks]);
  
  const processedData = useMemo(() => {
      const groupedByProject: Record<string, any[]> = {};
      chartData.forEach(item => {
          if (!groupedByProject[item.name]) {
              groupedByProject[item.name] = [];
          }
          groupedByProject[item.name].push(item);
      });
      
      // Transformar para um formato que o BarChart possa usar para empilhamento simulado
      const finalData: any[] = [];
      Object.entries(groupedByProject).forEach(([projectName, projectTasks]) => {
          projectTasks.forEach(task => {
              finalData.push({
                  name: projectName, // Nome do projeto para o eixo Y
                  offset: task.range[0], // Onde a tarefa começa
                  duration: task.range[1] - task.range[0], // Duração (sempre 1)
                  taskName: task.taskName,
                  status: task.status,
                  originalTask: task.originalTask // Anexar a tarefa completa
              });
          });
      });

      return finalData;

  }, [chartData]);


  const handleBarClick = (data: any) => {
    // `data` aqui é o payload do item de dados da barra clicada
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
              <XAxis type="number" dataKey="offset" domain={['dataMin', 'dataMax + 5']} unit="d" />
              <YAxis type="category" dataKey="name" width={150} tick={{ width: 150 }} scale="point" />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
              
              <Bar 
                dataKey="duration" 
                stackId={(d: any) => d.name} // Empilhar por projeto
                layout="vertical"
                onClick={handleBarClick}
                className="cursor-pointer"
              >
                  <LabelList dataKey="taskName" position="insideRight" fill="#fff" fontSize={10} />
                  {processedData.map((entry, entryIndex) => (
                      <Cell 
                        key={`cell-${entryIndex}`} 
                        fill={statusColors[entry.status as keyof typeof statusColors] || '#ccc'}
                      />
                  ))}
              </Bar>

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
