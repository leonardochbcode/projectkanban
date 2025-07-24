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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Participant } from '@/lib/types';

interface ManageParticipantDialogProps {
  children?: ReactNode;
  participant?: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageParticipantDialog({ children, participant, open, onOpenChange }: ManageParticipantDialogProps) {
  const { roles, addParticipant, updateParticipant } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  
  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setEmail(participant.email);
      setRoleId(participant.roleId);
    } else {
      // Reset form when adding new
      setName('');
      setEmail('');
      setRoleId('');
    }
  }, [participant, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (participant) {
      updateParticipant({
        ...participant,
        name,
        email,
        roleId,
      });
    } else {
      addParticipant({ name, email, roleId });
    }
    
    onOpenChange(false);
  };
  
  const Trigger = children ? <DialogTrigger asChild>{children}</DialogTrigger> : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {Trigger}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-headline">
              {participant ? 'Editar Participante' : 'Adicionar Novo Participante'}
            </DialogTitle>
            <DialogDescription>
              {participant
                ? 'Atualize os detalhes do participante abaixo.'
                : 'Preencha os detalhes para adicionar um novo membro à equipe.'}
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
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select value={roleId} onValueChange={setRoleId} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma função" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{participant ? 'Salvar Alterações' : 'Criar Participante'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
