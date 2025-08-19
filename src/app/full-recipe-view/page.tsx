"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRecipeStore } from '@/store/recipe-store';
import { RecipeDisplay } from '@/components/recipe-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

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


export default function FullRecipeView() {
  return (
    <div>
      <h1 className="text-4xl font-bold font-headline tracking-tight mb-8">Full Recipe View</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <FullRecipeViewContent />
      </Suspense>
    </div>
  );
}
