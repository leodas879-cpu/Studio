'use server';

/**
 * @fileOverview A flow for suggesting recipe alternatives.
 *
 * - suggestRecipeAlternatives - A function that suggests alternatives for a given recipe.
 * - SuggestRecipeAlternativesInput - The input type for the suggestRecipeAlternatives function.
 * - SuggestRecipeAlternativesOutput - The return type for the suggestRecipeAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeAlternativesInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to find alternatives for.'),
  ingredients: z.array(z.string()).describe('The list of ingredients in the original recipe.'),
  dietaryPreferences: z.object({
    vegetarian: z.boolean().optional(),
    vegan: z.boolean().optional(),
    glutenFree: z.boolean().optional(),
  }).optional(),
});
export type SuggestRecipeAlternativesInput = z.infer<typeof SuggestRecipeAlternativesInputSchema>;

const SuggestRecipeAlternativesOutputSchema = z.object({
  suggestions: z.array(z.object({
    alternativeName: z.string().describe('The name of the alternative recipe suggestion.'),
    description: z.string().describe('A brief description of why this is a good alternative.'),
    ingredientChanges: z.array(z.string()).describe('A list of changes to the ingredients.'),
  })),
});
export type SuggestRecipeAlternativesOutput = z.infer<typeof SuggestRecipeAlternativesOutputSchema>;

export async function suggestRecipeAlternatives(input: SuggestRecipeAlternativesInput): Promise<SuggestRecipeAlternativesOutput> {
  return suggestRecipeAlternativesFlow(input);
}

const suggestAlternativesPrompt = ai.definePrompt({
  name: 'suggestAlternativesPrompt',
  input: { schema: SuggestRecipeAlternativesInputSchema },
  output: { schema: SuggestRecipeAlternativesOutputSchema },
  prompt: `You are an expert chef who excels at creative recipe adaptations.
  
Given the following recipe name, ingredients, and dietary preferences, please suggest 3 creative alternatives. 

For each suggestion, provide a new recipe name, a short description, and the necessary ingredient changes.

Original Recipe: {{{recipeName}}}
Ingredients: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

{{#if dietaryPreferences}}
Dietary Preferences:
{{#if dietaryPreferences.vegetarian}} - Vegetarian{{/if}}
{{#if dietaryPreferences.vegan}} - Vegan{{/if}}
{{#if dietaryPreferences.glutenFree}} - Gluten-Free{{/if}}
{{/if}}

Please provide creative and appealing alternatives.
`,
});

const suggestRecipeAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestRecipeAlternativesFlow',
    inputSchema: SuggestRecipeAlternativesInputSchema,
    outputSchema: SuggestRecipeAlternativesOutputSchema,
  },
  async (input) => {
    const { output } = await suggestAlternativesPrompt(input);
    return output!;
  }
);
