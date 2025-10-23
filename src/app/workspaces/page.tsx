
'use client';
import { PlusCircle, Edit, Archive, Briefcase, FileText, CheckCircle, Share2, ArchiveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/hooks/use-store';
import { useSession } from 'next-auth/react';
import { ShareWorkspaceDialog } from '@/components/workspaces/share-workspace-dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AppLayout } from '@/components/layout/app-layout';
import { useMemo, useState } from 'react';
import type { Workspace } from '@/lib/types';
import { ManageWorkspaceDialog } from '@/components/workspaces/manage-workspace-dialog';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 5;

function WorkspacesPageContent() {
    const { workspaces, archiveWorkspace, getClient, getWorkspaceProjects, updateWorkspaceInStore } = useStore();
    const { data: session } = useSession();
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [filters, setFilters] = useState({ name: '', client: '', responsibility: 'all' });
    const [ownedCurrentPage, setOwnedCurrentPage] = useState(1);
    const [participatingCurrentPage, setParticipatingCurrentPage] = useState(1);

    const handleEdit = (workspace: Workspace) => {
        setEditingWorkspace(workspace);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingWorkspace(undefined);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        if (!open) {
            setEditingWorkspace(undefined);
        }
        setIsDialogOpen(open);
    }

    const handleParticipantsUpdate = (updatedWorkspace: Workspace) => {
        updateWorkspaceInStore(updatedWorkspace);
    };

    const filteredWorkspaces = useMemo(() => {
        const activeWorkspaces = workspaces.filter(ws => ws.status === 'Ativo' || ws.status === undefined);

        return activeWorkspaces.filter(workspace => {
            const { name, client: clientFilter, responsibility } = filters;
            const client = workspace.clientId ? getClient(workspace.clientId) : null;

            const nameMatch = workspace.name.toLowerCase().includes(name.toLowerCase());
            const clientMatch = (client?.name || '').toLowerCase().includes(clientFilter.toLowerCase());

            if (responsibility === 'all') {
                return nameMatch && clientMatch;
            }
            if (responsibility === 'owner') {
                return nameMatch && clientMatch && workspace.isOwner;
            }
            if (responsibility === 'participant') {
                return nameMatch && clientMatch && !workspace.isOwner;
            }
            return false;
        });
    }, [workspaces, filters, getClient]);

    const { allOwnedWorkspaces, allParticipatingWorkspaces } = useMemo(() => {
        const owned = filteredWorkspaces.filter(ws => ws.isOwner);
        const participating = filteredWorkspaces.filter(ws => !ws.isOwner);
        return { allOwnedWorkspaces: owned, allParticipatingWorkspaces: participating };
    }, [filteredWorkspaces]);

    const ownedTotalPages = Math.ceil(allOwnedWorkspaces.length / ITEMS_PER_PAGE);
    const participatingTotalPages = Math.ceil(allParticipatingWorkspaces.length / ITEMS_PER_PAGE);

    const paginatedOwnedWorkspaces = useMemo(() => {
        const startIndex = (ownedCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return allOwnedWorkspaces.slice(startIndex, endIndex);
    }, [allOwnedWorkspaces, ownedCurrentPage]);

    const paginatedParticipatingWorkspaces = useMemo(() => {
        const startIndex = (participatingCurrentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return allParticipatingWorkspaces.slice(startIndex, endIndex);
    }, [allParticipatingWorkspaces, participatingCurrentPage]);

    const handleOwnedPageChange = (page: number) => {
        if (page >= 1 && page <= ownedTotalPages) {
            setOwnedCurrentPage(page);
        }
    };

    const handleParticipatingPageChange = (page: number) => {
        if (page >= 1 && page <= participatingTotalPages) {
            setParticipatingCurrentPage(page);
        }
    };

    const renderWorkspaceGrid = (workspacesToRender: Workspace[]) => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {workspacesToRender.map((workspace) => {
                const client = workspace.clientId ? getClient(workspace.clientId) : null;
                const projects = getWorkspaceProjects(workspace.id);
                const projectCount = projects.length;
                const completedProjects = projects.filter(p => p.status === 'Concluído').length;
                const progress = projectCount > 0 ? (completedProjects / projectCount) * 100 : 0;
                const isOwner = session?.user?.id === workspace.responsibleId;

                return (
                    <Card key={workspace.id} className="flex flex-col">
                        <CardHeader className="relative pt-8">
                            <div className="absolute top-1 right-1 flex items-center gap-1">
                                {isOwner && (
                                    <ShareWorkspaceDialog workspace={workspace} onParticipantsUpdate={handleParticipantsUpdate}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </ShareWorkspaceDialog>
                                )}
                                {isOwner && (
                                    <>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(workspace)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Archive className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Arquivar Espaço de Trabalho?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta ação irá arquivar o espaço de trabalho. Você poderá visualizá-lo e restaurá-lo na página de arquivados.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => archiveWorkspace(workspace.id)}>
                                                        Arquivar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <div className='mb-1 mt-2'>
                                    <CardTitle className="font-headline mb-3">{workspace.name}</CardTitle>
                                    <CardDescription>{workspace.description}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            {client && (
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    <span>Cliente: {client.name}</span>
                                </div>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground gap-2">
                                <FileText className="h-4 w-4" />
                                <span>{projectCount} {projectCount === 1 ? 'projeto' : 'projetos'}</span>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-muted-foreground">Progresso</span>
                                    <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>{completedProjects} de {projectCount} projetos concluídos</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 pt-0">
                            <Link href={`/workspaces/${workspace.id}/`} passHref>
                                <Button className="w-full">
                                    Abrir Espaço
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )
            })}
        </div>
    );

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-2xl font-bold tracking-tight font-headline">Espaços de Trabalho</h1>
                <div className="flex items-center space-x-2">
                    <Link href="/workspaces/archived" passHref>
                        <Button variant="outline">
                            <ArchiveIcon className="mr-2 h-4 w-4" />
                            Arquivados
                        </Button>
                    </Link>
                    <ManageWorkspaceDialog
                        workspace={editingWorkspace}
                        open={isDialogOpen}
                        onOpenChange={handleDialogClose}
                    >
                        <Button onClick={handleAdd}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Espaço
                        </Button>
                    </ManageWorkspaceDialog>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className='text-base'>Filtros</CardTitle>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                        <Input
                            placeholder="Filtrar por nome..."
                            value={filters.name}
                            onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full"
                        />
                        <Input
                            placeholder="Filtrar por cliente..."
                            value={filters.client}
                            onChange={e => setFilters(prev => ({ ...prev, client: e.target.value }))}
                            className="w-full"
                        />
                        <Select
                            value={filters.responsibility}
                            onValueChange={value => setFilters(prev => ({ ...prev, responsibility: value }))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filtrar por responsabilidade..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="owner">Responsável</SelectItem>
                                <SelectItem value="participant">Participação</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
            </Card>

            {(filters.responsibility === 'all' || filters.responsibility === 'owner') && allOwnedWorkspaces.length > 0 && (
                <div className="space-y-4 mt-6">
                    <h2 className="text-lg font-bold tracking-tight">Espaços que sou o responsável...</h2>
                    {renderWorkspaceGrid(paginatedOwnedWorkspaces)}
                    {ownedTotalPages > 1 && (
                        <Pagination
                            currentPage={ownedCurrentPage}
                            totalPages={ownedTotalPages}
                            onPageChange={handleOwnedPageChange}
                        />
                    )}
                </div>
            )}

            {(filters.responsibility === 'all' || filters.responsibility === 'participant') && allParticipatingWorkspaces.length > 0 && (
                <div className="space-y-4 mt-8">
                    <h2 className="text-lg font-bold tracking-tight">Espaços que eu participo...</h2>
                    {renderWorkspaceGrid(paginatedParticipatingWorkspaces)}
                    {participatingTotalPages > 1 && (
                        <Pagination
                            currentPage={participatingCurrentPage}
                            totalPages={participatingTotalPages}
                            onPageChange={handleParticipatingPageChange}
                        />
                    )}
                </div>
            )}

            {filteredWorkspaces.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Nenhum espaço de trabalho encontrado.</p>
                </div>
            )}
        </div>
    );
}

export default function WorkspacesPage() {
    return (
        <AppLayout>
            <WorkspacesPageContent />
        </AppLayout>
    )
}
