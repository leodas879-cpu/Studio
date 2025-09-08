'use server';

/**
 * @fileOverview An AI agent that analyzes a list of ingredients for compatibility and taste.
 * 
 * - analyzeIngredients - A function that handles the ingredient analysis.
 * - AnalyzeIngredientsInput - The input type for the analyzeIngredients function.
 * - AnalyzeIngredientsOutput - The return type for the analyzeIngredients function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeIngredientsInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to analyze.'),
  dietaryPreferences: z
    .object({
      vegetarian: z.boolean().optional(),
      vegan: z.boolean().optional(),
      glutenFree: z.boolean().optional(),
      highProtein: z.boolean().optional(),
    })
    .optional()
    .describe('User\'s dietary preferences.'),
});
export type AnalyzeIngredientsInput = z.infer<typeof AnalyzeIngredientsInputSchema>;

const SubstitutionSchema = z.object({
    ingredientToReplace: z.string().describe('The incompatible ingredient to be replaced.'),
    suggestion: z.string().describe('The suggested ingredient to use instead.'),
    reason: z.string().describe('A brief reason why this substitution is recommended.'),
});

const TasteSuggestionSchema = z.object({
    suggestion: z.string().describe('A suggested ingredient to add for better taste.'),
    reason: z.string().describe('A brief reason why this addition would improve the dish.'),
});

const AnalyzeIngredientsOutputSchema = z.object({
  isCompatible: z.boolean().describe('Whether the combination of ingredients is viable for a recipe.'),
  incompatibilityReason: z.string().optional().describe('If not compatible, the reason why.'),
  substitutions: z.array(SubstitutionSchema).optional().describe('A list of suggested substitutions to make the recipe compatible.'),
  tasteSuggestions: z.array(TasteSuggestionSchema).optional().describe('A list of suggestions to improve the taste profile of the recipe, even if it is compatible.'),
});
export type AnalyzeIngredientsOutput = z.infer<typeof AnalyzeIngredientsOutputSchema>;

export async function analyzeIngredients(input: AnalyzeIngredientsInput): Promise<AnalyzeIngredientsOutput> {
  return analyzeIngredientsFlow(input);
}

const analyzeIngredientsPrompt = ai.definePrompt({
  name: 'analyzeIngredientsPrompt',
  input: {schema: AnalyzeIngredientsInputSchema},
  output: {schema: AnalyzeIngredientsOutputSchema},
  prompt: `You are an expert culinary scientist. Analyze the provided list of ingredients based on culinary science, taste profiles, and dietary restrictions.

Ingredients: {{ingredients}}
Dietary Preferences: {{dietaryPreferences}}

Your task is to determine if these ingredients can be realistically combined to create a good recipe.

**Rules:**
1.  **Check for hard incompatibilities:**
    *   Meat + Dairy (e.g., Chicken + Milk/Cheese): Flag as incompatible due to common dietary laws (Kosher) and potential digestive issues.
    *   Seafood + Dairy: Flag as incompatible for similar reasons, as it's a common culinary anti-pattern.
    *   Bitter Gourd + Milk: Flag as incompatible.
    *   Any other scientifically or culinarily nonsensical pairings.
2.  **Check for dietary preference violations:**
    *   If vegetarian is true, flag any meat or fish.
    *   If vegan is true, flag any animal products (meat, dairy, eggs, honey).
3.  **If an incompatibility is found:**
    *   Set \`isCompatible\` to \`false\`.
    *   Provide a clear \`incompatibilityReason\`.
    *   Provide a list of \`substitutions\`. For example, if the user has chicken and milk, suggest replacing milk with coconut milk or oat milk.
4.  **If the combination is compatible but could be improved:**
    *   Set \`isCompatible\` to \`true\`.
    *   Provide a list of \`tasteSuggestions\` to make the dish better. For example, if the user only has chicken and rice, suggest adding onions, garlic, and herbs for a flavor base. Suggest adding a vegetable for balance.
5.  **If the combination is compatible and well-balanced:**
    *   Set \`isCompatible\` to \`true\`.
    *   Return empty arrays for \`tasteSuggestions\` and \`substitutions\`.

Your entire response must be ONLY the JSON object that conforms to the output schema. Do not add any other text, reasoning, or markdown formatting.`,
});

const analyzeIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeIngredientsFlow',
    inputSchema: AnalyzeIngredientsInputSchema,
    outputSchema: AnalyzeIngredientsOutputSchema,
  },
  async input => {
    const {output} = await analyzeIngredientsPrompt(input);
    return output!;
  }
);
