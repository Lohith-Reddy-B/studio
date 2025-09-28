'use server';

import {
  contextualConversation,
  ContextualConversationInput,
} from '@/ai/flows/contextual-conversation-flow';
import { identifyImageContentAndGenerateInitialResponse } from '@/ai/flows/identify-image-initial-response';

export async function getInitialResponse(photoDataUri: string) {
  try {
    const response = await identifyImageContentAndGenerateInitialResponse({ photoDataUri });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error getting initial response:', error);
    return { success: false, error: 'Failed to identify the image. Please try again.' };
  }
}

export async function getNextQuestion(input: ContextualConversationInput) {
  try {
    const response = await contextualConversation(input);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error getting next question:', error);
    return { success: false, error: 'Failed to generate the next question. Please try again.' };
  }
}
