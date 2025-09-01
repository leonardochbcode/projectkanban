'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { GanttChartComponent } from '@/components/gantt/gantt-chart-component';
import { GanttTable } from '@/components/gantt/gantt-table';
import { useState } from 'react';
import { useStore } from '@/hooks/use-store';

function GanttPageContent() {
  const { projects } = useStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects[0]?.id || null);

  return (
    <div className="flex flex-col h-full">
       <div className="p-4 sm:p-8 pb-4 pt-6 border-b">
         <h1 className="text-3xl font-bold tracking-tight font-headline">Gráfico de Gantt</h1>
         <p className="text-muted-foreground">Visão geral da linha do tempo de todos os projetos e tarefas.</p>
       </div>
       <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 sm:p-6 overflow-hidden">
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            <GanttTable 
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
            />
          </div>
          <div className="overflow-y-auto h-[calc(100vh-200px)]">
            <GanttChartComponent selectedProjectId={selectedProjectId} />
          </div>
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
