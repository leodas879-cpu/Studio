
import { create } from 'zustand';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';
import { getRecipes, saveRecipe, removeRecipe } from '@/services/recipe-service';

export type Recipe = GenerateRecipeOutput & {
  isFavorite?: boolean;
};

interface RecipeStore {
  recentRecipes: Recipe[];
  favoriteRecipes: Recipe[];
  addRecentRecipe: (recipe: GenerateRecipeOutput) => void;
  toggleFavorite: (recipe: Recipe, uid: string) => Promise<void>;
  loadRecipes: (uid: string) => Promise<void>;
  setSelectedRecipe: (recipe: GenerateRecipeOutput | null) => void;
  selectedRecipe: Recipe | null;
  clearRecipes: () => void;
}

// The app's `Recipe` type now directly matches the `GenerateRecipeOutput` from the AI flow.
// No conversion is needed anymore.
function toAppRecipe(recipe: GenerateRecipeOutput): Recipe {
    return recipe;
}

// Helper to convert a `Recipe` object back into the format that Firestore expects.
function toDBRecipe(recipe: Recipe): GenerateRecipeOutput & { isFavorite?: boolean } {
    return {
        ...recipe,
        isFavorite: recipe.isFavorite,
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
    
    if (isFavorite) {
      await removeRecipe(uid, recipe.recipeName);
      set({ 
        favoriteRecipes: state.favoriteRecipes.filter(r => r.recipeName !== recipe.recipeName) 
      });
    } else {
      const dbRecipe = toDBRecipe({ ...recipe, isFavorite: true });
      await saveRecipe(uid, dbRecipe);
      set({ 
        favoriteRecipes: [{ ...recipe, isFavorite: true }, ...state.favoriteRecipes]
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
