import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';

interface RecipeStore {
  recentRecipes: GenerateRecipeOutput[];
  favoriteRecipes: GenerateRecipeOutput[];
  addRecentRecipe: (recipe: GenerateRecipeOutput) => void;
  toggleFavorite: (recipe: GenerateRecipeOutput) => void;
  setSelectedRecipe: (recipe: GenerateRecipeOutput | null) => void;
  selectedRecipe: GenerateRecipeOutput | null;
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recentRecipes: [],
      favoriteRecipes: [],
      selectedRecipe: null,
      addRecentRecipe: (recipe) => {
        set((state) => {
          // Avoid duplicates
          const filteredRecents = state.recentRecipes.filter(r => r.recipeName !== recipe.recipeName);
          const newRecents = [recipe, ...filteredRecents].slice(0, 10); // Keep only the 10 most recent
          return { recentRecipes: newRecents };
        });
      },
      toggleFavorite: (recipe) => {
        set((state) => {
          const isFavorite = state.favoriteRecipes.some(r => r.recipeName === recipe.recipeName);
          if (isFavorite) {
            return {
              favoriteRecipes: state.favoriteRecipes.filter(r => r.recipeName !== recipe.recipeName),
            };
          } else {
            return {
              favoriteRecipes: [recipe, ...state.favoriteRecipes],
            };
          }
        });
      },
      setSelectedRecipe: (recipe) => {
        set({ selectedRecipe: recipe });
      },
    }),
    {
      name: 'recipe-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
