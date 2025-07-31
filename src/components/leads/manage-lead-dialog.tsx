
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
import type { Lead } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ManageLeadDialogProps {
  children?: ReactNode;
  lead?: Lead;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageLeadDialog({ children, lead, open, onOpenChange }: ManageLeadDialogProps) {
  const { addLead, updateLead, clients } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Lead['status']>('Novo');
  const [value, setValue] = useState(0);
  const [clientId, setClientId] = useState<string | undefined>();


  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone || '');
      setCompany(lead.company || '');
      setDescription(lead.description);
      setStatus(lead.status);
      setValue(lead.value);
      setClientId(lead.clientId);
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setDescription('');
      setStatus('Novo');
      setValue(0);
      setClientId(undefined);
    }
  }, [lead, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Por favor, preencha nome e email.');
      return;
    }

    const leadData = {
        name,
        email,
        phone,
        company,
        description,
        status,
        value,
        clientId,
    };

    if (lead) {
      updateLead({
        ...lead,
        ...leadData,
      });
    } else {
      addLead(leadData);
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
              {lead ? 'Editar Proposta' : 'Adicionar Nova Proposta'}
            </DialogTitle>
            <DialogDescription>
              {lead
                ? 'Atualize os detalhes da proposta abaixo.'
                : 'Preencha os detalhes para adicionar uma nova proposta.'}
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
              <Select value={status} onValueChange={(v: Lead['status']) => setStatus(v)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em Contato">Em Contato</SelectItem>
                  <SelectItem value="Proposta Enviada">Proposta Enviada</SelectItem>
                  <SelectItem value="Convertido">Convertido</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{lead ? 'Salvar Alterações' : 'Adicionar Proposta'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
