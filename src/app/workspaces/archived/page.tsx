'use client';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Undo } from 'lucide-react';
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
import { useMemo, useState, useEffect } from 'react';
import type { Workspace } from '@/lib/types';
import Link from 'next/link';
import { Pagination } from '@/components/ui/pagination';
import { useSession } from 'next-auth/react';

const ITEMS_PER_PAGE = 10;

function ArchivedWorkspacesContent() {
    const { data: session } = useSession();
    const [archivedWorkspaces, setArchivedWorkspaces] = useState<Workspace[]>([]);
    const [totalWorkspaces, setTotalWorkspaces] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const fetchArchivedWorkspaces = async (page: number) => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch(`/api/workspaces/archived?page=${page}&limit=${ITEMS_PER_PAGE}`);
            if (!response.ok) throw new Error('Failed to fetch archived workspaces');
            const { workspaces, total } = await response.json();
            setArchivedWorkspaces(workspaces);
            setTotalWorkspaces(total);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (session?.user?.id) {
            fetchArchivedWorkspaces(currentPage);
        }
    }, [session, currentPage]);

    const handleRestore = async (workspaceId: string) => {
        try {
            await fetch(`/api/workspaces/${workspaceId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Ativo' }),
            });
            // Refetch the current page to update the list
            fetchArchivedWorkspaces(currentPage);
        } catch (error) {
            console.error("Failed to restore workspace:", error);
        }
    };

    const handleDelete = async (workspaceId: string) => {
        try {
            await fetch(`/api/workspaces/${workspaceId}?permanent=true`, {
                method: 'DELETE',
            });
            // Refetch the current page to update the list
            fetchArchivedWorkspaces(currentPage);
        } catch (error) {
            console.error("Failed to permanently delete workspace:", error);
        }
    };

    const totalPages = Math.ceil(totalWorkspaces / ITEMS_PER_PAGE);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Espaços de Trabalho Arquivados</h1>
                <Link href="/workspaces" passHref>
                    <Button variant="outline">Voltar</Button>
                </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {archivedWorkspaces.map((workspace) => (
                    <Card key={workspace.id}>
                        <CardHeader>
                            <CardTitle>{workspace.name}</CardTitle>
                            <CardDescription>{workspace.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleRestore(workspace.id)}>
                                <Undo className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir Permanentemente?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta ação não pode ser desfeita e excluirá permanentemente o espaço de trabalho.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(workspace.id)}>
                                            Excluir
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardContent>
                    </Card>
                ))}
            </div>
             {archivedWorkspaces.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Nenhum espaço de trabalho arquivado.</p>
                </div>
            )}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}


export default function ArchivedWorkspacesPage() {
    return (
        <AppLayout>
            <ArchivedWorkspacesContent />
        </AppLayout>
    );
}