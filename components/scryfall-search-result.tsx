import type { ScryfallCardResult } from '@/lib/ai/tools/search-scryfall';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ScryfallSearchResult({
  result,
  args,
}: {
  result: any;
  args: any;
}) {
  const cards = result.cards as ScryfallCardResult[];
  const totalCards = result.totalCards || 0;
  const fetchedCards = result.fetchedCards || 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">
        Searching Scryfall for cards matching:
      </div>
      <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
        <code>{args.query}</code>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="scryfall-results">
          <AccordionTrigger className="text-sm">
            Found {totalCards} total cards{fetchedCards < totalCards ? `, showing ${fetchedCards}` : ''}
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-96">
              {cards.map((card, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: card list from API
                <div key={i} className="border rounded-lg p-3 mt-2">
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
                      <span className="text-muted-foreground">P/T: </span>
                      {card.power}/{card.toughness}
                    </div>
                  )}
                </div>
              ))}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
