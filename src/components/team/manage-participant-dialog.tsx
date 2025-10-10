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
import { useToast } from '@/hooks/use-toast';

interface ManageParticipantDialogProps {
  children?: ReactNode;
  participant?: Participant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageParticipantDialog({
  children,
  participant,
  open,
  onOpenChange,
}: ManageParticipantDialogProps) {
  const { roles, addParticipant, updateParticipant } = useStore();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleId, setRoleId] = useState('');
  const [userType, setUserType] = useState('Colaborador');
  const [isLoading, setIsLoading] = useState(false);

  const isCollaborator = userType === 'Colaborador';

  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setEmail(participant.email);
      const type = participant.userType || 'Colaborador';
      setUserType(type);
      setRoleId(type === 'Colaborador' ? participant.roleId : '');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setRoleId('');
      setUserType('Colaborador');
      setPassword('');
    }
    setShowPassword(false);
    setIsLoading(false);
  }, [participant, open]);

  const handleUserTypeChange = (value: 'Colaborador' | 'Convidado') => {
    setUserType(value);
    if (value === 'Convidado') {
      setRoleId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || (isCollaborator && !roleId)) {
      toast({ variant: 'destructive', description: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }
    if (!participant && !password) {
      toast({ variant: 'destructive', description: 'Senha é obrigatória para novos usuários.' });
      return;
    }

    setIsLoading(true);

    try {
      const participantData = {
        name,
        email,
        userType,
        roleId: isCollaborator ? roleId : null,
      };

      if (participant) {
        updateParticipant({
          ...participant,
          ...participantData,
          ...(password && { password }),
        });
        toast({ description: 'Membro da equipe atualizado com sucesso.' });
      } else {
        addParticipant({ ...participantData, password });
        toast({ description: 'Novo membro da equipe adicionado.' });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
      toast({
        variant: 'destructive',
        title: 'Falha ao salvar',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
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
            {/* Input fields for name, email, password */}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
                  required={!participant}
                  placeholder={participant ? 'Digite para redefinir' : 'Senha inicial'}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* User Type Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userType" className="text-right">
                Tipo
              </Label>
              <Select
                value={userType}
                onValueChange={(value) => handleUserTypeChange(value as 'Colaborador' | 'Convidado')}
                required
                disabled={isLoading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Colaborador">Colaborador</SelectItem>
                  <SelectItem value="Convidado">Convidado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role Select */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select
                value={roleId}
                onValueChange={setRoleId}
                required={isCollaborator}
                disabled={!isCollaborator || isLoading}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={isCollaborator ? "Selecione uma função" : "N/A"} />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : (participant ? 'Salvar Alterações' : 'Criar Membro')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
