'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStore } from '@/hooks/use-store';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const { login, isSeeding } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        router.push('/');
      } else {
        // This case might not be reached if login throws, but it's good practice.
        throw new Error('Falha no login');
      }
    } catch (error) {
      console.error(error);
      let description = 'Ocorreu um erro desconhecido. Tente novamente.';
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/configuration-not-found') {
          description = 'O método de login por Email/Senha não está ativado no Firebase. Por favor, ative-o no console do Firebase.';
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          description = 'Credenciais inválidas. Verifique seu email e senha.';
        }
      }
      toast({
        variant: 'destructive',
        title: 'Falha no login',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isFormDisabled = isLoading || isSeeding;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Login</CardTitle>
          <CardDescription>
            {isSeeding 
              ? 'Configurando a base de dados inicial...' 
              : 'Entre com seu email e senha para acessar o painel.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isFormDisabled}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isFormDisabled}>
              {isLoading ? 'Entrando...' : (isSeeding ? 'Aguarde...' : 'Entrar')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
