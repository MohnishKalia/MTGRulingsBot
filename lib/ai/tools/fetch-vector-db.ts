import { tool } from 'ai';
import { z } from 'zod';
import { Index } from '@upstash/vector';

export const fetchVectorDB = tool({
    description: 'Queries Upstash vector store across all non-card MTG data sources to get top 7 records with high confidence.',
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
        const fullNames = {
            'gls': 'Magic Comprehensive Glossary',
            'cr': 'Magic Comprehensive Rules',
            'mtr': 'Magic Tournament Rules',
        } as const;
        const allResults: Record<string, string[]> = {};
        const HIGH_CONFIDENCE_THRESHOLD = 0.6;

        // Query each namespace for top 5 results
        for (const ns of namespaces) {
            const result = await index.query({
                data: query,
                includeData: true,
                includeMetadata: false,
                includeVectors: false,
                topK: 7,
            }, {namespace: ns});
            const hConf = result.filter(r => r.score > HIGH_CONFIDENCE_THRESHOLD);
            allResults[fullNames[ns]] = hConf 
                ? [...hConf.map(r => r.data!)] 
                : ["No high quality vectors found. Refine search query."];
        }

        return allResults;
    },
});
