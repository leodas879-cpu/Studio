
"use server";

import { generateRecipe, type GenerateRecipeInput, type GenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { validateIngredients } from "@/ai/flows/validate-ingredients-flow";
import type { ValidateIngredientsInput, ValidateIngredientsOutput } from "@/ai/schemas";
import { z } from "zod";

const ActionInputSchema = z.object({
  ingredients: z.array(z.string()).min(1, { message: "Please select at least one ingredient." }),
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  glutenFree: z.boolean().optional(),
  highProtein: z.boolean().optional(),
});

export async function handleValidateIngredients(input: ValidateIngredientsInput): Promise<{ data: ValidateIngredientsOutput | null; error: string | null }> {
  try {
    const result = await validateIngredients(input);
    return { data: result, error: null };
  } catch (e: any) {
    console.error(e);
    return { data: null, error: e.message || "An unexpected error occurred during validation." };
  }
}

export async function handleGenerateRecipe(input: GenerateRecipeInput): Promise<{ data: GenerateRecipeOutput | null; error: string | null }> {
  const parsedInput = ActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const errorMessage = parsedInput.error.errors.map(e => e.message).join(", ");
    return { data: null, error: errorMessage };
  }

  try {
    const recipe = await generateRecipe(parsedInput.data);
    // The flow itself now handles fallbacks, so we just check for final validity.
    if (!recipe || !recipe.recipeName || recipe.steps.length === 0) {
      return { data: null, error: "The AI failed to generate a valid recipe with the selected ingredients. Please try again with different options." };
    }
    return { data: recipe, error: null };
  } catch (e: any) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred.";
    return { data: null, error: `An unexpected error occurred while generating the recipe: ${errorMessage}` };
  }
}

    