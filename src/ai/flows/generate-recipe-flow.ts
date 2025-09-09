
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
  recipeName: z.string().describe('The name of the generated recipe. Should be creative and appealing.'),
  cuisine: z.string().describe('The cuisine of the dish, e.g., "Italian", "Mexican", "Fusion".'),
  requiredIngredients: z.array(
    z.object({
      name: z.string().describe('Name of the ingredient.'),
      quantity: z.string().describe('Measurement of the ingredient, e.g., "1 cup", "200g".'),
    })
  ).describe('A list of all ingredients required for the recipe with their precise measurements.'),
  steps: z.array(z.string()).describe('A list of 5-8 detailed, step-by-step instructions to prepare the recipe. Explain what to do and how, including timings and sensory cues.'),
  servingSuggestions: z.string().describe('1-2 sentences on how to serve the dish, e.g., "Serve hot with a side of garlic bread."'),
  prepTime: z.string().describe('Estimated preparation time in minutes.'),
  cookTime: z.string().describe('Estimated cooking time in minutes.'),
  servings: z.string().describe('Number of servings the recipe makes.'),
  alternativeSuggestions: z.array(z.string()).optional().describe('Alternative suggestions for the recipe, e.g., substitutions or variations.'),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

// This function remains for backward compatibility within the app if needed,
// but the flow now returns the structured object.
export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}


const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: { schema: GenerateRecipeOutputSchema },
  tools: [getRecipeFromMealDBTool],
  prompt: `You are a world-class chef, a culinary artist who can craft amazing dishes from any combination of ingredients. Your goal is to generate a creative, delicious, and easy-to-follow recipe based on the user's provided ingredients and dietary preferences. You can try using the getRecipeFromMealDB tool to find a base recipe for inspiration.

**Instructions:**

1.  **Analyze and Create:**
    -   Look at the user's ingredients ({{ingredients}}). If the getRecipeFromMealDB tool provides a relevant recipe, use it as a starting point.
    -   If the tool doesn't help or the ingredients are unusual, invent a new recipe from scratch. Be creative! Think about flavor pairings, textures, and cooking techniques. The cuisine can be anything from Italian to Fusion to a simple home-style meal.
    -   Adapt the recipe strictly based on the user's dietary preferences ({{vegetarian}}, {{vegan}}, {{glutenFree}}, {{highProtein}}). This is a hard constraint.

2.  **Recipe Structure (Crucial):**
    -   **recipeName:** Give it a creative and descriptive name (e.g., "Spicy Garlic Shrimp with Lemon Butter Pasta," "Creamy Tuscan Sun-Dried Tomato Chicken").
    -   **cuisine:** Specify the cuisine (e.g., "Italian," "Mexican," "Fusion," "Modern American").
    -   **requiredIngredients:** List all necessary ingredients with precise measurements (e.g., name: "Chicken Breast", quantity: "2 boneless, skinless").
    -   **steps:** Write 5-8 clear, detailed, step-by-step instructions. Explain the "how" and "why" (e.g., "Sauté onions over medium heat for 5-7 minutes until translucent and fragrant to build a flavor base."). Include timings and sensory cues (e.g., "cook until golden brown," "simmer until the sauce thickens").
    -   **servingSuggestions:** Briefly describe how to best serve the dish (e.g., "Serve hot over a bed of jasmine rice, garnished with fresh cilantro.").
    -   **prepTime / cookTime / servings:** Provide realistic estimates.

3.  **Ingredient Handling:**
    -   If the user's ingredients are sparse, feel free to supplement them with common pantry staples (like salt, pepper, oil, water, garlic, onion) to make a complete recipe. Clearly list these in the 'requiredIngredients'.
    -   If you suggest alternative ingredients or variations, list them in the 'alternativeSuggestions' field.

4.  **Performance:**
    -   Keep your response concise and structured to ensure the app can process and display it quickly.

**Input Parameters:**
-   Ingredients: {{ingredients}}
-   Vegetarian: {{vegetarian}}
-   Vegan: {{vegan}}
-   Gluten-Free: {{glutenFree}}
-   High-Protein: {{highProtein}}
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
