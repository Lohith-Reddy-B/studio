// The directive tells the Next.js runtime that the code in this file should be executed on the server.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating follow-up questions
 * related to an image and an initial AI response. This allows users to explore
 * the topic further through a series of dynamically generated questions.
 *
 * @exports generateFollowUpQuestions - An async function that triggers the flow.
 * @exports GenerateFollowUpQuestionsInput - The input type for the generateFollowUpQuestions function.
 * @exports GenerateFollowUpQuestionsOutput - The output type for the generateFollowUpQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateFollowUpQuestionsInputSchema = z.object({
  imageDescription: z.string().describe('A description of the image content.'),
  initialResponse: z.string().describe('The initial AI response to the image.'),
  previousQuestionsAndAnswers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).optional().describe('Previous questions and answers in the conversation.'),
});

export type GenerateFollowUpQuestionsInput = z.infer<typeof GenerateFollowUpQuestionsInputSchema>;

// Define the output schema for the flow
const GenerateFollowUpQuestionsOutputSchema = z.object({
  followUpQuestions: z.array(
    z.string().describe('A follow-up question related to the image and initial response.')
  ).describe('An array of follow-up questions.'),
});

export type GenerateFollowUpQuestionsOutput = z.infer<typeof GenerateFollowUpQuestionsOutputSchema>;

// Define the main function that will be called
export async function generateFollowUpQuestions(
  input: GenerateFollowUpQuestionsInput
): Promise<GenerateFollowUpQuestionsOutput> {
  return generateFollowUpQuestionsFlow(input);
}

// Define the prompt for generating follow-up questions
const generateFollowUpQuestionsPrompt = ai.definePrompt({
  name: 'generateFollowUpQuestionsPrompt',
  input: {
    schema: GenerateFollowUpQuestionsInputSchema,
  },
  output: {
    schema: GenerateFollowUpQuestionsOutputSchema,
  },
  prompt: `You are an AI assistant designed to generate follow-up questions.

  Based on the image description: "{{imageDescription}}"
  and the initial AI response: "{{initialResponse}}", generate a list of follow-up questions to explore the topic further.  The questions should be open-ended and encourage deeper thinking about the image and its context.

  The new question must take into account the previous questions and answers in the conversation:
  {{#if previousQuestionsAndAnswers}}
  {{#each previousQuestionsAndAnswers}}
  Question: {{{this.question}}}
  Answer: {{{this.answer}}}
  {{/each}}
  {{else}}
  There are no previous questions and answers.
  {{/if}}

  Format the result as a JSON object containing a \"followUpQuestions\" field, which is an array of strings.
  Each string should be a follow-up question.  Generate between 3 and 5 questions.
  `,
});

// Define the Genkit flow
const generateFollowUpQuestionsFlow = ai.defineFlow(
  {
    name: 'generateFollowUpQuestionsFlow',
    inputSchema: GenerateFollowUpQuestionsInputSchema,
    outputSchema: GenerateFollowUpQuestionsOutputSchema,
  },
  async input => {
    // Call the prompt to generate follow-up questions
    const {output} = await generateFollowUpQuestionsPrompt(input);
    return output!;
  }
);
