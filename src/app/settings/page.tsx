'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/hooks/use-store';
import { useEffect, useState } from 'react';

function SettingsPageContent() {
  const { companyInfo, updateCompanyInfo, isLoaded } = useStore();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [suportewebCode, setSuportewebCode] = useState('');
  
  useEffect(() => {
    if(companyInfo) {
      setName(companyInfo.name);
      setCnpj(companyInfo.cnpj);
      setAddress(companyInfo.address);
      setSuportewebCode(companyInfo.suportewebCode);
    }
  }, [companyInfo, isLoaded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyInfo({
      name,
      cnpj,
      address,
      suportewebCode
    });
    toast({
      title: 'Configurações Salvas',
      description: 'As informações da empresa foram atualizadas com sucesso.',
    });
  }

  if (!isLoaded || !companyInfo) {
    return <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">Carregando...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informações da Empresa</CardTitle>
            <CardDescription>
              Gerencie os dados da sua empresa. Essas informações serão exibidas no cabeçalho.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa</Label>
              <Input id="companyName" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="suportewebCode">Código de Suporte</Label>
              <Input id="suportewebCode" value={suportewebCode} onChange={(e) => setSuportewebCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <Button type="submit">Salvar Alterações</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <AppLayout>
            <SettingsPageContent />
        </AppLayout>
    )
}
