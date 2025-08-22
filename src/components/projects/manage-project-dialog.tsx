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
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/hooks/use-store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Project } from '@/lib/types';

interface ManageProjectDialogProps {
  children?: ReactNode; // Tornando children opcional
  project?: Project;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  workspaceId?: string; // Tornando opcional, já que agora podemos editar de qualquer lugar
}

export function ManageProjectDialog({ children, project, open: openProp, onOpenChange: onOpenChangeProp, workspaceId: initialWorkspaceId }: ManageProjectDialogProps) {
  // Internal state for when the component is not controlled
  const [internalOpen, setInternalOpen] = useState(false);

  // Determine if the dialog is controlled or not
  const isControlled = openProp !== undefined && onOpenChangeProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? onOpenChangeProp! : setInternalOpen;

  const { addProject, updateProject, projectTemplates, workspaces, clients, participants } = useStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Project['status']>('Planejamento');
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const [clientId, setClientId] = useState<string | undefined>();
  const [pmoId, setPmoId] = useState<string | undefined>();


  useEffect(() => {
    // Populate form when dialog opens for an existing project
    if (project && open) {
        setName(project.name);
        setDescription(project.description);
        setStartDate(project.startDate);
        setEndDate(project.endDate);
        setStatus(project.status);
        setWorkspaceId(project.workspaceId);
        setClientId(project.clientId);
        setPmoId(project.pmoId);
        setTemplateId(undefined); // Don't show template when editing
    } else if (!project && open) {
        // Reset form for "Add New" mode when dialog opens
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setStatus('Planejamento');
        setWorkspaceId(initialWorkspaceId);
        setClientId(undefined);
        setPmoId(undefined);
        setTemplateId(undefined);
    }
  }, [project, open, initialWorkspaceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate || !workspaceId) {
      alert('Por favor, preencha todos os campos obrigatórios, incluindo o espaço de trabalho.');
      return;
    }
    
    const projectData = {
        name,
        description,
        startDate,
        endDate,
        status,
        workspaceId,
        clientId,
        pmoId
    }

    if (project) {
        updateProject({ ...project, ...projectData });
    } else {
        addProject(projectData, templateId);
    }

    setOpen(false);
  };
  
  const Trigger = children ? <DialogTrigger asChild>{children}</DialogTrigger> : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {Trigger}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">{project ? 'Editar Projeto' : 'Criar Novo Projeto'}</DialogTitle>
            <DialogDescription>
              {project ? 'Atualize os detalhes do projeto.' : 'Preencha os detalhes abaixo para criar um novo projeto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!project && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template" className="text-right">
                  Template
                </Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Começar do zero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Começar do zero</SelectItem>
                    {projectTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="workspace" className="text-right">
                  Espaço
                </Label>
                <Select value={workspaceId} onValueChange={setWorkspaceId} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um espaço" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pmo" className="text-right">
                    Resp. Técnico
                </Label>
                <Select value={pmoId} onValueChange={(v) => setPmoId(v === 'none' ? undefined : v)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Nenhum responsável" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start-date" className="text-right">
                Data de Início
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end-date" className="text-right">
                Data de Término
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(
                  value: 'Planejamento' | 'Em Andamento' | 'Pausado' | 'Concluído'
                ) => setStatus(value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planejamento">Planejamento</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Pausado">Pausado</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
             <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">{project ? 'Salvar Alterações' : 'Criar Projeto'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
