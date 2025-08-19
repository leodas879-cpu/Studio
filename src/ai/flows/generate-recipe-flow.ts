'use server';

/**
 * @fileOverview Recipe generation flow that takes ingredients and dietary preferences as input and returns a tailored recipe.
 *
 * - generateRecipe - A function that handles the recipe generation process.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const getRecipeFromMealDBTool = ai.defineTool(
  {
    name: 'getRecipeFromMealDB',
    description: 'Get a recipe from TheMealDB API based on ingredients.',
    inputSchema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients to search for.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    try {
      // TheMealDB API allows searching by a main ingredient. We'll use the first one.
      const mainIngredient = input.ingredients[0];
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${mainIngredient}`);
      if (!response.ok) {
        return { error: 'Failed to fetch from TheMealDB' };
      }
      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        return { info: 'No recipes found for the primary ingredient.' };
      }
      
      // Fetch the full details of the first meal found
      const mealDetailsResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data.meals[0].idMeal}`);
      const mealDetailsData = await mealDetailsResponse.json();

      return mealDetailsData.meals[0];
    } catch (e) {
      console.error(e);
      return { error: 'An unexpected error occurred while fetching from TheMealDB.' };
    }
  }
);

const GenerateRecipeInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients available to use in the recipe.'),
  vegetarian: z.boolean().optional().describe('Whether the recipe should be vegetarian.'),
  vegan: z.boolean().optional().describe('Whether the recipe should be vegan.'),
  glutenFree: z.boolean().optional().describe('Whether the recipe should be gluten-free.'),
  highProtein: z.boolean().optional().describe('Whether the recipe should be high in protein.'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the generated recipe.'),
  steps: z.array(z.string()).describe('A list of steps to prepare the recipe.'),
  requiredIngredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  alternativeSuggestions: z.array(z.string()).describe('Alternative suggestions for the recipe, e.g., substitutions.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  tools: [getRecipeFromMealDBTool],
  prompt: `You are a world-class chef. Use the getRecipeFromMealDB tool to find a recipe based on the provided ingredients. 
  
If the tool returns a recipe, adapt it to meet the user's dietary preferences ({{vegetarian}}, {{vegan}}, {{glutenFree}}, {{highProtein}}). Extract the recipe name, create a list of required ingredients with their measurements, and format the instructions into clear steps. Also, provide alternative suggestions.

If the tool does not find a suitable recipe, generate a new one from scratch based on all the provided ingredients and dietary preferences.

Ingredients: {{ingredients}}
Vegetarian: {{vegetarian}}
Vegan: {{vegan}}
Gluten-Free: {{glutenFree}}
High-Protein: {{highProtein}}

Return the recipe in the specified JSON format.
`, 
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await generateRecipePrompt(input);
    return output!;
  }
);
