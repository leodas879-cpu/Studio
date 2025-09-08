
"use server";

import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { z } from "zod";

const ActionInputSchema = z.object({
  ingredients: z.array(z.string()).min(1, { message: "Please select at least one ingredient." }),
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  glutenFree: z.boolean().optional(),
  highProtein: z.boolean().optional(),
});

export async function handleGenerateRecipe(input: GenerateRecipeInput): Promise<{ data: GenerateRecipeOutput | null; error: string | null }> {
  const parsedInput = ActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const errorMessage = parsedInput.error.errors.map(e => e.message).join(", ");
    return { data: null, error: errorMessage };
  }

  try {
    const recipeData = await generateRecipe(parsedInput.data);
    
    if (!recipeData.isCompatible) {
      return { data: recipeData, error: null };
    }
    
    if (!recipeData.recipeName || !recipeData.steps || recipeData.steps.length === 0) {
      return { data: null, error: "The AI failed to generate a valid recipe with the selected ingredients. Please try again with different options." };
    }
    return { data: recipeData, error: null };
  } catch (e: any) {
    console.error(e);
    let errorMessage = "An unexpected error occurred while generating the recipe. Please try again later.";
    if (e.message) {
      errorMessage = `An unexpected error occurred while generating the recipe: ${e.message}`;
    }
    return { data: null, error: errorMessage };
  }
}
