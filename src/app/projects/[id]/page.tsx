// Este é um Componente de Servidor, ele pode acessar `params` diretamente.
import { ProjectDetailsPageContent } from '@/components/projects/project-details-page-content';
import { AppLayout } from '@/components/layout/app-layout';

// O componente de página principal agora é um Componente de Servidor simples.
// Ele extrai o `id` e o passa para o componente de cliente que contém a lógica.
export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <AppLayout>
      <ProjectDetailsPageContent projectId={id} />
    </AppLayout>
  );
}
