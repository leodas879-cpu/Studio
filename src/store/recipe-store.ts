
import { create } from 'zustand';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';
import { getRecipes, saveRecipe, removeRecipe } from '@/services/recipe-service';

// The GenerateRecipeOutput now has a structured ingredients list.
// The app's internal `Recipe` type will convert this to a simple string array for compatibility.
export type Recipe = Omit<GenerateRecipeOutput, 'requiredIngredients'> & {
  requiredIngredients: string[]; // Keep as string array for display components
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

// Helper to convert the AI's structured ingredient output to the simple string array
// that the app's components (like RecipeDisplay) expect.
function toAppRecipe(recipe: GenerateRecipeOutput): Recipe {
    return {
        ...recipe,
        requiredIngredients: recipe.requiredIngredients.map((ing) => `${ing.quantity} ${ing.name}`),
    };
}

// Helper to convert a `Recipe` object back into the format that Firestore expects.
function toDBRecipe(recipe: Recipe): GenerateRecipeOutput & { isFavorite?: boolean } {
    // This conversion is lossy but acceptable for saving favorites.
    // A more robust solution might refactor how ingredients are stored everywhere.
    const structuredIngredients = recipe.requiredIngredients.map(ingStr => {
        const parts = ingStr.split(' ');
        const quantity = parts.slice(0, -1).join(' ');
        const name = parts.slice(-1)[0];
        return { name: name || ingStr, quantity: quantity || '' };
    });

    return {
        recipeName: recipe.recipeName,
        cuisine: recipe.cuisine,
        requiredIngredients: structuredIngredients,
        steps: recipe.steps,
        servingSuggestions: recipe.servingSuggestions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        alternativeSuggestions: recipe.alternativeSuggestions || [],
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
