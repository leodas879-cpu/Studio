import { z } from 'genkit';

/**
 * @fileOverview
 * This file contains the Zod schemas for the AI flows.
 * Separating schemas into their own file allows them to be imported
 * into both client and server components without running into "use server"
 * directive conflicts.
 */

export const ValidateIngredientsInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to validate.'),
});
export type ValidateIngredientsInput = z.infer<typeof ValidateIngredientsInputSchema>;

export const ValidateIngredientsOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the combination is valid.'),
  reason: z.string().optional().describe('The reason why the combination is invalid.'),
  substitutions: z
    .array(
      z.object({
        ingredientToReplace: z.string(),
        substitute: z.string(),
      })
    )
    .optional()
    .describe('Suggested substitutions if the combination is invalid.'),
  ruleType: z.enum(['hard', 'soft']).optional().describe('The type of rule that was broken (hard or soft).'),
});
export type ValidateIngredientsOutput = z.infer<typeof ValidateIngredientsOutputSchema>;
