
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
import { generateRecipeImage } from './generate-recipe-image-flow';

// Schema for the data returned by TheMealDB API
const MealDBRecipeSchema = z.object({
  idMeal: z.string(),
  strMeal: z.string(),
  strInstructions: z.string(),
  strMealThumb: z.string().url(),
  strYoutube: z.string().url().optional(),
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
    description: 'Get a recipe from TheMealDB API based on a main ingredient. Use this as a fallback if you cannot generate a recipe yourself.',
    inputSchema: z.object({
      ingredient: z.string().describe('A single main ingredient to search for.'),
    }),
    outputSchema: z.array(MealDBRecipeSchema).optional(),
  },
  async (input) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${input.ingredient}`);
      if (!response.ok) return undefined;
      const data = await response.json();

      if (!data.meals || data.meals.length === 0) return undefined;
      
      const mealDetailsPromises = data.meals.slice(0, 1).map((meal: any) => 
        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`)
          .then(res => res.json())
          .then(d => d.meals ? d.meals[0] : null)
      );
      
      const detailedMeals = await Promise.all(mealDetailsPromises);
      return detailedMeals.filter(m => m);

    } catch (e) {
      console.error(e);
      return undefined;
    }
  }
);

const getNutritionInfoTool = ai.defineTool(
    {
        name: 'getNutritionInfo',
        description: 'Get nutritional information for a given ingredient from the USDA FoodData Central API.',
        inputSchema: z.object({
            ingredient: z.string().describe('The ingredient to get nutrition info for.'),
        }),
        outputSchema: z.object({
            calories: z.number().optional(),
            protein: z.number().optional(),
            carbs: z.number().optional(),
            fat: z.number().optional(),
        }).optional(),
    },
    async (input) => {
        try {
            const apiKey = process.env.USDA_API_KEY;
            if (!apiKey) return undefined;

            const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(input.ingredient)}&pageSize=1`);
            if (!response.ok) return undefined;

            const data = await response.json();
            const food = data.foods?.[0];
            if (!food) return undefined;

            const nutrients = food.foodNutrients;
            const getNutrientValue = (id: number) => {
                const nutrient = nutrients.find((n: any) => n.nutrientId === id);
                return nutrient?.value;
            };

            return {
                calories: getNutrientValue(1008), // Energy in kcal
                protein: getNutrientValue(1003),  // Protein
                carbs: getNutrientValue(1005),   // Carbohydrate, by difference
                fat: getNutrientValue(1004),       // Total lipid (fat)
            };
        } catch (error) {
            console.error('Error fetching nutrition info:', error);
            return undefined;
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
  requiredIngredients: z.array(z.string()).describe('A list of all ingredients with measurements required for the recipe.'),
  alternativeSuggestions: z.array(z.string()).optional().describe('Alternative suggestions or variations for the recipe, e.g., ingredient substitutions.'),
  substitutionWarning: z.string().optional().describe("A warning message if an ingredient was substituted due to a rule conflict."),
  nutrition: z.object({
    calories: z.number().optional(),
    protein: z.number().optional(),
    carbs: z.number().optional(),
    fat: z.number().optional(),
  }).optional().describe("Total nutritional information for the recipe."),
  youtubeLink: z.string().url().optional().describe("A link to a YouTube tutorial for the recipe, if available."),
  imageUrl: z.string().url().optional().describe("A URL for an image of the recipe."),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  tools: [getRecipeFromMealDBTool, getNutritionInfoTool],
  prompt: `You are a world-class chef who specializes in creating recipes with a deep understanding of food science. Your task is to generate a recipe based on the user's provided ingredients and dietary preferences.

**Your Process:**

1.  **Analyze Ingredients & Rules:**
    *   User's ingredients: {{ingredients}}
    *   Dietary preferences: Vegetarian: {{vegetarian}}, Vegan: {{vegan}}, Gluten-Free: {{glutenFree}}, High-Protein: {{highProtein}}.
    *   **Science Rules (CRITICAL):**
        *   **Invalid Combinations:** DO NOT use these pairs in a recipe: ${JSON.stringify(recipeRules.invalid_combinations)}. If you see them, you MUST replace one using the substitutes list.
        *   **Preferred Combinations:** TRY to use these combinations: ${JSON.stringify(recipeRules.preferred_combinations)}.
        *   **Substitutes:** If you must replace an ingredient, use one from this list: ${JSON.stringify(recipeRules.substitutes)}. If you make a substitution, you MUST set the 'substitutionWarning' field to explain what you did (e.g., "Milk was replaced with yogurt due to a dairy-meat conflict.").

2.  **Generate Recipe:**
    *   Create a recipe from scratch using the user's ingredients and adhering to all rules.
    *   The recipe should be creative and delicious.
    *   Write clear, easy-to-follow steps.

3.  **Fetch Nutritional Info:**
    *   For EACH of the final required ingredients in your recipe, use the \`getNutritionInfoTool\` to get its nutritional data.
    *   Sum up the total calories, protein, carbs, and fat for the entire dish and populate the 'nutrition' field.

4.  **Fallback (only if you fail):**
    *   If and only if you absolutely cannot create a recipe from scratch, use the \`getRecipeFromMealDBTool\` with the most prominent ingredient (e.g., '{{ingredients[0]}}').
    *   If the tool returns a recipe, adapt its name, ingredients, and steps. You still need to apply all science rules, dietary preferences, and fetch nutritional data for the adapted recipe. Set the 'youtubeLink' if the tool provides one.

5.  **Final Output:**
    *   Return a single, complete recipe in the specified JSON format. Do not worry about generating an image, that will be handled separately.
`, 
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const { output } = await generateRecipePrompt(input);
    
    if (!output || !output.recipeName) {
       throw new Error("The AI failed to generate a recipe with the selected ingredients. Please try different ingredients or preferences.");
    }
    
    // Generate the image after the recipe is created
    const imageUrl = await generateRecipeImage(output.recipeName);
    output.imageUrl = imageUrl;
    
    return output;
  }
);
