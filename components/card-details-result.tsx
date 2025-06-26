import type { CardWithRuling } from '@/lib/ai/tools/fetch-card-details';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CardDetailsResult({
  result,
  args,
}: {
  result: any;
  args: any;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">
        Searching MTG cards + rulings for:
      </div>
      <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
        <code>{JSON.stringify(args.cardNames)}</code>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="card-details">
          <AccordionTrigger className="text-sm">
            Fetched details for{' '}
            {
              Object.values(result as Record<string, CardWithRuling[]>)
                .flat().length
            }{' '}
            cards
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-96">
              {Object.entries(result as Record<string, CardWithRuling[]>).map(
                ([cardName, cards]) => (
                  <div key={cardName} className="border rounded-lg p-3 mt-2">
                    {cards.map((card, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: TODO: could pull thru id, but could confuse LLM downstream
                      <div key={i}>
                        <div className="text-sm">
                          <Link
                            href={card.scryfallUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium underline underline-offset-2"
                          >
                            {card.name}
                          </Link>{' '}
                          {card.manaCost && (
                            <span className="mr-2">{card.manaCost}</span>
                          )}
                        </div>
                        {card.typeLine && (
                          <div className="text-sm text-muted-foreground">
                            {card.typeLine}
                          </div>
                        )}
                        {card.oracleText && (
                          <div className="mt-2 text-sm whitespace-pre-wrap">
                            {card.oracleText}
                          </div>
                        )}
                        {card.power && card.toughness && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">
                              P/T:{' '}
                            </span>
                            {card.power}/{card.toughness}
                          </div>
                        )}
                        {card.rulings && card.rulings.length > 0 && (
                          <>
                            <hr className="my-3 border-muted" />
                            <Accordion
                              type="single"
                              collapsible
                              className="mt-3"
                            >
                              <AccordionItem value="rulings">
                                <AccordionTrigger className="text-sm font-medium">
                                  Rulings ({card.rulings.length})
                                </AccordionTrigger>
                                <AccordionContent>
                                  <ul className="list-disc list-outside space-y-1 text-sm ml-5">
                                    {card.rulings
                                      .sort((a: any, b: any) =>
                                        a.published_at.localeCompare(
                                          b.published_at,
                                        ),
                                      )
                                      .map((ruling: any, i: number) => (
                                        // biome-ignore lint/suspicious/noArrayIndexKey: last resort for string[]
                                        <li key={i}>
                                          <span className="ml-1">
                                            {ruling.comment}
                                          </span>
                                          <div className="text-muted-foreground text-xs mt-1">
                                            ({ruling.published_at})
                                          </div>
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
                ),
              )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
