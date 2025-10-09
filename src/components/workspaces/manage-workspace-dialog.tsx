
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
import type { Workspace } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ManageWorkspaceDialogProps {
  children?: ReactNode;
  workspace?: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageWorkspaceDialog({ children, workspace, open, onOpenChange }: ManageWorkspaceDialogProps) {
  const { addWorkspace, updateWorkspace, clients, currentUser } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState<string | undefined>();

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setDescription(workspace.description);
      setClientId(workspace.clientId);
    } else {
      setName('');
      setDescription('');
      setClientId(undefined);
    }
  }, [workspace, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, preencha o nome.');
      return;
    }

    if (workspace) {
        const workspaceData = {
            name,
            description,
            clientId,
        };
      updateWorkspace({
        ...workspace,
        ...workspaceData,
      });
    } else {
        if (!currentUser) {
            alert('Você precisa estar logado para criar um espaço de trabalho.');
            return;
        }
        const workspaceData = {
            name,
            description,
            clientId,
            responsibleId: currentUser.id,
            participantIds: [],
            status: 'Ativo' as const,
        };
      addWorkspace(workspaceData);
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
              {workspace ? 'Editar Espaço' : 'Adicionar Novo Espaço'}
            </DialogTitle>
            <DialogDescription>
              {workspace
                ? 'Atualize os detalhes do espaço de trabalho.'
                : 'Preencha os detalhes para adicionar um novo espaço.'}
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
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Cliente
              </Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v === 'none' ? undefined : v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Nenhum cliente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{workspace ? 'Salvar Alterações' : 'Adicionar Espaço'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
