import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ReportsPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Relatórios</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Análises e Relatórios</CardTitle>
          <CardDescription>
            Recursos detalhados de análise e relatórios em breve.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">As visualizações dos relatórios serão exibidas aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
    return (
        <AppLayout>
            <ReportsPageContent />
        </AppLayout>
    )
}
