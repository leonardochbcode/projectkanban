// Este é um Componente de Servidor, ele pode acessar `params` diretamente.
import { ProjectDetailsPageContent } from '@/components/projects/project-details-page-content';
import { AppLayout } from '@/components/layout/app-layout';

// O componente de página principal agora é um Componente de Servidor simples.
// Ele extrai o `id` e o passa para o componente de cliente que contém a lógica.
export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppLayout>
      <ProjectDetailsPageContent projectId={id} />
    </AppLayout>
  );
}
