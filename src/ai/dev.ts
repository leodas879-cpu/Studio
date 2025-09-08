import { config } from 'dotenv';
config();

import '@/ai/flows/generate-recipe-flow.ts';
import '@/ai/flows/analyze-ingredients-flow.ts';
import '@/ai/flows/analyze-image-flow.ts';
