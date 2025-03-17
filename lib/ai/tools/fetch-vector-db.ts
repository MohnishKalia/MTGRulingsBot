import { tool } from 'ai';
import { z } from 'zod';
import { Index } from '@upstash/vector';

export const fetchVectorDB = tool({
    description: 'Query upstash vector store across namespaces to get top 5 records with high confidence',
    parameters: z.object({
        query: z.string().describe('The search query to run against the vector database'),
    }),
    execute: async ({ query }) => {
        // Initialize Upstash vector index from env variables
        const index = new Index({
            url: process.env.UPSTASH_VECTOR_REST_URL!,
            token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
        });

        const namespaces = ['gls', 'cr', 'mtr'] as const;
        // @ts-ignore i know
        const allResults: Record<typeof namespaces, string[]> = {};
        const HIGH_CONFIDENCE_THRESHOLD = 0.75;

        // Query each namespace for top 5 results
        for (const ns of namespaces) {
            const result = await index.query({
                data: query,
                includeData: true,
                includeMetadata: false,
                includeVectors: false,
                topK: 5,
            }, {namespace: ns});
            const hConf = result.filter(r => r.score > HIGH_CONFIDENCE_THRESHOLD);
            if (hConf) {
                // @ts-ignore i know
                allResults[ns] = [];
                hConf.forEach((record) => {
                    // @ts-ignore i know
                    allResults[ns].push(record.data);
                });
            }
        }

        return allResults;
    },
});
