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
import { FirebaseError } from 'firebase/app';

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (participant) {
      setName(participant.name);
      setEmail(participant.email);
      setRoleId(participant.roleId);
      setPassword(''); // Password is not editable for existing users in this dialog
    } else {
      // Reset form when adding new
      setName('');
      setEmail('');
      setRoleId('');
      setPassword('');
    }
    setShowPassword(false);
    setIsLoading(false);
  }, [participant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !roleId) {
      toast({ variant: 'destructive', description: 'Por favor, preencha nome, email e função.' });
      return;
    }
    if (!participant && !password) {
      toast({ variant: 'destructive', description: 'Senha é obrigatória para novos usuários.' });
      return;
    }

    setIsLoading(true);

    try {
      if (participant) {
        await updateParticipant({
          ...participant,
          name,
          email,
          roleId,
        });
        toast({ description: 'Membro da equipe atualizado com sucesso.' });
      } else {
        await addParticipant({ name, email, roleId, password });
        toast({ description: 'Novo membro da equipe adicionado.' });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      let errorMessage = 'Ocorreu um erro desconhecido.';
      if (error instanceof FirebaseError) {
        if(error.code === 'auth/email-already-in-use') {
          errorMessage = 'Este email já está em uso por outro membro.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'A senha é muito fraca. Ela deve ter pelo menos 6 caracteres.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
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
                disabled={isLoading || !!participant} // Cannot change email for existing user via this form
              />
            </div>
            {!participant && (
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Função
              </Label>
              <Select value={roleId} onValueChange={setRoleId} required disabled={isLoading}>
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
