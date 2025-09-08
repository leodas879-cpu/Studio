
'use server';
/**
 * @fileOverview An AI flow to validate ingredient combinations based on scientific and cultural rules.
 *
 * - validateIngredients - Checks if a list of ingredients is compatible.
 */

import { ai } from '@/ai/genkit';
import { recipeRules } from '@/lib/recipe-rules';
import {
  ValidateIngredientsInputSchema,
  ValidateIngredientsOutputSchema,
  type ValidateIngredientsInput,
  type ValidateIngredientsOutput,
} from '@/ai/schemas';

export async function validateIngredients(input: ValidateIngredientsInput): Promise<ValidateIngredientsOutput> {
  return validateIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateIngredientsPrompt',
  input: { schema: ValidateIngredientsInputSchema },
  output: { schema: ValidateIngredientsOutputSchema },
  prompt: `You are an expert culinary AI assistant that validates ingredient combinations.
Your primary responsibility is to apply science-based and cultural cooking logic.
Use the provided rules to determine if the user's selected ingredients are compatible.

### Ruleset ###
${JSON.stringify(recipeRules, null, 2)}
### End Ruleset ###

### User's Ingredients ###
{{ingredients}}

### Your Task ###
1.  Analyze the user's ingredients against the "rules" and "categories" in the ruleset.
2.  If you find an incompatibility (a broken rule), set "isValid" to false.
3.  Provide the "reason" from the broken rule.
4.  Suggest substitutions based on the "substitutions" field of the broken rule. Map the suggested substitute to the specific ingredient that needs to be replaced. For example if the rule is "Meat + Dairy", and the ingredients are "Chicken" and "Milk", the ingredient to replace is "Milk".
5.  Specify the "ruleType" ('hard' or 'soft') of the rule that was broken.
6.  If more than one rule is broken, prioritize the 'hard' rule.
7.  If all ingredients are compatible, set "isValid" to true and omit the other fields.
`,
});

const validateIngredientsFlow = ai.defineFlow(
  {
    name: 'validateIngredientsFlow',
    inputSchema: ValidateIngredientsInputSchema,
    outputSchema: ValidateIngredientsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to return a validation response.');
    }
    return output;
  }
);
