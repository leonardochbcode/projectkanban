'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useStore } from '@/hooks/use-store';
import type { Workspace } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ShareWorkspaceDialogProps {
  workspace: Workspace;
  children: React.ReactNode;
  onParticipantsUpdate: (updatedWorkspace: Workspace) => void;
}

export function ShareWorkspaceDialog({ workspace, children, onParticipantsUpdate }: ShareWorkspaceDialogProps) {
  const { participants } = useStore();
  const { toast } = useToast();
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedParticipants(workspace.participantIds || []);
      setSearchTerm(''); // Reset search on open
    }
  }, [isOpen, workspace.participantIds]);

  const handleCheckboxChange = (participantId: string, checked: boolean) => {
    setSelectedParticipants(prev =>
      checked
        ? [...prev, participantId]
        : prev.filter(id => id !== participantId)
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspace.id}/share`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds: selectedParticipants }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao compartilhar o espaço de trabalho.');
      }

      const updatedWorkspace = { ...workspace, participantIds: selectedParticipants };
      onParticipantsUpdate(updatedWorkspace);

      toast({
        title: 'Sucesso!',
        description: 'As permissões do espaço de trabalho foram atualizadas.',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  };

  const participantsToShow = useMemo(() => {
    return participants
      .filter(p => p.id !== workspace.responsibleId)
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [participants, workspace.responsibleId, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar "{workspace.name}"</DialogTitle>
          <DialogDescription>
            Selecione os participantes para dar acesso a este espaço de trabalho.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          <Input
            placeholder="Pesquisar participante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <ScrollArea className="h-60 w-full rounded-md border p-4">
            <div className="grid gap-4">
            {participantsToShow.length > 0 ? (
              participantsToShow.map((participant) => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`participant-${participant.id}`}
                    checked={selectedParticipants.includes(participant.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(participant.id, !!checked)}
                  />
                  <Label htmlFor={`participant-${participant.id}`} className="flex-1 cursor-pointer">
                    <span className="font-medium">{participant.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{participant.email}</span>
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">Nenhum participante encontrado.</p>
            )}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}