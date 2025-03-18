import { oracleCard, ruling } from '@/lib/db/schema';
import { tool } from 'ai';
import { and, desc, eq, isNull, notInArray, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

export interface CardWithRuling {
    scryfallUri: string;
    name: string;
    manaCost: string | null;
    typeLine: string | null;
    oracleText: string | null;
    power: string | null;
    toughness: string | null;
    rulings: { comment: string, published_at: string }[];
};

export const fetchCardDetails = tool({
    description: 'Fetch card details from Postgres DB by searching for cards via names in fuzzy similarity search',
    parameters: z.object({
        cardNames: z.array(z.string()).describe('An array of card names to be fuzzy matched.'),
    }),
    execute: async ({ cardNames }) => {
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL environment variable is not defined');
        }
        const client = postgres(process.env.POSTGRES_URL);
        const db = drizzle(client);
        const matchesByCardName: Record<string, CardWithRuling[]> = cardNames.reduce((acc, name) => {
            acc[name] = [];
            return acc;
        }, {} as Record<string, CardWithRuling[]>);
        for (const cardName of cardNames) {
            // Perform a LEFT JOIN to aggregate rulings for each card
            const cardsWithRulings = await db
                .select({
                    scryfallUri: oracleCard.scryfallUri,
                    name: oracleCard.name,
                    manaCost: oracleCard.manaCost,
                    typeLine: oracleCard.typeLine,
                    oracleText: oracleCard.oracleText,
                    power: oracleCard.power,
                    toughness: oracleCard.toughness,
                    // cardFaces: oracleCard.cardFaces, TODO: add dfcs with array flatten
                    // aggregate all rulings into a JSON array for each card
                    rulings: sql`json_agg(json_build_object('comment', ${ruling.comment}, 'published_at', ${ruling.publishedAt}))` as any,
                })
                .from(oracleCard)
                .leftJoin(ruling, eq(oracleCard.oracleId, ruling.oracleId))
                .where(and(
                    sql`similarity(${oracleCard.name}, ${cardName}) > 0.3`,
                    isNull(oracleCard.cardFaces),
                    notInArray(oracleCard.layout, ['art_series', 'token']),
                ))
                .groupBy(oracleCard.id)
                .orderBy(desc(sql`similarity(${oracleCard.name}, ${cardName})`))
                .limit(1);
            matchesByCardName[cardName] = cardsWithRulings;
        }

        return matchesByCardName;
    },
});