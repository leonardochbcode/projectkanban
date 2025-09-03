import type { Metadata } from 'next';
import './global.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { StoreProvider } from '@/hooks/use-store';
import { ThemeProvider } from '@/components/theme-provider';
import NextAuthSessionProvider from '@/components/session-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'CHB Planner',
  description: 'Sistema de gerenciamento de projetos moderno e responsivo.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-body antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthSessionProvider>
            <StoreProvider>
                {children}
                <Toaster />
            </StoreProvider>
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
