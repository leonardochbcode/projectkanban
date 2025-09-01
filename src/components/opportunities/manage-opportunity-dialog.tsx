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
import type { Opportunity } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ManageOpportunityDialogProps {
  children?: ReactNode;
  opportunity?: Opportunity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageOpportunityDialog({ children, opportunity, open, onOpenChange }: ManageOpportunityDialogProps) {
  const { addOpportunity, updateOpportunity, clients, currentUser, getRole } = useStore();
  
  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canEditValues = userRole?.permissions.includes('view_opportunity_values') ?? false;

  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Opportunity['status']>('A Analisar');
  const [value, setValue] = useState(0);
  const [clientId, setClientId] = useState<string | undefined>();


  useEffect(() => {
    if (opportunity) {
      setName(opportunity.name);
      setContactName(opportunity.contactName);
      setEmail(opportunity.email);
      setPhone(opportunity.phone || '');
      setCompany(opportunity.company || '');
      setDescription(opportunity.description);
      setStatus(opportunity.status);
      setValue(opportunity.value);
      setClientId(opportunity.clientId);
    } else {
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setDescription('');
      setStatus('A Analisar');
      setValue(0);
      setClientId(undefined);
    }
  }, [opportunity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !contactName || !email) {
      alert('Por favor, preencha o nome da oportunidade, o nome do contato e o email.');
      return;
    }

    const opportunityData = {
        name,
        contactName,
        email,
        phone,
        company,
        description,
        status,
        value,
        clientId,
    };

    if (opportunity) {
      updateOpportunity({
        ...opportunity,
        ...opportunityData,
      });
    } else {
      addOpportunity(opportunityData);
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
              {opportunity ? 'Editar Oportunidade' : 'Adicionar Nova Oportunidade'}
            </DialogTitle>
            <DialogDescription>
              {opportunity
                ? 'Atualize os detalhes da oportunidade abaixo.'
                : 'Preencha os detalhes para adicionar uma nova oportunidade.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Oportunidade
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Venda de Sistema"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contactName" className="text-right">
                Contato
              </Label>
              <Input
                id="contactName"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="col-span-3"
                placeholder="Nome do contato"
                required
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="client" className="text-right">
                Cliente
              </Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v === 'new' ? undefined : v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Novo Cliente" />
                </SelectTrigger>
                <SelectContent>
                   <SelectItem value="new">Novo Cliente</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="phone" className="text-right">
                Telefone
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Empresa
              </Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="col-span-3"
              />
            </div>
             {canEditValues && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">
                        Valor (R$)
                    </Label>
                    <Input
                        id="value"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(Number(e.target.value))}
                        className="col-span-3"
                    />
                </div>
             )}
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
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select value={status} onValueChange={(v: Opportunity['status']) => setStatus(v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A Analisar">A Analisar</SelectItem>
                  <SelectItem value="Contato Realizado">Contato Realizado</SelectItem>
                  <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
                  <SelectItem value="Ganha">Ganha</SelectItem>
                  <SelectItem value="Perdida">Perdida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{opportunity ? 'Salvar Alterações' : 'Adicionar Oportunidade'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
