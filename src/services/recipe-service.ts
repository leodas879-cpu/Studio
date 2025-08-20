
'use server';

import { createClient } from '@/lib/supabase/server';
import type { GenerateRecipeOutput } from '@/ai/flows/generate-recipe-flow';

export async function saveRecipe(uid: string, recipe: GenerateRecipeOutput & { isFavorite?: boolean }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('recipes')
    .upsert({ 
        user_id: uid, 
        recipe_name: recipe.recipeName, 
        recipe_data: recipe,
        is_favorite: true,
    }, { onConflict: 'user_id, recipe_name' });
  
  if (error) {
    console.error('Error saving recipe:', error);
  }
}

export async function removeRecipe(uid: string, recipeName: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('user_id', uid)
    .eq('recipe_name', recipeName);

  if (error) {
    console.error('Error removing recipe:', error);
  }
}

export async function getRecipes(uid: string): Promise<(GenerateRecipeOutput & { isFavorite?: boolean })[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('recipes')
        .select('recipe_data')
        .eq('user_id', uid)
        .eq('is_favorite', true);

    if (error) {
        console.error('Error getting recipes:', error);
        return [];
    }

    return data.map(item => item.recipe_data) as (GenerateRecipeOutput & { isFavorite?: boolean })[];
}
