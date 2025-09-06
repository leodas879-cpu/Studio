'use server';
/**
 * @fileOverview A flow for generating a recipe image using an AI model.
 * 
 * - generateRecipeImage - A function that takes a recipe name and returns an image URL.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRecipeImageInputSchema = z.string().describe("The name of the recipe to generate an image for.");
export type GenerateRecipeImageInput = z.infer<typeof GenerateRecipeImageInputSchema>;

export async function generateRecipeImage(recipeName: GenerateRecipeImageInput): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: `Generate a mouth-watering, photorealistic image of the following dish: ${recipeName}. The image should be well-lit, professionally styled, and look delicious.`,
  });

  return media?.url ?? '';
}

const generateRecipeImageFlow = ai.defineFlow(
  {
    name: 'generateRecipeImageFlow',
    inputSchema: GenerateRecipeImageInputSchema,
    outputSchema: z.string().url(),
  },
  async (recipeName) => {
    return await generateRecipeImage(recipeName);
  }
);
