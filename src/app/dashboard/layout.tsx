
"use client";

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
        <div className="flex min-h-screen">
            <Skeleton className="w-64 h-screen" />
            <div className="flex-1 flex flex-col">
                <Skeleton className="h-16" />
                <div className="flex-1 p-8">
                    <Skeleton className="w-full h-full rounded-lg" />
                </div>
            </div>
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 bg-background text-foreground p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
