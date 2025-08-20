
"use client";

import { RecipeGenerator } from '@/components/recipe-generator';
import { useProfileStore } from '@/store/profile-store';

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
