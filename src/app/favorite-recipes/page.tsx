"use client";

import { RecipeCard } from "@/components/recipe-card";
import { useRecipeStore } from "@/store/recipe-store";
import { Heart } from "lucide-react";

export default function FavoriteRecipes() {
  const { favoriteRecipes } = useRecipeStore();

  return (
     <div className="space-y-8">
       <div>
        <h1 className="text-4xl font-bold font-headline tracking-tight">Favorite Recipes</h1>
        <p className="text-muted-foreground mt-2">
            Your collection of saved recipes. Never lose a great meal idea again!
        </p>
      </div>
      
      {favoriteRecipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg h-96">
          <Heart className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold font-headline">No Favorite Recipes</h2>
          <p className="text-muted-foreground mt-2 max-w-sm">
            You haven't saved any favorite recipes yet. Click the heart icon on a recipe to save it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.recipeName} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
