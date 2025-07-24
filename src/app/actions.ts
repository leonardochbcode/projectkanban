'use server';

import { analyzeTaskComments } from '@/ai/flows/task-analyzer';
import { z } from 'zod';

const schema = z.object({
  taskComments: z.string(),
});

export async function getAnalysis(input: { taskComments: string }) {
  const validatedFields = schema.safeParse(input);

  if (!validatedFields.success) {
    throw new Error('Invalid input.');
  }

  return await analyzeTaskComments({ taskComments: validatedFields.data.taskComments });
}
