import {
  customProvider,
} from 'ai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model-small': chatModel,
        'chat-model-large': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model-small': openai('gpt-5-nano'),
        'chat-model-large': openai('gpt-4.1-mini'),
        'chat-model-reasoning': openai('gpt-5-mini'),
        'title-model': openai('gpt-5-nano'),
        'artifact-model': openai('gpt-5-nano'),
      },
      // imageModels: {
      //   'small-model': openai.image('dall-e-2'),
      //   'large-model': openai.image('dall-e-3'),
      // },
    });
