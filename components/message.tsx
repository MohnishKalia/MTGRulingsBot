'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import type { Vote } from '@/lib/db/schema';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import { CardWithRuling } from '@/lib/ai/tools/fetch-card-details';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const toolInvocations = message.parts?.filter(p => p.type === 'tool-invocation').map(p => p.toolInvocation);
  const reasoningParts = message.parts?.filter(p => p.type === 'reasoning').map(p => p.reasoning);
  // console.log({parts: message.parts, toolInvocations, reasoningParts})

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {reasoningParts && reasoningParts.length > 0 && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={reasoningParts?.join('\n')}
              />
            )}

            {(message.content || (reasoningParts && reasoningParts.length > 0)) && mode === 'view' && (
              <div
                data-testid="message-content"
                className="flex flex-row gap-2 items-start"
              >
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        data-testid={`message-edit`}
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {toolInvocations && toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  if (state === 'result') {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === 'getWeather' ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === 'createDocument' ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={result}
                          />
                        ) : toolName === 'updateDocument' ? (
                          <DocumentToolResult
                            type="update"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === 'requestSuggestions' ? (
                          <DocumentToolResult
                            type="request-suggestions"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        )  : toolName === 'fetchVectorDB' ? (
                          <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">Searching MTG rules and documents for:</div>
                            <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
                              <code>{args.query}</code>
                            </div>
                            <Accordion type="single" collapsible>
                              {Object.entries(result as Record<string, string[]>).map(([namespace, items]) => (
                                <AccordionItem key={namespace} value={namespace}>
                                  <AccordionTrigger className="text-sm">
                                    {namespace.toUpperCase()} ({items.length} items)
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ol className="list-decimal list-inside space-y-2">
                                      {items.map((item, i) => (
                                      <li key={i} className="text-sm p-3">
                                        <ScrollArea className="flex max-h-40 flex-col overflow-y-auto rounded-md border p-4 leading-relaxed text-muted-foreground">
                                          {item}
                                        </ScrollArea>
                                      </li>
                                      ))}
                                    </ol>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                            </Accordion>
                          </div>
                        ) : toolName === 'fetchCardDetails' ? (
                            <div className="flex flex-col gap-2">
                            <div className="text-sm text-muted-foreground">Searching MTG cards + rulings for:</div>
                            <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
                              <code>{JSON.stringify(args.cardNames)}</code>
                            </div>
                            {Object.entries(result as Record<string, CardWithRuling[]>).map(([cardName, cards]) => (
                              <div key={cardName} className="border rounded-lg p-3 mt-2">
                              {cards.map((card, i) => (
                                <div key={i}>
                                <div className="text-sm">
                                  <Link href={card.scryfallUri} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-2">
                                  {card.name}
                                  </Link>{' '}
                                  {card.manaCost && <span className="mr-2">{card.manaCost}</span>}
                                </div>
                                {card.typeLine && <div className="text-sm text-muted-foreground">{card.typeLine}</div>}
                                {card.oracleText && <div className="mt-2 text-sm whitespace-pre-wrap">{card.oracleText}</div>}
                                {card.power && card.toughness && (
                                  <div className="mt-2 text-sm">
                                  <span className="text-muted-foreground">P/T: </span>
                                  {card.power}/{card.toughness}
                                  </div>
                                )}
                                {card.rulings && card.rulings.length > 0 && ( 
                                  <>
                                    <hr className="my-3 border-muted" />
                                    <Accordion type="single" collapsible className="mt-3">
                                      <AccordionItem value="rulings">
                                        <AccordionTrigger className="text-sm font-medium">
                                          Rulings ({card.rulings.length})
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="list-disc list-outside space-y-1 text-sm ml-5">
                                            {card.rulings
                                              .sort((a: any, b: any) => a.published_at.localeCompare(b.published_at))
                                              .map((ruling: any, i: number) => (
                                              <li key={i}>
                                                <span className="ml-1">{ruling.comment}</span>
                                                <div className="text-muted-foreground text-xs mt-1">({ruling.published_at})</div>
                                              </li>
                                            ))}
                                            </ul>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>
                                  </>
                                )}
                                </div>
                              ))}
                              </div>
                            ))}
                            </div>
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'fetchVectorDB' ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-sm text-muted-foreground">Searching MTG rules and documents for:</div>
                          <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
                            <code>{args.query}</code>
                          </div>
                        </div>
                      ) : toolName === 'fetchCardDetails' ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-sm text-muted-foreground">Searching MTG cards + rulings for:</div>
                          <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
                            <code>{JSON.stringify(args.cardNames)}</code>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
