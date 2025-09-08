'use server';
/**
 * @fileOverview An AI agent that analyzes an image of ingredients and returns a list of identified ingredients.
 *
 * - analyzeImage - A function that handles the image analysis process.
 * - AnalyzeImageInput - The input type for the analyzeImage function.
 * - AnalyzeImageOutput - The return type for the analyzeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  ingredientCatalog: z.array(z.string()).describe("The master list of all possible ingredients available in the app.")
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  identifiedIngredients: z.array(z.string()).describe('A list of ingredient names found in the image that exist in the provided ingredient catalog. The names must be an exact match from the catalog.'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `You are an expert at identifying food ingredients from images. Your task is to analyze the provided photo and identify all the ingredients visible.

You will be given a master list of possible ingredients. You MUST only return the names of ingredients that are present in the image AND are also present in the provided ingredient catalog. The names you return must EXACTLY match the names from the catalog.

Do not guess or hallucinate ingredients. Only return what you can confidently identify from the image.

Ingredient Catalog: {{ingredientCatalog}}
Photo: {{media url=photoDataUri}}`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
