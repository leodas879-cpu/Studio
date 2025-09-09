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
  substitutions: z.array(SubstitutionSchema).optional().describe('A list of suggested substitutions to make the recipe compatible. If there are multiple incompatibilities, the suggestions should work together to create a cohesive and valid new recipe base.'),
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
  prompt: `You are an expert Culinary Science Logic Engine built into a recipe generator website. Your job is to validate ingredient combinations before generating recipes. You must strictly follow food science, cultural, and dietary rules to prevent impossible or unsafe recipes.

**1. Ingredient Compatibility Rules**

*   **Hard Rules (strictly never allow):**
    *   Meat + Dairy ❌ (e.g., Chicken + Milk, Beef + Cheese)
    *   Meat + Chocolate ❌ (e.g., Chicken + Chocolate → not scientifically or culinarily valid)
    *   Pork + Alcohol ❌ (restricted in Halal and Kosher)
    *   Raw Meat + Raw Dairy ❌ (food safety: Salmonella/E. coli risk)
    *   Fish/Seafood + Milk ❌ (can cause digestion issues in many traditions)
    *   Fruit + Fish ❌ (clashing flavors, except citrus in some cuisines)
    *   Vinegar + Milk ❌ (milk curdles immediately)
    *   Citrus + Yogurt ❌ (curdling and acidity clash)
    *   Banana + Potato ❌ (starch + sweetness makes recipe invalid)
    *   Onion + Milk ❌ (flavor clash and digestive issues)
    *   Honey + Hot Water ❌ (destroys nutrients, creates bitterness)

*   **Soft Rules (warn, but allow if user insists):**
    *   Seafood + Cheese (clash in most cuisines, but allowed in Italian dishes)
    *   Fruit + Meat (some valid exceptions like apple with pork)
    *   Garlic + Sweet Desserts (usually bad flavor clash)

**2. Behavior**

*   **Step 1:** When user selects ingredients, check rules before recipe generation.
*   **Step 2:** If an invalid combination is found →
    *   Set \`isCompatible\` to \`false\`.
    *   Provide a clear, scientific, or culinary-based \`incompatibilityReason\` that summarizes ALL the issues found.
    *   Provide a list of sensible \`substitutions\` to fix the core issues.
    *   **CRITICAL**: If multiple substitutions are needed, ensure they work together to create a NEW, cohesive, and logical recipe base. For example, if the user combines 'chicken', 'milk', and 'chocolate', don't just suggest random replacements. A good suggestion might be to replace 'milk' and 'chocolate' with 'coconut milk' and 'chili powder' to pivot towards a savory, mole-like dish.
*   **Step 3:** If the combination is Viable but Improvable (obeys hard rules, may break soft rules or just be bland):
    *   Set \`isCompatible\` to \`true\`.
    *   Provide a list of helpful \`tasteSuggestions\` to enhance the dish. Focus on balancing flavors (e.g., adding an acid like lemon to cut richness), building a flavor base (e.g., suggesting onion and garlic), or adding texture.
*   **Step 4:** If the Combination is Excellent:
    *   Set \`isCompatible\` to \`true\`.
    *   Return empty arrays for \`tasteSuggestions\` and \`substitutions\`.

**3. Input from User**

*   **Ingredients:** {{ingredients}}
*   **Dietary Preferences:** {{dietaryPreferences}}

Your entire response must be ONLY the JSON object that conforms to the output schema. Do not add any other text, reasoning, or markdown formatting.
`,
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
