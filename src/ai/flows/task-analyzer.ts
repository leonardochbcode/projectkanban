// Task Analyzer flow
'use server';
/**
 * @fileOverview An AI agent that analyzes task comments, prioritizes action items,
 * and suggests task reassignments based on team discussions.
 *
 * - analyzeTaskComments - A function that handles the task comment analysis process.
 * - AnalyzeTaskCommentsInput - The input type for the analyzeTaskComments function.
 * - AnalyzeTaskCommentsOutput - The return type for the analyzeTaskComments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTaskCommentsInputSchema = z.object({
  taskComments: z
    .string()
    .describe('The latest comments on a task, representing team discussions.'),
});
export type AnalyzeTaskCommentsInput = z.infer<typeof AnalyzeTaskCommentsInputSchema>;

const AnalyzeTaskCommentsOutputSchema = z.object({
  priorityActionItems: z
    .string()
    .describe('A list of action items extracted from the task comments, prioritized by importance.'),
  suggestedReassignments: z
    .string()
    .describe(
      'Suggestions for task reassignments based on the content of team discussions, including reasons for the reassignments.'
    ),
});
export type AnalyzeTaskCommentsOutput = z.infer<typeof AnalyzeTaskCommentsOutputSchema>;

export async function analyzeTaskComments(input: AnalyzeTaskCommentsInput): Promise<AnalyzeTaskCommentsOutput> {
  return analyzeTaskCommentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTaskCommentsPrompt',
  input: {schema: AnalyzeTaskCommentsInputSchema},
  output: {schema: AnalyzeTaskCommentsOutputSchema},
  prompt: `You are an AI-powered project management assistant. Your task is to analyze the latest task comments provided and extract actionable insights.

  Based on the comments, identify and prioritize action items that need to be addressed. Also, analyze the discussion to determine if any task reassignments are necessary based on the skills, workload, or availability of team members.

  Task Comments: {{{taskComments}}}

  Output the priority action items and suggested reassignments in a clear and concise manner.
  `,
});

const analyzeTaskCommentsFlow = ai.defineFlow(
  {
    name: 'analyzeTaskCommentsFlow',
    inputSchema: AnalyzeTaskCommentsInputSchema,
    outputSchema: AnalyzeTaskCommentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
