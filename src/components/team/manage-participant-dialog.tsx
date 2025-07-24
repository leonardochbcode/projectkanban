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
import { Eye, EyeOff } from 'lucide-react';

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
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState('');
  
  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setEmail(participant.email);
      setRoleId(participant.roleId);
      setPassword(participant.password || ''); // Existing users might not have a password
    } else {
      // Reset form when adding new
      setName('');
      setEmail('');
      setRoleId('');
      setPassword('');
    }
    setShowPassword(false);
  }, [participant, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId || (!participant && !password)) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (participant) {
      updateParticipant({
        ...participant,
        name,
        email,
        roleId,
        password: password || participant.password, // Only update password if a new one is entered
      });
    } else {
      addParticipant({ name, email, roleId, password });
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
              {participant ? 'Editar Membro' : 'Adicionar Novo Membro'}
            </DialogTitle>
            <DialogDescription>
              {participant
                ? 'Atualize os detalhes do membro da equipe abaixo.'
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
              <Label htmlFor="password" className="text-right">
                Senha
              </Label>
              <div className="col-span-3 relative">
                <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    placeholder={participant ? 'Deixe em branco para não alterar' : ''}
                    required={!participant}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
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
            <Button type="submit">{participant ? 'Salvar Alterações' : 'Criar Membro'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
