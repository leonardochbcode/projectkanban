
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
import type { Project, Workbook } from '@/lib/types';
import { MultiSelect } from '../ui/multi-select';
import { format, parseISO } from 'date-fns';

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

  const { addProject, updateProject, projectTemplates, workspaces, clients, participants, currentUser, getWorkbooksByWorkspace } = useStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<Project['status']>('Planejamento');
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const [clientId, setClientId] = useState<string | undefined>();
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [pmoId, setPmoId] = useState<string | undefined>();
  const [workbookIds, setWorkbookIds] = useState<string[]>([]);

  const workbooksForSelectedWorkspace = workspaceId ? getWorkbooksByWorkspace(workspaceId).map((w: Workbook) => ({ label: w.name, value: w.id })) : [];


  useEffect(() => {
    // Populate form when dialog opens for an existing project
    if (project && open) {
        setName(project.name);
        setDescription(project.description);
        setStartDate(project.startDate ? format(parseISO(project.startDate), 'yyyy-MM-dd') : '');
        setEndDate(project.endDate ? format(parseISO(project.endDate), 'yyyy-MM-dd') : '');
        setStatus(project.status);
        setWorkspaceId(project.workspaceId);
        setClientId(project.clientId);
        setParticipantIds(project.participantIds || []);
        setPmoId(project.pmoId);
        setTemplateId(undefined); // Don't show template when editing
        setWorkbookIds(project.workbookIds || []);
    } else if (!project && open) {
        // Reset form for "Add New" mode when dialog opens
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setStatus('Planejamento');
        setWorkspaceId(initialWorkspaceId);
        setClientId(undefined);
        setParticipantIds(currentUser ? [currentUser.id] : []);
        setPmoId(currentUser?.id);
        setTemplateId(undefined);
        setWorkbookIds([]);
    }
  }, [project, open, initialWorkspaceId, currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        participantIds,
        pmoId,
    };

    try {
        if (project) {
            await updateProject({ ...project, ...projectData, workbookIds });
        } else {
            // On creation, include the workbookId to associate the project
            await addProject({ ...projectData, workbookIds }, templateId);
        }
        setOpen(false);
    } catch (error) {
        console.error("Failed to save project:", error);
        // Optionally, show an error message to the user
        alert("Falha ao salvar o projeto. Tente novamente.");
    }
  };
  
  const Trigger = children ? <DialogTrigger asChild>{children}</DialogTrigger> : null;

  const participantOptions = participants.map(p => ({ label: p.name, value: p.id }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {Trigger}
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full sm:max-w-md md:max-w-lg lg:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">{project ? 'Editar Projeto' : 'Criar Novo Projeto'}</DialogTitle>
            <DialogDescription>
              {project ? 'Atualize os detalhes do projeto.' : 'Preencha os detalhes abaixo para criar um novo projeto.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!project && (
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
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
             <div className="space-y-2">
                <Label htmlFor="workspace">Espaço</Label>
                <Select value={workspaceId} onValueChange={(value) => { setWorkspaceId(value); setWorkbookIds([]); }} required>
                  <SelectTrigger>
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
               {workspaceId && workbooksForSelectedWorkspace.length > 0 && (
                <div className="space-y-2">
                    <Label htmlFor="workbook">Pasta de Trabalho (Opcional)</Label>
                    <MultiSelect
                        options={workbooksForSelectedWorkspace}
                        value={workbookIds}
                        onValueChange={setWorkbookIds}
                        placeholder="Adicionar a uma pasta de trabalho"
                    />
                </div>
              )}
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
             <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={clientId} onValueChange={(v) => setClientId(v === 'none' ? undefined : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Nenhum cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="pmoId">Responsável Técnico</Label>
              <Select value={pmoId} onValueChange={setPmoId}>
                  <SelectTrigger>
                      <SelectValue placeholder="Selecione um responsável" />
                  </SelectTrigger>
                  <SelectContent>
                      {participants.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="participants">Participantes</Label>
                <MultiSelect
                    options={participantOptions}
                    value={participantIds}
                    onValueChange={setParticipantIds}
                    placeholder="Adicionar participantes..."
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-date">Data de Início</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data de Término</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(
                  value: 'Planejamento' | 'Em Andamento' | 'Pausado' | 'Concluído'
                ) => setStatus(value)}
              >
                <SelectTrigger>
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
