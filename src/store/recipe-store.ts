import { create } from 'zustand';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';
import { getRecipes, saveRecipe, removeRecipe } from '@/services/recipe-service';

export type Recipe = GenerateRecipeOutput & {
  vegetarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  isFavorite?: boolean;
};

interface RecipeStore {
  recentRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  addRecentRecipe: (recipe: Recipe) => void;
  toggleFavorite: (recipe: Recipe, uid: string) => Promise<void>;
  loadRecipes: (uid: string) => Promise<void>;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  selectedRecipe: Recipe | null;
  clearRecipes: () => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recentRecipes: [],
  favoriteRecipes: [],
  selectedRecipe: null,
  
  addRecentRecipe: (recipe) => {
    set((state) => {
      const filteredRecents = state.recentRecipes.filter(r => r.recipeName !== recipe.recipeName);
      const newRecents = [recipe, ...filteredRecents].slice(0, 10);
      return { recentRecipes: newRecents };
    });
  },

  toggleFavorite: async (recipe: Recipe, uid: string) => {
    const state = get();
    const isFavorite = state.favoriteRecipes.some(r => r.recipeName === recipe.recipeName);
    
    if (isFavorite) {
      await removeRecipe(uid, recipe.recipeName);
      set({ 
        favoriteRecipes: state.favoriteRecipes.filter(r => r.recipeName !== recipe.recipeName) 
      });
    } else {
      await saveRecipe(uid, { ...recipe, isFavorite: true });
      set({ 
        favoriteRecipes: [{ ...recipe, isFavorite: true }, ...state.favoriteRecipes]
      });
    }
  },

  loadRecipes: async (uid: string) => {
    const recipes = await getRecipes(uid);
    set({ favoriteRecipes: recipes.filter(r => r.isFavorite) });
  },

  setSelectedRecipe: (recipe) => {
    set({ selectedRecipe: recipe });
  },

  clearRecipes: () => {
    set({ recentRecipes: [], favoriteRecipes: [], selectedRecipe: null });
  }
}));
