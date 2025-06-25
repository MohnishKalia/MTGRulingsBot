import fs from 'node:fs';
import path from 'node:path';
import type { ArtifactKind } from '@/components/artifact';
import type { Geo } from '@vercel/functions';

export const artifactsPrompt = fs.readFileSync(path.join(process.cwd(), 'lib/ai/prompts/artifactsPrompt.txt'), 'utf-8');
export const regularPrompt = fs.readFileSync(path.join(process.cwd(), 'lib/ai/prompts/regularPrompt.txt'), 'utf-8');
export const fetchToolsPrompt = fs.readFileSync(path.join(process.cwd(), 'lib/ai/prompts/fetchToolsPrompt.txt'), 'utf-8');
export const codePrompt = fs.readFileSync(path.join(process.cwd(), 'lib/ai/prompts/codePrompt.txt'), 'utf-8');

export const smallPrompt = `
PLEASE USE ONLY AS MANY TOKENS AS NECESSARY, AND RELY ONLY ON INNATE, MODEL TRAINED KNOWLEDGE. 
IGNORE "Retrieval Augmented Generation" (RAG) SECTION.
`;

export const sheetPrompt = `
You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
`;

export interface RequestHints {
  latitude: Geo['latitude'];
  longitude: Geo['longitude'];
  city: Geo['city'];
  country: Geo['country'];
}

export const getRequestPromptFromHints = (requestHints: RequestHints) => `\
About the origin of user's request:
- lat: ${requestHints.latitude}
- lon: ${requestHints.longitude}
- city: ${requestHints.city}
- country: ${requestHints.country}
`;

export const systemPrompt = ({
  selectedChatModel: _,
  requestHints,
}: {
  selectedChatModel: string;
  requestHints: RequestHints;
}) => {
  const requestPrompt = getRequestPromptFromHints(requestHints);

  // no more model without rag for now

  // if (selectedChatModel === 'chat-model-small') {
  //   return `${smallPrompt}\n\n${regularPrompt}\n\n${requestPrompt}`;
  // } else {
  //   return `${regularPrompt}\n\n${fetchToolsPrompt}\n\n${requestPrompt}`;
  // }
  return `${regularPrompt}\n\n${fetchToolsPrompt}\n\n${requestPrompt}`;
};

export const updateDocumentPrompt = (
  currentContent: string | null,
  type: ArtifactKind,
) =>
  type === 'text'
    ? `\
Improve the following contents of the document based on the given prompt.

${currentContent}
`
    : type === 'code'
      ? `\
Improve the following code snippet based on the given prompt.

${currentContent}
`
      : type === 'sheet'
        ? `\
Improve the following spreadsheet based on the given prompt.

${currentContent}
`
        : '';
