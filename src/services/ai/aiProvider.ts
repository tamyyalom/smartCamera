import type {AIRequestPayload, AIResponse} from '../../types/ai';
import {requestMockAI} from './mockAiProvider';

export type AIProvider = (
  payload: AIRequestPayload,
) => Promise<AIResponse>;

export type AIProviderMode = 'mock' | 'cloud';

const AI_PROVIDER_MODE: AIProviderMode = 'mock';

export function getAIProviderMode(): AIProviderMode {
  return AI_PROVIDER_MODE;
}

export function getAIProvider(): AIProvider {
  if (AI_PROVIDER_MODE === 'mock') {
    return requestMockAI;
  }

  return async () => {
    throw new Error('Cloud AI provider is not configured yet (Phase 3).');
  };
}
