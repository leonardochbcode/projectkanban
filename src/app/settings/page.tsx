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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import type { ThemeColors } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

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

const ColorPicker = ({ label, color, setColor }: { label: string, color: string, setColor: (color: string) => void }) => (
    <div className="flex items-center gap-4">
        <Label className="w-40">{label}</Label>
        <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="p-1 h-10 w-16"/>
        <span className="text-sm text-muted-foreground font-mono">{color}</span>
    </div>
);

const defaultThemeColors: ThemeColors = {
  light: {
    background: '#f8fafc',
    foreground: '#020817',
    card: '#ffffff',
    cardForeground: '#020817',
    popover: '#ffffff',
    popoverForeground: '#020817',
    primary: '#4f46e5',
    primaryForeground: '#f8fafc',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    accent: '#f1f5f9',
    accentForeground: '#0f172a',
    destructive: '#ef4444',
    destructiveForeground: '#f8fafc',
    border: '#e2e8f0',
    input: '#e2e8f0',
    ring: '#4f46e5',
    menuForeground: '#f8fafc'
  },
  dark: {
    background: '#020817',
    foreground: '#f8fafc',
    card: '#020817',
    cardForeground: '#f8fafc',
    popover: '#020817',
    popoverForeground: '#f8fafc',
    primary: '#4f46e5',
    primaryForeground: '#f8fafc',
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',
    muted: '#1e293b',
    mutedForeground: '#94a3b8',
    accent: '#1e293b',
    accentForeground: '#f8fafc',
    destructive: '#ef4444',
    destructiveForeground: '#f8fafc',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#4f46e5',
    menuForeground: '#f8fafc'
  }
};


function CustomizationForm() {
  const { themeColors: storedThemeColors, updateThemeColors } = useStore();
  const { toast } = useToast();
  
  // Initialize with stored colors or defaults
  const [lightTheme, setLightTheme] = useState(storedThemeColors?.light ?? defaultThemeColors.light);
  const [darkTheme, setDarkTheme] = useState(storedThemeColors?.dark ?? defaultThemeColors.dark);

  const createColorSetter = (theme: 'light' | 'dark', key: keyof ThemeColors['light']) => (color: string) => {
    if (theme === 'light') {
      setLightTheme(prev => ({ ...prev, [key]: color }));
    } else {
      setDarkTheme(prev => ({ ...prev, [key]: color }));
    }
  };

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
  
  const applyColors = () => {
    let styleString = ':root {';
    for (const [key, value] of Object.entries(lightTheme)) {
      styleString += `--${key}: ${hexToHslString(value)};\n`;
    }
    styleString += '}\n';
    
    styleString += '.dark {';
    for (const [key, value] of Object.entries(darkTheme)) {
        styleString += `--${key}: ${hexToHslString(value)};\n`;
    }
    styleString += '}';
    
    const styleElement = document.getElementById('custom-theme-styles');
    if (styleElement) {
        styleElement.innerHTML = styleString;
    }
  };

  const handleSave = () => {
    const newColors = { light: lightTheme, dark: darkTheme };
    applyColors();
    updateThemeColors(newColors);
    toast({
      title: 'Tema Salvo',
      description: 'As cores do seu tema foram salvas com sucesso.',
    });
  };

  const ThemeEditor = ({ theme, setTheme }: { theme: 'light' | 'dark', setTheme: (colors: any) => void }) => {
    const colors = theme === 'light' ? lightTheme : darkTheme;
    const colorSetter = (key: keyof ThemeColors['light']) => (color: string) => {
        setTheme((prev: any) => ({ ...prev, [key]: color }));
    }
    
    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Cores Gerais</h3>
            <ColorPicker label="Cor de Fundo" color={colors.background} setColor={colorSetter('background')} />
            <ColorPicker label="Cor do Texto" color={colors.foreground} setColor={colorSetter('foreground')} />
            <ColorPicker label="Cor da Borda" color={colors.border} setColor={colorSetter('border')} />

            <Separator className="my-6" />
            <h3 className="font-semibold text-lg">Cores Primárias</h3>
            <ColorPicker label="Primária (Botões)" color={colors.primary} setColor={colorSetter('primary')} />
            <ColorPicker label="Texto da Primária" color={colors.primaryForeground} setColor={colorSetter('primaryForeground')} />
           
            <Separator className="my-6" />
            <h3 className="font-semibold text-lg">Cores de Destaque</h3>
            <ColorPicker label="Destaque (Hover)" color={colors.accent} setColor={colorSetter('accent')} />
            <ColorPicker label="Texto do Destaque" color={colors.accentForeground} setColor={colorSetter('accentForeground')} />

            <Separator className="my-6" />
            <h3 className="font-semibold text-lg">Menu Lateral</h3>
            <ColorPicker label="Fundo do Menu" color={colors.muted} setColor={colorSetter('muted')} />
            <ColorPicker label="Fonte do Menu" color={colors.menuForeground} setColor={colorSetter('menuForeground')} />
        </div>
    );
  }

  return (
      <Card>
          <CardHeader>
            <CardTitle>Personalização da Aparência</CardTitle>
            <CardDescription>
                Escolha as cores que melhor se adaptam à sua marca. As alterações são aplicadas em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="light" className="w-full">
                <TabsList>
                    <TabsTrigger value="light">Tema Claro</TabsTrigger>
                    <TabsTrigger value="dark">Tema Escuro</TabsTrigger>
                </TabsList>
                <TabsContent value="light" className="pt-4">
                    <ThemeEditor theme="light" setTheme={setLightTheme} />
                </TabsContent>
                <TabsContent value="dark" className="pt-4">
                     <ThemeEditor theme="dark" setTheme={setDarkTheme} />
                </TabsContent>
            </Tabs>
             <Separator className="my-6" />
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
