import {genkit, GenerationModel} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: 'v1beta',
    }),
  ],
});

export const gemini15Flash: GenerationModel = 'googleai/gemini-1.5-flash-latest';
