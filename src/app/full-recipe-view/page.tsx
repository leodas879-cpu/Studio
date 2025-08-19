"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRecipeStore } from '@/store/recipe-store';
import { RecipeDisplay } from '@/components/recipe-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function FullRecipeViewContent() {
  const searchParams = useSearchParams();
  const recipeName = searchParams.get('recipe');
  const { recentRecipes, favoriteRecipes } = useRecipeStore();

  const allRecipes = [...recentRecipes, ...favoriteRecipes];
  const recipeToShow = allRecipes.find(r => r.recipeName === recipeName);

  if (!recipeToShow) {
    return (
      <Card className="h-full flex flex-col items-center justify-center p-8 bg-card/50 border-dashed border-2">
        <UtensilsCrossed className="w-16 h-16 text-muted-foreground mb-4" />
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center font-headline">Recipe not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center mt-2 max-w-sm">
            We couldn't find the recipe you were looking for. It might not be in your recent or favorites list.
          </p>
        </CardContent>
      </Card>
    );
  }

  return <RecipeDisplay recipe={recipeToShow} isLoading={false} />;
}

function LoadingFallback() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-16 rounded-full" />
                    </div>
                </div>
                <div>
                    <Skeleton className="h-8 w-1/2 mb-4" />
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-11/12" />
                        <Skeleton className="h-5 w-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}


export default function FullRecipeView() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">Full Recipe View</h1>
      <Suspense fallback={<LoadingFallback />}>
        <FullRecipeViewContent />
      </Suspense>
    </div>
  );
}
