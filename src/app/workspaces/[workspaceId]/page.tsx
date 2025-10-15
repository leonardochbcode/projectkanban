'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useState, useEffect, useMemo } from 'react';
import type { Workbook, Project, Workspace } from '@/lib/types';
import { ManageWorkbookDialog } from '@/components/workbooks/manage-workbook-dialog';
import { WorkbooksTable } from '@/components/workbooks/workbooks-table';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import { ProjectsTable } from '@/components/projects/projects-table';
import { ManageTemplates } from '@/components/projects/manage-templates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notFound, useParams } from 'next/navigation';

function ActivitiesTab({ workspaceId }: { workspaceId: string }) {
    const { getWorkbooksByWorkspace, fetchWorkbooksByWorkspace, getWorkspaceProjects, projects: allProjects } = useStore();
    const { data: session } = useSession();
    const [editingWorkbook, setEditingWorkbook] = useState<Workbook | undefined>(undefined);
    const [isWorkbookDialogOpen, setIsWorkbookDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

    useEffect(() => {
        if (workspaceId) {
            fetchWorkbooksByWorkspace(workspaceId);
        }
    }, [workspaceId, fetchWorkbooksByWorkspace]);

    const handleAddWorkbook = () => {
        setEditingWorkbook(undefined);
        setIsWorkbookDialogOpen(true);
    }

    const handleEditWorkbook = (workbook: Workbook) => {
        setEditingWorkbook(workbook);
        setIsWorkbookDialogOpen(true);
    };

    const handleWorkbookDialogClose = (open: boolean) => {
        if (!open) {
            setEditingWorkbook(undefined);
        }
        setIsWorkbookDialogOpen(open);
    };

    const handleAddProject = () => {
        setEditingProject(undefined);
        setIsProjectDialogOpen(true);
    }

    const handleProjectDialogClose = (open: boolean) => {
        if (!open) {
            setEditingProject(undefined);
        }
        setIsProjectDialogOpen(open);
    };

    const { workbooksToDisplay, handleEditProject } = useMemo(() => {
        const workbooks = getWorkbooksByWorkspace(workspaceId);
        const projects = getWorkspaceProjects(workspaceId);
        const assignedProjectIds = new Set(workbooks.flatMap(wb => wb.projectIds));
        const unassignedProjects = projects.filter(p => !assignedProjectIds.has(p.id));

        let allWorkbooks = [...workbooks];

        if (unassignedProjects.length > 0) {
            const unassignedWorkbook: Workbook = {
                id: 'unassigned-projects',
                name: 'Projetos sem Pasta',
                description: 'Projetos que não estão vinculados a nenhuma pasta de trabalho.',
                projectIds: unassignedProjects.map(p => p.id),
                workspaceId: workspaceId,
                isUnassigned: true,
            };
            allWorkbooks.push(unassignedWorkbook);
        }

        const handleEditProject = (project: Project) => {
            setEditingProject(project);
            setIsProjectDialogOpen(true);
        };

        return { workbooksToDisplay: allWorkbooks, handleEditProject };
    }, [workspaceId, getWorkbooksByWorkspace, getWorkspaceProjects]);

    return (
        <>
            {session?.user?.userType !== 'Convidado' && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <ManageWorkbookDialog workbook={editingWorkbook} open={isWorkbookDialogOpen} onOpenChange={handleWorkbookDialogClose} workspaceId={workspaceId}>
                        <Button onClick={handleAddWorkbook}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar Pasta de Trabalho
                        </Button>
                    </ManageWorkbookDialog>
                    <ManageProjectDialog project={editingProject} open={isProjectDialogOpen} onOpenChange={handleProjectDialogClose} workspaceId={workspaceId}>
                        <Button onClick={handleAddProject}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Criar Projeto
                        </Button>
                    </ManageProjectDialog>
                </div>
            )}
            {workbooksToDisplay.length > 0 && (
                <WorkbooksTable workbooks={workbooksToDisplay} onEdit={handleEditWorkbook} onEditProject={handleEditProject} />
            )}
        </>
    );
}


import { Share2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ShareWorkspaceDialog } from '@/components/workspaces/share-workspace-dialog';

function WorkspacePageContent() {
    const { workspaceId } = useParams() as { workspaceId: string };
    const { workspaces, updateWorkspaceInStore } = useStore();
    const { data: session } = useSession();

    // Use local state to manage the workspace object, allowing for dynamic updates
    const [workspace, setWorkspace] = useState(() => workspaces.find(w => w.id === workspaceId));
    const { isLoaded } = useStore();

    useEffect(() => {
        const foundWorkspace = workspaces.find(w => w.id === workspaceId);
        setWorkspace(foundWorkspace);
    }, [workspaceId, workspaces]);

    if (!isLoaded) {
        return (
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Carregando...</h1>
            </div>
        );
    }

    if (!workspace) {
        // After data is loaded, if workspace is still not found, show 404.
        return notFound();
    }

    const isOwner = session?.user?.id === workspace.responsibleId;

    const handleParticipantsUpdate = (updatedWorkspace: Workspace) => {
        setWorkspace(updatedWorkspace); // Update local state
        updateWorkspaceInStore(updatedWorkspace); // Update global store
    };

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">{workspace.name}</h1>
                    <p className="text-muted-foreground">{workspace.description}</p>
                </div>
                {isOwner && (
                    <ShareWorkspaceDialog workspace={workspace} onParticipantsUpdate={handleParticipantsUpdate}>
                        <Button>
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartilhar
                        </Button>
                    </ShareWorkspaceDialog>
                )}
            </div>
            <Tabs defaultValue="activities">
                <TabsList>
                    <TabsTrigger value="activities">Atividades</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="activities">
                    <ActivitiesTab workspaceId={workspaceId} />
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
