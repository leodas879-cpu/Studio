
"use client";

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileHeader } from '@/components/mobile-header';
import { useRecipeStore } from '@/store/recipe-store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const { loadRecipes } = useRecipeStore();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user) {
      loadRecipes(user.uid);
    }
  }, [user, loading, router, loadRecipes]);

  if (loading) {
    return (
        <div className="flex min-h-screen">
            <div className="hidden md:flex md:w-64 md:flex-col">
                <Skeleton className="w-full h-screen" />
            </div>
            <div className="flex-1 flex flex-col">
                <Skeleton className="h-16" />
                <div className="flex-1 p-4 md:p-8">
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
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <div className="md:hidden">
            <MobileHeader />
        </div>
        <div className="hidden md:block">
            <Header />
        </div>
        <main className="flex-1 bg-background text-foreground p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
