import { tool } from 'ai';
import { z } from 'zod';
import { and, notIlike, or, sql } from 'drizzle-orm';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { oracleCard, ruling } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const fetchCardDetails = tool({
	description: 'Fetch card details from Postgres DB by searching for cards whose names are SQL LIKE the provided patterns',
	parameters: z.object({
		cardNames: z.array(z.string()).describe('An array of card name patterns'),
	}),
	execute: async ({ cardNames }) => {
        if (!process.env.POSTGRES_URL) {
            throw new Error('POSTGRES_URL environment variable is not defined');
        }
        const client = postgres(process.env.POSTGRES_URL);
        const db = drizzle(client);
		// Build LIKE conditions for each card name pattern
		const conditions = cardNames.map(name => 
            sql`to_tsvector('english', ${oracleCard.name}) @@ plainto_tsquery('english', ${name})`
        );
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
                rulings: sql`json_agg(json_build_object('comment', ${ruling.comment}, 'published_at', ${ruling.publishedAt}))`,
            })
            .from(oracleCard)
            .leftJoin(ruling, eq(oracleCard.oracleId, ruling.oracleId))
            .where(and(or(...conditions), notIlike(oracleCard.name, '%//%')))
            .groupBy(oracleCard.id)
            .limit(Math.ceil(cardNames.length * 1.6));

        return cardsWithRulings;
	},
});