
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
import { recipeRules } from '@/lib/recipe-rules';


const MealDBDetailsSchema = z.object({
  idMeal: z.string(),
  strMeal: z.string(),
  strInstructions: z.string(),
  strMealThumb: z.string().url(),
  strYoutube: z.string().url().nullish(),
  strIngredient1: z.string().nullish(),
  strIngredient2: z.string().nullish(),
  strIngredient3: z.string().nullish(),
  strIngredient4: z.string().nullish(),
  strIngredient5: z.string().nullish(),
  strIngredient6: z.string().nullish(),
  strIngredient7: z.string().nullish(),
  strIngredient8: z.string().nullish(),
  strIngredient9: z.string().nullish(),
  strIngredient10: z.string().nullish(),
  strIngredient11: z.string().nullish(),
  strIngredient12: z.string().nullish(),
  strIngredient13: z.string().nullish(),
  strIngredient14: z.string().nullish(),
  strIngredient15: z.string().nullish(),
  strIngredient16: z.string().nullish(),
  strIngredient17: z.string().nullish(),
  strIngredient18: z.string().nullish(),
  strIngredient19: z.string().nullish(),
  strIngredient20: z.string().nullish(),
  strMeasure1: z.string().nullish(),
  strMeasure2: z.string().nullish(),
  strMeasure3: z.string().nullish(),
  strMeasure4: z.string().nullish(),
  strMeasure5: z.string().nullish(),
  strMeasure6: z.string().nullish(),
  strMeasure7: z.string().nullish(),
  strMeasure8: z.string().nullish(),
  strMeasure9: z.string().nullish(),
  strMeasure10: z.string().nullish(),
  strMeasure11: z.string().nullish(),
  strMeasure12: z.string().nullish(),
  strMeasure13: z.string().nullish(),
  strMeasure14: z.string().nullish(),
  strMeasure15: z.string().nullish(),
  strMeasure16: z.string().nullish(),
  strMeasure17: z.string().nullish(),
  strMeasure18: z.string().nullish(),
  strMeasure19: z.string().nullish(),
  strMeasure20: z.string().nullish(),
});

const getRecipeFromMealDBTool = ai.defineTool(
  {
    name: 'getRecipeFromMealDB',
    description: "Get a real, existing recipe from TheMealDB API. Use this as a fallback if you can't generate a good one from scratch.",
    inputSchema: z.object({
      ingredient: z.string().describe('A single primary ingredient to search for.'),
    }),
    outputSchema: z.object({
      recipe: MealDBDetailsSchema.optional(),
    }),
  },
  async (input) => {
    try {
      const filterResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${input.ingredient}`);
      if (!filterResponse.ok) return { recipe: undefined };
      const filterData = await filterResponse.json();

      if (!filterData.meals || filterData.meals.length === 0) {
        return { recipe: undefined };
      }
      
      const mealDetailsResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${filterData.meals[0].idMeal}`);
       if (!mealDetailsResponse.ok) return { recipe: undefined };
      const mealDetailsData = await mealDetailsResponse.json();
      
      if (!mealDetailsData.meals || mealDetailsData.meals.length === 0) {
          return { recipe: undefined };
      }

      return { recipe: mealDetailsData.meals[0] };
    } catch (e) {
      console.error(e);
      // Don't throw, just return undefined so the AI can handle it.
      return { recipe: undefined };
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
  steps: z.array(z.string()).describe('A list of detailed, step-by-step instructions to prepare the recipe. Each step should be very descriptive, explaining the what, how, and why. Mention expected colors, textures, and cooking times.'),
  requiredIngredients: z.array(z.string()).describe('A list of ingredients required for the recipe, including measurements.'),
  alternativeSuggestions: z.array(z.string()).describe('Alternative suggestions for the recipe, e.g., substitutions or variations.'),
  substitutionWarning: z.string().optional().describe('A warning message if an ingredient was substituted due to the science logic rules.'),
  youtubeLink: z.string().url().optional().describe('A link to a YouTube tutorial for the recipe, if available.'),
  imageUrl: z.string().url().optional().describe('URL of a generated image for the recipe.'),
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
  prompt: `You are a world-class chef AI. Your goal is to create a delicious, safe, and logical recipe based on the user's ingredients and preferences.

### Instructions
1.  **Analyze the user's request**:
    *   Ingredients: {{ingredients}}
    *   Dietary Preferences: Vegetarian: {{vegetarian}}, Vegan: {{vegan}}, Gluten-Free: {{glutenFree}}, High-Protein: {{highProtein}}

2.  **Generate a Recipe from Scratch**: First, try to create a high-quality, original recipe using the provided ingredients and respecting all dietary preferences. The instructions must be detailed and easy for a home cook to follow.

3.  **Fallback to Tool**: If and only if you absolutely cannot create a recipe from scratch, use the \`getRecipeFromMealDBTool\` with the most prominent ingredient from the user's list.
    *   If the tool returns a recipe, **adapt it**. Do not just copy it.
    *   Modify the recipe from the tool to meet all of the user's dietary preferences.
    *   Rewrite the instructions to be more detailed and clear.
    *   Extract the ingredients and measurements.
    *   If the tool provides a YouTube link, include it in your final output.

4.  **Final Output**: You must only output a valid JSON object that conforms to the output schema. Do not add any other text, reasoning, or markdown formatting. Your entire response should be only the JSON object.
`, 
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const llmResponse = await generateRecipePrompt(input);
    const recipe = llmResponse.output;

    if (!recipe) {
      throw new Error("Could not generate a recipe from the given ingredients. The model did not return a valid output.");
    }
    
    // Fallback if the AI fails to generate a recipe but doesn't use the tool.
    if (!recipe.recipeName || recipe.steps.length === 0) {
        const fallbackResult = await getRecipeFromMealDBTool({ ingredient: input.ingredients[0] });
        if (fallbackResult.recipe) {
            // A simplified conversion from MealDB to our schema.
            // This could be made more robust.
            const meal = fallbackResult.recipe;
            return {
                recipeName: meal.strMeal,
                steps: meal.strInstructions.split('\r\n').filter(s => s.trim() !== ''),
                requiredIngredients: Object.entries(meal)
                    .filter(([key, value]) => key.startsWith('strIngredient') && value)
                    .map(([key, value]) => {
                        const measureKey = `strMeasure${key.replace('strIngredient', '')}` as keyof typeof meal;
                        const measure = meal[measureKey];
                        return `${measure} ${value}`;
                    }),
                alternativeSuggestions: [],
                youtubeLink: meal.strYoutube || undefined,
                imageUrl: meal.strMealThumb,
                substitutionWarning: 'The AI chef had to look up a recipe for you. This one is from TheMealDB.'
            };
        }
    }


    if (!recipe) {
      throw new Error("The AI failed to generate a recipe. Please try again with different ingredients.");
    }
    
    return recipe;
  }
);
