
import { AppLayout } from '@/components/layout/app-layout';
import { GanttChart } from '@/components/gantt/gantt-chart';

function GanttPageContent() {
    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Cronograma de Projetos (Gantt)</h1>
            </div>
            <GanttChart />
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
