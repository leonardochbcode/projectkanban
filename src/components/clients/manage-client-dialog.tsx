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
import type { Client } from '@/lib/types';
import { Textarea } from '../ui/textarea';

interface ManageClientDialogProps {
  children?: ReactNode;
  client?: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageClientDialog({ children, client, open, onOpenChange }: ManageClientDialogProps) {
  const { addClient, updateClient } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [suportewebCode, setSuportewebCode] = useState('');


  useEffect(() => {
    if (client) {
      setName(client.name);
      setEmail(client.email);
      setPhone(client.phone || '');
      setCompany(client.company || '');
      setCnpj(client.cnpj || '');
      setAddress(client.address || '');
      setSuportewebCode(client.suportewebCode || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setCompany('');
      setCnpj('');
      setAddress('');
      setSuportewebCode('');
    }
  }, [client, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      alert('Por favor, preencha nome e email.');
      return;
    }

    const clientData = {
        name,
        email,
        phone,
        company,
        cnpj,
        address,
        suportewebCode,
    };

    if (client) {
      updateClient({
        ...client,
        ...clientData,
      });
    } else {
      addClient(clientData);
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
              {client ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
            </DialogTitle>
            <DialogDescription>
              {client
                ? 'Atualize os detalhes do cliente abaixo.'
                : 'Preencha os detalhes para adicionar um novo cliente.'}
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
              <Label htmlFor="cnpj" className="text-right">
                CNPJ
              </Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Endereço
              </Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="suportewebCode" className="text-right">
                Cód. Suporte
              </Label>
              <Input
                id="suportewebCode"
                value={suportewebCode}
                onChange={(e) => setSuportewebCode(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{client ? 'Salvar Alterações' : 'Adicionar Cliente'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
