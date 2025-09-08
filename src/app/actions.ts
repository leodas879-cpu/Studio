
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
    
    // This is a successful response, regardless of compatibility, so return data.
    if (recipeData) {
      return { data: recipeData, error: null };
    }
    
    // This case should ideally not be reached if the AI flow is robust.
    return { data: null, error: "The AI failed to generate a response. Please try again with different options." };

  } catch (e: any) {
    console.error("Error in handleGenerateRecipe:", e);
    let errorMessage = "An unexpected error occurred while generating the recipe. Please try again later.";
    // Attempt to parse a more specific message if available
    if (e.message) {
      try {
        // Genkit sometimes wraps errors in a JSON string
        const errorObj = JSON.parse(e.message);
        if (errorObj.message) {
          errorMessage = `An error occurred: ${errorObj.message}`;
        }
      } catch (parseError) {
         errorMessage = `An unexpected error occurred: ${e.message}`;
      }
    }
    return { data: null, error: errorMessage };
  }
}
