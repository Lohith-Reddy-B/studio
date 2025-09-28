import { config } from 'dotenv';
config();

import '@/ai/flows/contextual-conversation-flow.ts';
import '@/ai/flows/generate-follow-up-questions.ts';
import '@/ai/flows/identify-image-initial-response.ts';