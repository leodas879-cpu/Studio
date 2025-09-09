
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
  recipeName: z.string().describe('The name of the generated recipe. Should be culturally relevant, e.g., "South Indian Lemon Rice".'),
  cuisine: z.string().describe('The cuisine of the dish, e.g., "Indian".'),
  requiredIngredients: z.array(
    z.object({
      name: z.string().describe('Name of the ingredient.'),
      quantity: z.string().describe('Measurement of the ingredient, e.g., "1 cup, rinsed and soaked for 20 minutes".'),
    })
  ).describe('A list of all ingredients required for the recipe with their precise measurements.'),
  steps: z.array(z.string()).describe('A list of 5-8 detailed, step-by-step instructions to prepare the recipe. Explain what to do and how, including timings and sensory cues.'),
  servingSuggestions: z.string().describe('1-2 sentences on how to serve the dish, e.g., "Serve hot with raita or dal."'),
  prepTime: z.string().describe('Estimated preparation time in minutes.'),
  cookTime: z.string().describe('Estimated cooking time in minutes.'),
  servings: z.string().describe('Number of servings the recipe makes.'),
  alternativeSuggestions: z.array(z.string()).optional().describe('Alternative suggestions for the recipe, e.g., substitutions.'),
});

export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  // Map the new output to the old structure for compatibility until UI is updated
  const flowResult = await generateRecipeFlow(input);
  return {
    ...flowResult,
    requiredIngredients: flowResult.requiredIngredients.map(i => `${i.quantity} ${i.name}`),
  };
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {
    schema: z.object({
      recipeName: z.string(),
      cuisine: z.string(),
      requiredIngredients: z.array(z.object({ name: z.string(), quantity: z.string() })),
      steps: z.array(z.string()),
      servingSuggestions: z.string(),
      prepTime: z.string(),
      cookTime: z.string(),
      servings: z.string(),
    })
  },
  tools: [getRecipeFromMealDBTool],
  prompt: `You are a world-class Indian chef specializing in rice-based dishes, known for crafting authentic, flavorful, and easy-to-follow recipes for home cooks. Your goal is to generate a detailed Indian rice recipe (e.g., Jeera Rice, Lemon Rice, Vegetable Pulao, or Biryani) based on the user's provided ingredients and dietary preferences. Use the getRecipeFromMealDB tool to find a base Indian rice recipe if possible.

**Instructions:**

1. **Recipe Selection and Adaptation:**
   - If the user’s ingredients include rice (especially basmati), prioritize generating an Indian rice dish such as Jeera Rice, Lemon Rice, Vegetable Pulao, or Vegetable Biryani.
   - If the getRecipeFromMealDB tool returns a suitable Indian rice recipe, adapt it to align with the user’s dietary preferences ({{vegetarian}}, {{vegan}}, {{glutenFree}}, {{highProtein}}). For example, replace ghee with coconut oil for vegan diets or ensure gluten-free ingredients.
   - If no suitable recipe is found, create a new Indian rice recipe from scratch using the provided ingredients, ensuring it reflects authentic Indian culinary techniques (e.g., tempering spices, soaking basmati rice).

2. **Cultural Authenticity:**
   - Use traditional Indian ingredients like basmati rice, cumin seeds, cardamom, cloves, turmeric, curry leaves, ghee, or coconut oil, as appropriate for the dish and dietary preferences.
   - Incorporate regional nuances: For South Indian dishes (e.g., Lemon Rice), include ingredients like curry leaves, mustard seeds, or urad dal. For North Indian dishes (e.g., Jeera Rice, Biryani), emphasize cumin, saffron, or ghee.
   - Suggest ingredient substitutions for unavailable items (e.g., cumin for caraway seeds, vegetable oil for ghee in vegan recipes) to ensure accessibility.

3. **Recipe Structure:**
   - **Recipe Name:** Provide a clear, culturally relevant name (e.g., “South Indian Lemon Rice” or “Vegetable Biryani”).
   - **Ingredients List:** List all required ingredients with precise measurements (e.g., “1 cup basmati rice, rinsed and soaked for 20 minutes,” “1 tsp cumin seeds,” “2 tbsp ghee or coconut oil”). Include optional garnishes like chopped cilantro or roasted cashews.
   - **Step-by-Step Instructions:** Write 5–8 detailed steps, explaining not just what to do but how to do it. For example, instead of “cook rice,” write “Rinse 1 cup basmati rice under cold water until the water runs clear, then soak for 20 minutes. In a medium saucepan, bring 2 cups water to a boil, add the drained rice, reduce heat to low, cover, and simmer for 15 minutes until fluffy.”
   - **Visual and Sensory Cues:** Include specific timings, temperatures, and visual indicators (e.g., “Sauté cumin seeds in ghee over medium heat for 30 seconds until they sizzle and turn aromatic”).
   - **Serving Suggestions:** Add 1–2 sentences on how to serve (e.g., “Serve hot with raita or dal for a complete meal”).

4. **Dietary and Ingredient Handling:**
   - Check the provided ingredients ({{ingredients}}) for compatibility with Indian rice dishes. If critical ingredients (e.g., spices) are missing, suggest common additions like cumin or turmeric and explain their role.
   - Respect dietary preferences:
     - Vegetarian: Exclude meat or fish.
     - Vegan: Replace ghee with plant-based oils (e.g., coconut oil) and avoid dairy.
     - Gluten-Free: Ensure no wheat-based ingredients (e.g., avoid naan as a side).
     - High-Protein: Include protein-rich ingredients like lentils, chickpeas, or paneer (or tofu for vegan).
   - If the user’s ingredients are insufficient, generate a recipe using as many provided ingredients as possible, supplementing with standard Indian staples.

5. **Performance Optimization:**
   - Keep the response concise to ensure fast processing by the AI and quick rendering in the app.
   - Avoid overly complex steps or rare ingredients that may slow down user interaction or require excessive API calls.

**Input Parameters:**
- Ingredients: {{ingredients}}
- Vegetarian: {{vegetarian}}
- Vegan: {{vegan}}
- Gluten-Free: {{glutenFree}}
- High-Protein: {{highProtein}}
`, 
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: z.object({
        recipeName: z.string(),
        cuisine: z.string(),
        requiredIngredients: z.array(z.object({ name: z.string(), quantity: z.string() })),
        steps: z.array(z.string()),
        servingSuggestions: z.string(),
        prepTime: z.string(),
        cookTime: z.string(),
        servings: z.string(),
    }),
  },
  async input => {
    const {output} = await generateRecipePrompt(input);
    return output!;
  }
);

// A wrapper to maintain compatibility with the old simple-string array for ingredients.
// This can be removed once the entire app is updated to use the new structured ingredient format.
const adaptToOldSchema = (
  newOutput: z.infer<ReturnType<typeof generateRecipeFlow>['outputSchema']>
): GenerateRecipeOutput => {
  return {
    recipeName: newOutput.recipeName,
    requiredIngredients: newOutput.requiredIngredients.map(
      (ing) => `${ing.quantity} ${ing.name}`
    ),
    steps: newOutput.steps,
    alternativeSuggestions: [], // Or adapt from new schema if available
    vegetarian: false, // These fields are not in the new schema, will need to be handled differently
    vegan: false,
    glutenFree: false,
  };
};
