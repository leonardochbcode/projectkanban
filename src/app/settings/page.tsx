import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function SettingsPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configurações da Conta</CardTitle>
          <CardDescription>
            Gerencie as configurações da sua conta e preferências.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Opções de configuração serão exibidas aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <AppLayout>
            <SettingsPageContent />
        </AppLayout>
    )
}
