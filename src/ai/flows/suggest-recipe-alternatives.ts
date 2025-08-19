'use server';
/**
 * @fileOverview An AI agent that suggests alternative ingredients or variations for a given recipe.
 *
 * - suggestRecipeAlternatives - A function that handles the suggestion of recipe alternatives.
 * - SuggestRecipeAlternativesInput - The input type for the suggestRecipeAlternatives function.
 * - SuggestRecipeAlternativesOutput - The return type for the suggestRecipeAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipeAlternativesInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe.'),
  ingredients: z.array(z.string()).describe('The list of ingredients in the recipe.'),
  steps: z.array(z.string()).describe('The steps to prepare the recipe.'),
  dietaryPreferences: z
    .object({
      vegetarian: z.boolean().optional().describe('Whether the recipe should be vegetarian.'),
      vegan: z.boolean().optional().describe('Whether the recipe should be vegan.'),
      glutenFree: z.boolean().optional().describe('Whether the recipe should be gluten-free.'),
      highProtein: z.boolean().optional().describe('Whether the recipe should be high in protein.'),
    })
    .optional()
    .describe('Dietary preferences to consider when suggesting alternatives.'),
});
export type SuggestRecipeAlternativesInput = z.infer<
  typeof SuggestRecipeAlternativesInputSchema
>;

const SuggestRecipeAlternativesOutputSchema = z.object({
  alternativeSuggestions: z
    .array(z.string())
    .describe('A list of alternative ingredients or variations for the recipe.'),
});
export type SuggestRecipeAlternativesOutput = z.infer<
  typeof SuggestRecipeAlternativesOutputSchema
>;

export async function suggestRecipeAlternatives(
  input: SuggestRecipeAlternativesInput
): Promise<SuggestRecipeAlternativesOutput> {
  return suggestRecipeAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipeAlternativesPrompt',
  input: {schema: SuggestRecipeAlternativesInputSchema},
  output: {schema: SuggestRecipeAlternativesOutputSchema},
  prompt: `You are a recipe expert. Given the following recipe, suggest alternative ingredients or variations.

Recipe Name: {{{recipeName}}}
Ingredients: {{#each ingredients}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
Steps: {{#each steps}}{{{this}}}{{#unless @last}}\n{{/unless}}{{/each}}

Dietary Preferences: {{#if dietaryPreferences}}
  Vegetarian: {{dietaryPreferences.vegetarian}}
  Vegan: {{dietaryPreferences.vegan}}
  Gluten-Free: {{dietaryPreferences.glutenFree}}
  High-Protein: {{dietaryPreferences.highProtein}}
{{else}}
  None specified.
{{/if}}

Suggestions:`,
});

const suggestRecipeAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestRecipeAlternativesFlow',
    inputSchema: SuggestRecipeAlternativesInputSchema,
    outputSchema: SuggestRecipeAlternativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
