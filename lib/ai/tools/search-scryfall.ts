import { tool } from 'ai';
import { z } from 'zod';

export interface ScryfallCardResult {
    scryfallUri: string;
    name: string;
    manaCost: string | null;
    typeLine: string | null;
    oracleText: string | null;
    power: string | null;
    toughness: string | null;
}

export const searchScryfall = tool({
    description: 'Search for MTG cards using Scryfall query syntax. Returns card count and card details. Useful for filtering cards by attributes like color, type, power/toughness, sets, etc.',
    parameters: z.object({
        query: z.string().describe('Scryfall search query using Scryfall syntax (e.g., "c:red pow>5", "t:creature o:flying", "is:commander")'),
        maxCards: z.number().optional().default(1000).describe('Maximum number of cards to fetch (default 1000)'),
    }),
    execute: async ({ query, maxCards = 1000 }) => {
        try {
            const cards: ScryfallCardResult[] = [];
            let page = 1;
            let hasMore = true;
            let totalCards = 0;

            // Fetch pages until we have enough cards or no more pages
            while (hasMore && cards.length < maxCards) {
                const url = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&page=${page}`;
                const response = await fetch(url);

                if (!response.ok) {
                    if (response.status === 404) {
                        // No results found
                        return {
                            totalCards: 0,
                            fetchedCards: 0,
                            cards: [],
                            query,
                            message: 'No cards found matching the query.',
                        };
                    }
                    throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                totalCards = data.total_cards || 0;
                hasMore = data.has_more || false;

                // Map Scryfall cards to our format
                for (const card of data.data || []) {
                    if (cards.length >= maxCards) break;

                    cards.push({
                        scryfallUri: card.scryfall_uri || '',
                        name: card.name || '',
                        manaCost: card.mana_cost || null,
                        typeLine: card.type_line || null,
                        oracleText: card.oracle_text || null,
                        power: card.power || null,
                        toughness: card.toughness || null,
                    });
                }

                page++;

                // Add delay to respect Scryfall API rate limits (50-100ms recommended)
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return {
                totalCards,
                fetchedCards: cards.length,
                cards,
                query,
                message: `Found ${totalCards} total cards. Displaying ${cards.length} cards.`,
            };
        } catch (error) {
            return {
                error: 'Failed to search Scryfall',
                details: error instanceof Error ? error.message : String(error),
                query,
            };
        }
    },
});
