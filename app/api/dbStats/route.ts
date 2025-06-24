import { max, count } from 'drizzle-orm';
import { oracleCard, ruling } from '@/lib/db/schema';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Index } from "@upstash/vector";
import { cache } from 'react';

if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL environment variable is not defined');
}
if (!process.env.UPSTASH_VECTOR_REST_URL) {
    throw new Error('UPSTASH_VECTOR_REST_URL environment variable is not defined');
}
if (!process.env.UPSTASH_VECTOR_REST_TOKEN) {
    throw new Error('UPSTASH_VECTOR_REST_TOKEN environment variable is not defined');
}

const client = postgres(process.env.POSTGRES_URL);
const db = drizzle(client);
const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

/**
 * Handles an HTTP GET request to retrieve database and vector store statistics.
 *
 * This function performs the following steps:
 * - Validates the existence of the POSTGRES_URL environment variable.
 * - Establishes a connection to the PostgreSQL database using the given URL.
 * - Retrieves counts of oracle cards and rulings from the database.
 * - Determines the most recent release date of an oracle card.
 * - Connects to an external index using the UPSTASH_VECTOR_REST_URL and UPSTASH_VECTOR_REST_TOKEN environment variables.
 * - Retrieves vector store information and validates that the required namespaces ("gls", "cr", "mtr") exist and are not empty.
 * - Constructs and returns a JSON response with both the database statistics and vector store statistics.
 *
 * @returns {Promise<Response>} A promise that resolves to a Response object containing:
 * - A JSON payload with database statistics (oracleCardCount, rulingCount, recentOracleCardDate) and vector store statistics.
 * - A 200 status code on success, or a 500 status code with an error message on failure.
 *
 * @throws {Error} If any critical environment variable is missing, or if any required namespace is absent or empty, or if any database or index operation fails.
 */
export const GET = cache(async function GET(): Promise<Response> {
    try {
        const oracleCardCountResult = await db
            .select({ count: count(oracleCard.id) })
            .from(oracleCard);
        const rulingCountResult = await db
            .select({ count: count(ruling.id) })
            .from(ruling);
        const recentOracleCardResult = await db
            .select({ releasedAt: max(oracleCard.releasedAt) })
            .from(oracleCard);
        
        const dbStats = {
            oracleCardCount: Number(oracleCardCountResult[0]?.count ?? 0),
            rulingCount: Number(rulingCountResult[0]?.count ?? 0),
            recentOracleCardDate: recentOracleCardResult[0]?.releasedAt ?? null,
        };
        
        const info = await index.info();
        const vectorStats = info.namespaces;

        const requiredNamespaces = ["gls", "cr", "mtr"];
        for (const ns of requiredNamespaces) {
            const nsData = vectorStats[ns];
            if (!nsData) {
                throw new Error(`Namespace "${ns}" is missing`);
            }
            const isEmpty = nsData.vectorCount === 0;
            if (isEmpty) {
                throw new Error(`Namespace "${ns}" is empty or has no data`);
            }
        }

        return new Response(
            JSON.stringify({
                dbStats,
                vectorStats,
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
});