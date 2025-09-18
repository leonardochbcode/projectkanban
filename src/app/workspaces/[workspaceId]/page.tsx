'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useState, useEffect, useMemo } from 'react';
import type { Workbook, Project } from '@/lib/types';
import { ManageWorkbookDialog } from '@/components/workbooks/manage-workbook-dialog';
import { WorkbooksTable } from '@/components/workbooks/workbooks-table';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import { ProjectsTable } from '@/components/projects/projects-table';
import { ManageTemplates } from '@/components/projects/manage-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notFound, useParams } from 'next/navigation';

function WorkbooksTab({ workspaceId }: { workspaceId: string }) {
    const { getWorkbooksByWorkspace, fetchWorkbooksByWorkspace } = useStore();
    const [editingWorkbook, setEditingWorkbook] = useState<Workbook | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (workspaceId) {
            fetchWorkbooksByWorkspace(workspaceId);
        }
    }, [workspaceId, fetchWorkbooksByWorkspace]);

    const workbooks = getWorkbooksByWorkspace(workspaceId);

    const handleAdd = () => {
        setEditingWorkbook(undefined);
        setIsDialogOpen(true);
    }

    const handleEdit = (workbook: Workbook) => {
        setEditingWorkbook(workbook);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingWorkbook(undefined);
        }
        setIsDialogOpen(open);
    };

    return (
        <>
            <div className="flex items-center justify-end space-y-2 py-4">
                <ManageWorkbookDialog workbook={editingWorkbook} open={isDialogOpen} onOpenChange={handleDialogClose} workspaceId={workspaceId}>
                    <Button onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Workbook
                    </Button>
                </ManageWorkbookDialog>
            </div>
            <WorkbooksTable workbooks={workbooks} onEdit={handleEdit} />
        </>
    );
}

function ProjectsTab({ workspaceId }: { workspaceId: string }) {
    const { getWorkspaceProjects } = useStore();
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const projects = getWorkspaceProjects(workspaceId);

    const handleAdd = () => {
        setEditingProject(undefined);
        setIsDialogOpen(true);
    }

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingProject(undefined);
        }
        setIsDialogOpen(open);
    };

    return (
        <>
            <div className="flex items-center justify-end space-y-2 py-4">
                <ManageProjectDialog project={editingProject} open={isDialogOpen} onOpenChange={handleDialogClose} workspaceId={workspaceId}>
                    <Button onClick={handleAdd}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Projeto
                    </Button>
                </ManageProjectDialog>
            </div>
            <ProjectsTable projects={projects} onEdit={handleEdit} />
        </>
    );
}


function WorkspacePageContent() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const { workspaces } = useStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) {
      return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{workspace.name}</h1>
            <p className="text-muted-foreground">{workspace.description}</p>
        </div>
      </div>
      <Tabs defaultValue="workbooks">
        <TabsList>
            <TabsTrigger value="workbooks">Workbooks</TabsTrigger>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="workbooks">
            <WorkbooksTab workspaceId={workspaceId} />
        </TabsContent>
        <TabsContent value="projects">
            <ProjectsTab workspaceId={workspaceId} />
        </TabsContent>
        <TabsContent value="templates">
            <ManageTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <AppLayout>
      <WorkspacePageContent />
    </AppLayout>
  );
}
