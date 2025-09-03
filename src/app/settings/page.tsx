'use client';

import { AppLayout } from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/hooks/use-store';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const themes = [
    { name: 'Light', value: 'light', colors: ['bg-gray-200', 'bg-gray-200', 'bg-gray-800'] },
    { name: 'Dark', value: 'dark', colors: ['bg-gray-800', 'bg-gray-700', 'bg-gray-100'] },
    { name: 'Cinza', value: 'theme-gray', colors: ['bg-gray-100', 'bg-gray-300', 'bg-gray-900'] },
    { name: 'Verde', value: 'theme-green', colors: ['bg-green-100', 'bg-green-300', 'bg-green-900'] },
    { name: 'Azul', value: 'theme-blue', colors: ['bg-blue-100', 'bg-blue-300', 'bg-blue-800'] },
];


function ThemeSelector() {
    const { theme, setTheme } = useTheme();
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temas</CardTitle>
          <CardDescription>
            Selecione um tema para a aplicação.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {themes.map((t) => (
                <div key={t.value} className="space-y-2">
                    <Button
                        variant="outline"
                        className={cn("w-full h-24 p-2 flex-col items-start justify-start relative",
                            theme === t.value && "border-primary ring-2 ring-primary"
                        )}
                        onClick={() => setTheme(t.value)}
                    >
                         <div className="flex items-center justify-center w-full h-full gap-1">
                            {t.colors.map((color, i) => (
                                <div key={i} className={cn("h-4/5 w-1/3 rounded", color)}></div>
                            ))}
                        </div>
                        {theme === t.value && (
                             <Check className="h-5 w-5 absolute top-2 right-2 text-primary" />
                        )}
                    </Button>
                     <p className="text-sm font-medium text-center">{t.name}</p>
                </div>
            ))}
        </CardContent>
      </Card>
    );
  }

function CompanyInfoForm() {
    const { companyInfo, updateCompanyInfo, isLoaded } = useStore();
    const { toast } = useToast();
  
    const [name, setName] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [address, setAddress] = useState('');
    const [suportewebCode, setSuportewebCode] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | undefined>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      if(companyInfo) {
        setName(companyInfo.name);
        setCnpj(companyInfo.cnpj);
        setAddress(companyInfo.address);
        setSuportewebCode(companyInfo.suportewebCode);
        setLogoUrl(companyInfo.logoUrl);
      }
    }, [companyInfo, isLoaded])
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      updateCompanyInfo({
        name,
        cnpj,
        address,
        suportewebCode,
        logoUrl,
      });
      toast({
        title: 'Configurações Salvas',
        description: 'As informações da empresa foram atualizadas com sucesso.',
      });
    }

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


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
                    <Label>Logo da Empresa</Label>
                    <div className="flex items-center gap-4">
                        {logoUrl ? (
                            <Image src={logoUrl} alt="Logo" width={64} height={64} className="h-16 w-16 rounded-md object-contain border p-1" />
                        ) : (
                            <div className="h-16 w-16 rounded-md border flex items-center justify-center bg-muted">
                                <span className="text-xs text-muted-foreground">Sem Logo</span>
                            </div>
                        )}
                        <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Alterar Logo
                        </Button>
                    </div>
                </div>
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

function SettingsPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Configurações</h1>
      </div>
      <div className="space-y-4">
        <ThemeSelector />
        <CompanyInfoForm />
      </div>
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
