
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
    description: 'Get a recipe from TheMealDB API based on ingredients. Only use this if you cannot generate a recipe from the user provided ingredients.',
    inputSchema: z.object({
      ingredients: z.array(z.string()).describe('A list of ingredients to search for.'),
    }),
    outputSchema: z.any(),
  },
  async (input) => {
    try {
      // TheMealDB API allows searching by a main ingredient. We'll use the first one.
      const mainIngredient = input.ingredients[0];
      const response = await fetch("https://www.themealdb.com/api/json/v1/1/filter.php?i=" + mainIngredient);
      if (!response.ok) {
        return { error: 'Failed to fetch from TheMealDB' };
      }
      const data = await response.json();

      if (!data.meals || data.meals.length === 0) {
        return { info: 'No recipes found for the primary ingredient.' };
      }
      
      // Fetch the full details of the first meal found
      const mealDetailsResponse = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + data.meals[0].idMeal);
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
  recipeName: z.string().describe('The name of the generated recipe.').optional(),
  steps: z.array(z.string()).describe('A list of detailed, step-by-step instructions to prepare the recipe. Each step should be very descriptive, explaining the what, how, and why. Mention expected colors, textures, and cooking times.').optional(),
  requiredIngredients: z.array(z.string()).describe('A list of ingredients required for the recipe, including measurements.').optional(),
  alternativeSuggestions: z.array(z.string()).describe('Alternative suggestions for the recipe, e.g., substitutions or variations.').optional(),
  isCompatible: z.boolean().describe('Whether the provided ingredients are compatible.'),
  compatibilityIssue: z.string().describe("If isCompatible is false, a detailed explanation of why the ingredients are not compatible.").optional(),
  suggestedSubstitutions: z.array(z.string()).describe("If isCompatible is false, a list of suggested substitutions.").optional(),
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
  prompt: `You are ChefAI, an advanced culinary assistant. Your job is to apply science-based cooking logic to validate ingredient compatibility and then generate a recipe.

First, analyze the user's selected ingredients for compatibility based on scientific, cultural, and dietary rules.
- Hard Restrictions (always block):
  - Meat + Dairy (e.g., Chicken + Milk/Cheese): Incompatible in Kosher traditions and can cause digestive issues for some.
  - Fish + Dairy: Often avoided due to flavor clashes and potential digestive issues.
  - Pork + Alcohol: Not compatible in Halal and Kosher diets.
  - Bitter Gourd + Dairy: Can cause digestive issues.

If the ingredients are NOT compatible:
- Set "isCompatible" to false.
- Provide a clear, friendly explanation in "compatibilityIssue".
- Provide a list of safe, logical substitutions in "suggestedSubstitutions".
- Do NOT generate a recipe. Do NOT include recipeName, steps, or other recipe fields.

If the ingredients ARE compatible:
- Set "isCompatible" to true.
- Generate a creative, delicious recipe.
- If you are unable to generate a recipe from the given ingredients, you may use the getRecipeFromMealDBTool to find a base recipe. If the tool returns a recipe, you must adapt it to meet the user's dietary preferences ({{vegetarian}}, {{vegan}}, {{glutenFree}}, {{highProtein}}). Extract the recipe name, create a list of required ingredients with their measurements, and then write a new set of very detailed, step-by-step cooking instructions.

User's Ingredients: {{ingredients}}
Dietary Preferences:
- Vegetarian: {{vegetarian}}
- Vegan: {{vegan}}
- Gluten-Free: {{glutenFree}}
- High-Protein: {{highProtein}}

IMPORTANT: Your entire response must be ONLY the valid JSON object that conforms to the output schema. Do not add any other text, reasoning, or markdown formatting. Your entire response must be only the JSON object.
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
