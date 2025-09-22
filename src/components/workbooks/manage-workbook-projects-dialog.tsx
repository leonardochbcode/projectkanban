'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useStore } from '@/hooks/use-store';
import { useToast } from '@/hooks/use-toast';
import type { Workbook } from '@/lib/types';
import { MultiSelect } from '../ui/multi-select';

interface ManageWorkbookProjectsDialogProps {
  workbook: Workbook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageWorkbookProjectsDialog({ workbook, open, onOpenChange }: ManageWorkbookProjectsDialogProps) {
  const { getWorkspaceProjects, updateWorkbookProjects } = useStore();
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const { toast } = useToast();

  const projectsInWorkspace = getWorkspaceProjects(workbook.workspaceId);

  useEffect(() => {
    if (workbook) {
      setSelectedProjectIds(workbook.projectIds || []);
    }
  }, [workbook]);

  const projectOptions = projectsInWorkspace.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const handleSubmit = async () => {
    try {
      const originalProjectIds = new Set(workbook.projectIds || []);
      const newProjectIds = new Set(selectedProjectIds);

      const projectsToAdd = selectedProjectIds.filter(id => !originalProjectIds.has(id));
      const projectsToRemove = (workbook.projectIds || []).filter(id => !newProjectIds.has(id));

      if (projectsToAdd.length === 0 && projectsToRemove.length === 0) {
        onOpenChange(false); // Close dialog if no changes were made
        return;
      }

      await updateWorkbookProjects(workbook.id, projectsToAdd, projectsToRemove);

      toast({
        title: "Projetos do Workbook Atualizados",
        description: "As alterações nos projetos foram salvas com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update workbook projects:", error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível salvar as alterações nos projetos do workbook.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">
            Gerenciar Projetos em &quot;{workbook.name}&quot;
          </DialogTitle>
          <DialogDescription>
            Selecione os projetos que devem fazer parte deste workbook.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <MultiSelect
            options={projectOptions}
            value={selectedProjectIds}
            onValueChange={setSelectedProjectIds}
            placeholder="Selecione os projetos..."
            maxCount={100} // A large number to allow many projects
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleSubmit}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
