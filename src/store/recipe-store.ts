
import { create } from 'zustand';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';
import { getRecipes, saveRecipe, removeRecipe } from '@/services/recipe-service';

// The GenerateRecipeOutput now has a structured ingredients list.
// The app's internal `Recipe` type will continue to use a simple string array for now for compatibility.
export type Recipe = Omit<GenerateRecipeOutput, 'requiredIngredients' | 'alternativeSuggestions'> & {
  requiredIngredients: string[];
  alternativeSuggestions?: string[];
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

// Helper to convert recipe types for storage/display
function toAppRecipe(recipe: any): Recipe {
    return {
        ...recipe,
        requiredIngredients: recipe.requiredIngredients.map((ing: any) => typeof ing === 'string' ? ing : `${ing.quantity} ${ing.name}`),
        alternativeSuggestions: recipe.alternativeSuggestions || [],
    };
}


export const useRecipeStore = create<RecipeStore>((set, get) => ({
  recentRecipes: [],
  favoriteRecipes: [],
  selectedRecipe: null,
  
  addRecentRecipe: (recipe) => {
    set((state) => {
      const appRecipe = toAppRecipe(recipe);
      const filteredRecents = state.recentRecipes.filter(r => r.recipeName !== appRecipe.recipeName);
      const newRecents = [appRecipe, ...filteredRecents].slice(0, 10);
      return { recentRecipes: newRecents };
    });
  },

  toggleFavorite: async (recipe: Recipe, uid: string) => {
    const state = get();
    const isFavorite = state.favoriteRecipes.some(r => r.recipeName === recipe.recipeName);
    const appRecipe = toAppRecipe(recipe);
    
    if (isFavorite) {
      await removeRecipe(uid, appRecipe.recipeName);
      set({ 
        favoriteRecipes: state.favoriteRecipes.filter(r => r.recipeName !== appRecipe.recipeName) 
      });
    } else {
      await saveRecipe(uid, { ...appRecipe, isFavorite: true });
      set({ 
        favoriteRecipes: [{ ...appRecipe, isFavorite: true }, ...state.favoriteRecipes]
      });
    }
  },

  loadRecipes: async (uid: string) => {
    const recipesFromDB = await getRecipes(uid);
    const favoriteAppRecipes = recipesFromDB
        .filter(r => r.isFavorite)
        .map(toAppRecipe);
    set({ favoriteRecipes: favoriteAppRecipes });
  },

  setSelectedRecipe: (recipe) => {
    set({ selectedRecipe: recipe ? toAppRecipe(recipe) : null });
  },

  clearRecipes: () => {
    set({ recentRecipes: [], favoriteRecipes: [], selectedRecipe: null });
  }
}));
