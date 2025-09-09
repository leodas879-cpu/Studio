
"use server";

import { generateRecipe, type GenerateRecipeInput } from "@/ai/flows/generate-recipe-flow";
import type { GenerateRecipeOutput as OriginalGenerateRecipeOutput } from "@/ai/flows/generate-recipe-flow";
import { analyzeIngredients, type AnalyzeIngredientsInput, type AnalyzeIngredientsOutput } from "@/ai/flows/analyze-ingredients-flow";
import { analyzeImage, type AnalyzeImageInput, type AnalyzeImageOutput } from "@/ai/flows/analyze-image-flow";
import { z } from "zod";

// The Recipe type used throughout the app still expects a simple string array.
// The new AI flow returns a structured array. We'll keep the app's internal type
// as-is for now and transform the data in the action.
type AppRecipeOutput = Omit<OriginalGenerateRecipeOutput, 'requiredIngredients'> & {
    requiredIngredients: string[];
};


const RecipeActionInputSchema = z.object({
  ingredients: z.array(z.string()).min(1, { message: "Please select at least one ingredient." }),
  vegetarian: z.boolean().optional(),
  vegan: z.boolean().optional(),
  glutenFree: z.boolean().optional(),
  highProtein: z.boolean().optional(),
});

export async function handleGenerateRecipe(input: GenerateRecipeInput): Promise<{ data: AppRecipeOutput | null; error: string | null }> {
  const parsedInput = RecipeActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const errorMessage = parsedInput.error.errors.map(e => e.message).join(", ");
    return { data: null, error: errorMessage };
  }

  try {
    const recipeFromFlow = await generateRecipe(parsedInput.data);

    if (!recipeFromFlow || !recipeFromFlow.recipeName || recipeFromFlow.steps.length === 0) {
      return { data: null, error: "The AI failed to generate a valid recipe with the selected ingredients. Please try again with different options." };
    }

    // Adapt the structured ingredients to the simple string array the app expects.
    const appCompatibleRecipe: AppRecipeOutput = {
        ...recipeFromFlow,
        requiredIngredients: recipeFromFlow.requiredIngredients.map(ing => typeof ing === 'string' ? ing : `${ing.quantity} ${ing.name}`),
        alternativeSuggestions: recipeFromFlow.alternativeSuggestions || [],
    };
    
    return { data: appCompatibleRecipe, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "An unexpected error occurred while generating the recipe. Please try again later." };
  }
}

const AnalyzeActionInputSchema = z.object({
  ingredients: z.array(z.string()),
  dietaryPreferences: z.object({
    vegetarian: z.boolean().optional(),
    vegan: z.boolean().optional(),
    glutenFree: z.boolean().optional(),
    highProtein: z.boolean().optional(),
  }).optional(),
});

export async function handleAnalyzeIngredients(input: AnalyzeIngredientsInput): Promise<{ data: AnalyzeIngredientsOutput | null; error: string | null }> {
  const parsedInput = AnalyzeActionInputSchema.safeParse(input);

  if (!parsedInput.success) {
    const errorMessage = parsedInput.error.errors.map(e => e.message).join(", ");
    return { data: null, error: errorMessage };
  }

  try {
    const analysis = await analyzeIngredients(parsedInput.data);
    return { data: analysis, error: null };
  } catch (e) {
    console.error(e);
    return { data: null, error: "An unexpected error occurred during ingredient analysis." };
  }
}

const AnalyzeImageActionInputSchema = z.object({
    photoDataUri: z.string(),
    ingredientCatalog: z.array(z.string()),
});

export async function handleAnalyzeImage(input: AnalyzeImageInput): Promise<{ data: AnalyzeImageOutput | null; error: string | null }> {
    const parsedInput = AnalyzeImageActionInputSchema.safeParse(input);

    if (!parsedInput.success) {
        const errorMessage = parsedInput.error.errors.map(e => e.message).join(", ");
        return { data: null, error: errorMessage };
    }

    try {
        const result = await analyzeImage(parsedInput.data);
        return { data: result, error: null };
    } catch (e) {
        console.error(e);
        return { data: null, error: "An unexpected error occurred during image analysis." };
    }
}
