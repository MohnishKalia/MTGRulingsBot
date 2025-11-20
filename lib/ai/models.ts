export const DEFAULT_CHAT_MODEL: string = 'chat-model-large';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model-small',
    name: 'Fast',
    description: 'No sources, quick responses',
  },
  {
    id: 'chat-model-large',
    name: 'Balanced',
    description: 'Cites sources, balanced speed',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Reasoning',
    description: 'In-depth reasoning, slower responses',
  },
];
