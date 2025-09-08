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
  prompt: `You are an expert culinary scientist and chef with a deep understanding of food chemistry, flavor profiles, and global cuisines. Analyze the provided list of ingredients based on these core principles.

Ingredients: {{ingredients}}
Dietary Preferences: {{dietaryPreferences}}

Your task is to determine if these ingredients can be realistically combined to create a palatable and appealing recipe.

**Rules:**
1.  **Analyze for Incompatibilities:** Based on your expert knowledge, identify any fundamental incompatibilities. These could be due to:
    *   **Severe Flavor Clashes:** Pairings that are overwhelmingly bitter, sour, or otherwise unpleasant (e.g., Bitter Gourd and Coffee).
    *   **Negative Chemical Reactions:** Combinations that would curdle, separate, or create a bad texture (e.g., high-acid ingredients with dairy without a stabilizing agent).
    *   **Common Culinary Anti-Patterns:** Widely accepted pairings to avoid in most cuisines (e.g., seafood and dairy).
    *   **Dietary Violations:** Ingredients that violate the user's stated dietary preferences (e.g., meat for a vegetarian).
2.  **If an Incompatibility is Found:**
    *   Set \`isCompatible\` to \`false\`.
    *   Provide a clear, scientific, or culinary-based \`incompatibilityReason\`.
    *   Provide a list of sensible \`substitutions\` to fix the core issue.
3.  **If the Combination is Viable but Improvable:**
    *   Set \`isCompatible\` to \`true\`.
    *   Provide a list of helpful \`tasteSuggestions\` to enhance the dish. Focus on balancing flavors (e.g., adding an acid like lemon to cut richness), building a flavor base (e.g., suggesting onion and garlic), or adding texture.
4.  **If the Combination is Excellent:**
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
