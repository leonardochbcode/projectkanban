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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function CompanyInfoForm() {
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
      return <div>Carregando...</div>
    }

    return (
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
    )
}


function CustomizationForm() {
  const { themeColors, updateThemeColors } = useStore();
  const { toast } = useToast();
  
  const [primary, setPrimary] = useState(themeColors?.primary || '#283156');
  const [background, setBackground] = useState(themeColors?.background || '#f0f4f8');
  const [accent, setAccent] = useState(themeColors?.accent || '#e0e7ff');

  // Utility to convert hex to HSL string
  const hexToHslString = (hex: string) => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const applyColors = (colors: {primary: string, background: string, accent: string}) => {
     document.documentElement.style.setProperty('--primary', hexToHslString(colors.primary));
     document.documentElement.style.setProperty('--background', hexToHslString(colors.background));
     document.documentElement.style.setProperty('--accent', hexToHslString(colors.accent));
     
     // Update sidebar color dynamically as well
     document.documentElement.style.setProperty('--muted', hexToHslString(colors.primary));
  }
  
  const handleSave = () => {
    const newColors = { primary, background, accent };
    applyColors(newColors);
    updateThemeColors(newColors);
    toast({
      title: 'Tema Salvo',
      description: 'As cores do seu tema foram salvas com sucesso.',
    });
  }

  return (
      <Card>
          <CardHeader>
            <CardTitle>Personalização da Aparência</CardTitle>
            <CardDescription>
                Escolha as cores que melhor se adaptam à sua marca.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                  <Label htmlFor="primaryColor" className="w-28">Cor Primária</Label>
                  <Input id="primaryColor" type="color" value={primary} onChange={e => setPrimary(e.target.value)} className="p-1 h-10 w-16"/>
                  <span className="text-sm text-muted-foreground">{primary}</span>
              </div>
              <div className="flex items-center gap-4">
                  <Label htmlFor="bgColor" className="w-28">Cor de Fundo</Label>
                  <Input id="bgColor" type="color" value={background} onChange={e => setBackground(e.target.value)} className="p-1 h-10 w-16"/>
                  <span className="text-sm text-muted-foreground">{background}</span>
              </div>
              <div className="flex items-center gap-4">
                  <Label htmlFor="accentColor" className="w-28">Cor de Destaque</Label>
                  <Input id="accentColor" type="color" value={accent} onChange={e => setAccent(e.target.value)} className="p-1 h-10 w-16"/>
                   <span className="text-sm text-muted-foreground">{accent}</span>
              </div>
               <Button onClick={handleSave}>Salvar Tema</Button>
          </CardContent>
      </Card>
  )
}


function SettingsPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
      </div>
        <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
                <TabsTrigger value="info">Informações da Empresa</TabsTrigger>
                <TabsTrigger value="customization">Personalização</TabsTrigger>
            </TabsList>
            <TabsContent value="info">
                <CompanyInfoForm />
            </TabsContent>
            <TabsContent value="customization">
                <CustomizationForm />
            </TabsContent>
        </Tabs>
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
