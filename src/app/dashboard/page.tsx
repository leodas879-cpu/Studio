
"use client";

import dynamic from 'next/dynamic';
import { useProfileStore } from '@/store/profile-store';
import { Skeleton } from '@/components/ui/skeleton';

const RecipeGenerator = dynamic(() => import('@/components/recipe-generator').then(mod => mod.RecipeGenerator), {
  ssr: false,
  loading: () => <RecipeGeneratorSkeleton />
});

export default function Dashboard() {
  const { profile } = useProfileStore();

  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Welcome back, {profile.firstName}! 👋</h1>
        <p className="text-muted-foreground mt-2">
            What delicious recipe would you like to create today? Select your ingredients and let AI work its magic.
        </p>
      </div>
      <RecipeGenerator />
    </div>
  );
}

const RecipeGeneratorSkeleton = () => (
  <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-2">
    <div className="space-y-6">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
    <div className="lg:sticky lg:top-8">
      <Skeleton className="h-[500px] w-full" />
    </div>
  </div>
);
