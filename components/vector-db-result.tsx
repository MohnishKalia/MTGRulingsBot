import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';

export function VectorDBResult({ result, args }: { result: any; args: any }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm text-muted-foreground">
        Searching MTG rules and documents for:
      </div>
      <div className="mt-1 px-2 py-1 bg-muted rounded text-xs">
        <code>{args.query}</code>
      </div>
      <Accordion type="single" collapsible>
        {Object.entries(result as Record<string, string[]>).map(
          ([namespace, items]) => (
            <AccordionItem key={namespace} value={namespace}>
              <AccordionTrigger className="text-sm">
                {namespace.toUpperCase()} ({items.length} items)
              </AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-2">
                  {items.map((item, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: last resort for string[]
                    <li key={i} className="text-sm p-3">
                      <ScrollArea className="flex max-h-40 flex-col overflow-y-auto rounded-md border p-4 leading-relaxed text-muted-foreground">
                        {item}
                      </ScrollArea>
                    </li>
                  ))}
                </ol>
              </AccordionContent>
            </AccordionItem>
          ),
        )}
      </Accordion>
    </div>
  );
}
