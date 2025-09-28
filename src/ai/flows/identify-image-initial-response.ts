'use server';

/**
 * @fileOverview Identifies the content of an image and generates an initial response.
 *
 * - identifyImageContentAndGenerateInitialResponse - A function that handles the image identification and response generation.
 * - IdentifyImageContentAndGenerateInitialResponseInput - The input type for the identifyImageContentAndGenerateInitialResponse function.
 * - IdentifyImageContentAndGenerateInitialResponseOutput - The return type for the identifyImageContentAndGenerateInitialResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyImageContentAndGenerateInitialResponseInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be analyzed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type IdentifyImageContentAndGenerateInitialResponseInput = z.infer<
  typeof IdentifyImageContentAndGenerateInitialResponseInputSchema
>;

const IdentifyImageContentAndGenerateInitialResponseOutputSchema = z.object({
  identification: z.string().describe('The identification of the image content.'),
});
export type IdentifyImageContentAndGenerateInitialResponseOutput = z.infer<
  typeof IdentifyImageContentAndGenerateInitialResponseOutputSchema
>;

export async function identifyImageContentAndGenerateInitialResponse(
  input: IdentifyImageContentAndGenerateInitialResponseInput
): Promise<IdentifyImageContentAndGenerateInitialResponseOutput> {
  return identifyImageContentAndGenerateInitialResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyImageContentAndGenerateInitialResponsePrompt',
  input: {
    schema: IdentifyImageContentAndGenerateInitialResponseInputSchema,
  },
  output: {
    schema: IdentifyImageContentAndGenerateInitialResponseOutputSchema,
  },
  prompt: `You are an AI that identifies the content of an image and generates a relevant initial response. Analyze the image and provide a description of what is shown in the image. Use the following image as the primary source of information.

Image: {{media url=photoDataUri}}
`,
});

const identifyImageContentAndGenerateInitialResponseFlow = ai.defineFlow(
  {
    name: 'identifyImageContentAndGenerateInitialResponseFlow',
    inputSchema: IdentifyImageContentAndGenerateInitialResponseInputSchema,
    outputSchema: IdentifyImageContentAndGenerateInitialResponseOutputSchema,
  },
  async input => {
    const llmResponse = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are an AI that identifies the content of an image and generates a relevant initial response. Analyze the image and provide a description of what is shown in the image. Use the following image as the primary source of information.

Image: {{media url=photoDataUri}}
`,
      config: {
        temperature: 0.3,
      },
    });
    return { identification: llmResponse.text };
  }
);
