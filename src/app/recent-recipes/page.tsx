"use client";

import { RecipeCard } from "@/components/recipe-card";
import { useRecipeStore } from "@/store/recipe-store";
import { UtensilsCrossed } from "lucide-react";

export default function RecentRecipes() {
  const { recentRecipes } = useRecipeStore();
  
  return (
    <div className="space-y-8">
       <div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">Recent Recipes</h1>
        <p className="text-muted-foreground mt-2">
            Here are the delicious recipes you've recently generated.
        </p>
      </div>
      
      {recentRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg h-96">
          <UtensilsCrossed className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold font-headline">No Recent Recipes</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            You haven't generated any recipes yet. Go to the dashboard to create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recentRecipes.map((recipe, index) => (
            <RecipeCard key={`${recipe.recipeName}-${index}`} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
