'use client';
import { useStore } from '@/hooks/use-store';
import { Skeleton } from '../ui/skeleton';

export function CompanyHeaderInfo() {
  const { clients, currentUser, isLoaded } = useStore();

  // For demonstration, we'll use the first client and the current user.
  // In a real app, this might come from a different context or global state.
  const companyClient = clients.length > 0 ? clients[0] : null;

  if (!isLoaded || !currentUser || !companyClient) {
    return (
        <div className="flex-1 text-sm text-foreground">
            <Skeleton className="h-5 w-64 mb-1.5" />
            <Skeleton className="h-4 w-80 mb-1.5" />
            <Skeleton className="h-4 w-32" />
        </div>
    );
  }

  const userName = currentUser.name.split(' ')[0].toUpperCase();
  const appVersion = '202506'; // Static version for now

  return (
    <div className="flex-1 text-sm text-foreground">
      <p className="font-semibold text-base">{companyClient.suportewebCode} - {companyClient.company}</p>
      <p className="text-xs text-muted-foreground">
        {userName} | {companyClient.company} | {companyClient.cnpj} | Versão: {appVersion}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Recentes: Início
      </p>
    </div>
  );
}
