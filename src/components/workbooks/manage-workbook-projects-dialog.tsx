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
import type { Workbook } from '@/lib/types';
import { MultiSelect } from '../ui/multi-select';

interface ManageWorkbookProjectsDialogProps {
  workbook: Workbook;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageWorkbookProjectsDialog({ workbook, open, onOpenChange }: ManageWorkbookProjectsDialogProps) {
  const { getWorkspaceProjects, addProjectToWorkbook, removeProjectFromWorkbook } = useStore();
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const projectsInWorkspace = getWorkspaceProjects(workbook.workspaceId);

  useEffect(() => {
    if (workbook) {
      setSelectedProjectIds(workbook.projectIds);
    }
  }, [workbook]);

  const projectOptions = projectsInWorkspace.map(p => ({
    value: p.id,
    label: p.name,
  }));

  const handleSubmit = async () => {
    const originalProjectIds = new Set(workbook.projectIds);
    const newProjectIds = new Set(selectedProjectIds);

    const projectsToAdd = selectedProjectIds.filter(id => !originalProjectIds.has(id));
    const projectsToRemove = workbook.projectIds.filter(id => !newProjectIds.has(id));

    await Promise.all([
      ...projectsToAdd.map(projectId => addProjectToWorkbook(workbook.id, projectId)),
      ...projectsToRemove.map(projectId => removeProjectFromWorkbook(workbook.id, projectId))
    ]);

    onOpenChange(false);
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
