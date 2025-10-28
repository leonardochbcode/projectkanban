'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useState, useEffect } from 'react';
import type { Workbook } from '@/lib/types';
import { ManageWorkbookDialog } from '@/components/workbooks/manage-workbook-dialog';
import { WorkbooksTable } from '@/components/workbooks/workbooks-table';
import { notFound, useParams } from 'next/navigation';

function WorkbooksPageContent() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const { getWorkbooksByWorkspace, fetchWorkbooksByWorkspace, workspaces } = useStore();
  const [editingWorkbook, setEditingWorkbook] = useState<Workbook | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const workspace = workspaces.find(w => w.id === workspaceId);

  useEffect(() => {
    if (workspaceId) {
      fetchWorkbooksByWorkspace(workspaceId);
    }
  }, [workspaceId, fetchWorkbooksByWorkspace]);

  const workbooks = getWorkbooksByWorkspace(workspaceId);

  if (!workspace) {
    return notFound();
  }

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
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Workbooks: {workspace.name}</h1>
          <p className="text-muted-foreground">{workspace.description}</p>
        </div>
        <div className="flex items-center space-x-2 bg-background">
          <ManageWorkbookDialog workbook={editingWorkbook} open={isDialogOpen} onOpenChange={handleDialogClose} workspaceId={workspaceId}>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Pasta de Trabalho
            </Button>
          </ManageWorkbookDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pasta de Trabalho</CardTitle>
          <CardDescription>Uma visão geral de todos os workbooks neste espaço de trabalho.</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkbooksTable workbooks={workbooks} onEdit={handleEdit} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function WorkspaceWorkbooksPage() {
  return (
    <AppLayout>
      <WorkbooksPageContent />
    </AppLayout>
  );
}
