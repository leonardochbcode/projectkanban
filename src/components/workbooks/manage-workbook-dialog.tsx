'use client';

import { useState, type ReactNode, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/hooks/use-store';
import type { Workbook } from '@/lib/types';
import { Textarea } from '../ui/textarea';

interface ManageWorkbookDialogProps {
  children?: ReactNode;
  workbook?: Workbook;
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageWorkbookDialog({ children, workbook, workspaceId, open, onOpenChange }: ManageWorkbookDialogProps) {
  const { addWorkbook, updateWorkbook } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (workbook) {
      setName(workbook.name);
      setDescription(workbook.description);
    } else {
      setName('');
      setDescription('');
    }
  }, [workbook, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, preencha o nome.');
      return;
    }

    const workbookData = {
        name,
        description,
        workspaceId,
    };

    if (workbook) {
      updateWorkbook({
        ...workbook,
        ...workbookData,
      });
    } else {
      addWorkbook(workbookData);
    }

    onOpenChange(false);
  };

  const Trigger = children ? <DialogTrigger asChild>{children}</DialogTrigger> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {Trigger}
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">
              {workbook ? 'Editar Workbook' : 'Adicionar Novo Workbook'}
            </DialogTitle>
            <DialogDescription>
              {workbook
                ? 'Atualize os detalhes do workbook.'
                : 'Preencha os detalhes para adicionar um novo workbook.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{workbook ? 'Salvar Alterações' : 'Adicionar Workbook'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
