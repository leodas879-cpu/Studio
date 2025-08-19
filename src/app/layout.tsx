import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'ChefAI',
  description: 'Your personal AI-powered chef. Create delicious recipes from the ingredients you have.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 bg-background text-foreground p-8">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
