# Vector Store Configuration

## Overview

MTGRulingsBot uses Upstash Vector as its vector database for semantic search across Magic: The Gathering rules and card data. This document covers the configuration, data organization, and management of the vector store.

## Architecture

### Namespace Organization

The vector database is organized into three main namespaces:

1. **`cr`** - Comprehensive Rules
   - Individual rule sections (100.1, 100.2, etc.)
   - Rule subsections and detailed explanations
   - Cross-references and examples

2. **`gls`** - Glossary
   - MTG terminology definitions
   - Keywords and ability explanations
   - Game concept clarifications

3. **`mtr`** - Magic Tournament Rules
   - Tournament procedures
   - Penalties and infractions
   - Judge guidelines and procedures

### Data Structure

Each vector entry contains:
```typescript
{
  id: string;           // Unique identifier
  vector: number[];     // 1536-dimensional embedding
  metadata: {
    source: string;     // 'cr', 'gls', or 'mtr'
    section?: string;   // Rule number (e.g., "100.1")
    title?: string;     // Section title
    content: string;    // Full text content
    tokens?: number;    // Token count for the content
  };
}
```

## Configuration

### Connection Setup

```typescript
import { Index } from "@upstash/vector";

const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});
```

### Environment Variables

```bash
# Required for vector database access
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-rest-token
```

### Index Configuration

The vector database is configured with:
- **Dimensions**: 1536 (OpenAI text-embedding-ada-002)
- **Similarity Metric**: Cosine similarity
- **Regions**: Multiple regions for low latency

## Data Loading

### Comprehensive Rules (`cr` namespace)

The comprehensive rules are processed and loaded via the `mtg_cr.py` script:

```python
# Process comprehensive rules
sections = parse_comprehensive_rules(cr_text)
vectors = []

for section in sections:
    embedding = get_embedding(section.content)
    vectors.append({
        'id': f'cr_{section.number}',
        'vector': embedding,
        'metadata': {
            'source': 'cr',
            'section': section.number,
            'title': section.title,
            'content': section.content
        }
    })

# Upsert to cr namespace
index.upsert(vectors, namespace='cr')
```

### Glossary (`gls` namespace)

Glossary terms are extracted from the comprehensive rules:

```python
# Extract glossary definitions
glossary_terms = extract_glossary(cr_text)
vectors = []

for term in glossary_terms:
    embedding = get_embedding(f"{term.name}: {term.definition}")
    vectors.append({
        'id': f'gls_{term.name.lower().replace(" ", "_")}',
        'vector': embedding,
        'metadata': {
            'source': 'gls',
            'title': term.name,
            'content': term.definition
        }
    })

# Upsert to gls namespace
index.upsert(vectors, namespace='gls')
```

### Tournament Rules (`mtr` namespace)

Tournament rules are typically uploaded as PDF documents through the Upstash dashboard, which automatically handles chunking and embedding.

## Query Operations

### Basic Search

```typescript
// Search across all namespaces
const results = await index.query({
  data: queryEmbedding,
  topK: 10,
  includeMetadata: true,
});

// Search within specific namespace
const crResults = await index.query({
  data: queryEmbedding,
  topK: 5,
  includeMetadata: true,
  namespace: 'cr',
});
```

### Multi-Namespace Search

```typescript
// Search across multiple namespaces
const namespaces = ['cr', 'gls', 'mtr'];
const searchPromises = namespaces.map(ns => 
  index.query({
    data: queryEmbedding,
    topK: 3,
    includeMetadata: true,
    namespace: ns,
  })
);

const results = await Promise.all(searchPromises);
```

### Filtered Search

```typescript
// Search with metadata filtering
const results = await index.query({
  data: queryEmbedding,
  topK: 10,
  includeMetadata: true,
  filter: {
    source: { $eq: 'cr' },
    section: { $gte: '100' }
  }
});
```

## Performance Optimization

### Embedding Strategy

1. **Chunking**: Large documents are split into semantically meaningful chunks
2. **Context Preservation**: Overlapping chunks maintain context across boundaries
3. **Metadata Enhancement**: Rich metadata improves retrieval accuracy

### Query Optimization

```typescript
// Optimize query parameters
const optimizedQuery = {
  data: embedding,
  topK: Math.min(requestedResults, 50), // Limit results
  includeMetadata: true,
  includeData: false, // Don't return vectors
};
```

### Caching Strategy

```typescript
// Cache frequently accessed embeddings
const embeddingCache = new Map<string, number[]>();

function getCachedEmbedding(text: string): number[] {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }
  
  const embedding = generateEmbedding(text);
  embeddingCache.set(text, embedding);
  return embedding;
}
```

## Monitoring and Maintenance

### Health Checks

```typescript
// Check namespace health
export async function checkVectorHealth() {
  const namespaces = ['cr', 'gls', 'mtr'];
  const stats = {};
  
  for (const ns of namespaces) {
    try {
      const info = await index.info(ns);
      stats[ns] = {
        vectorCount: info.vectorCount,
        status: 'healthy'
      };
    } catch (error) {
      stats[ns] = {
        vectorCount: 0,
        status: 'error',
        error: error.message
      };
    }
  }
  
  return stats;
}
```

### Data Validation

```typescript
// Validate vector data integrity
export async function validateVectorData() {
  const issues = [];
  
  // Check for empty namespaces
  const stats = await checkVectorHealth();
  for (const [ns, stat] of Object.entries(stats)) {
    if (stat.vectorCount === 0) {
      issues.push(`Namespace ${ns} is empty`);
    }
  }
  
  // Check for recent updates
  // This would require storing update timestamps
  
  return issues;
}
```

## Backup and Recovery

### Data Export

```typescript
// Export vector data (for backup)
export async function exportVectorData(namespace: string) {
  // Note: Upstash doesn't provide direct export
  // This would require fetching all vectors by ID
  // Consider using metadata to track all IDs
}
```

### Disaster Recovery

1. **Namespace Recreation**: Recreate namespaces from source data
2. **Re-embedding**: Regenerate embeddings from original text
3. **Validation**: Verify data integrity after recovery

## Cost Optimization

### Vector Limits

```typescript
// Monitor vector usage
const VECTOR_LIMITS = {
  cr: 2000,    // ~2000 rule sections
  gls: 1000,   // ~1000 glossary terms  
  mtr: 500,    // ~500 MTR sections
};

export function checkVectorLimits(stats: any) {
  const warnings = [];
  
  for (const [ns, limit] of Object.entries(VECTOR_LIMITS)) {
    if (stats[ns]?.vectorCount > limit) {
      warnings.push(`Namespace ${ns} exceeds expected limit`);
    }
  }
  
  return warnings;
}
```

### Query Optimization

1. **Reduce TopK**: Only request needed results
2. **Namespace Targeting**: Search specific namespaces when possible
3. **Metadata Filtering**: Use filters to reduce search space

## Integration with Application

### Search Context

```typescript
// Build search context from vector results
export function buildSearchContext(results: VectorResult[]) {
  return results.map(result => ({
    source: result.metadata.source,
    section: result.metadata.section,
    title: result.metadata.title,
    content: result.metadata.content,
    relevance: result.score
  }));
}
```

### Response Enhancement

```typescript
// Enhance AI responses with vector context
export function enhancePrompt(query: string, context: SearchResult[]) {
  const contextText = context
    .map(item => `${item.title}: ${item.content}`)
    .join('\n\n');
  
  return `
Context from MTG rules:
${contextText}

User question: ${query}

Please answer based on the provided context.
  `;
}
```

## Future Enhancements

### Planned Improvements

1. **Hybrid Search**: Combine vector search with keyword search
2. **Dynamic Embeddings**: Update embeddings for errata and rule changes
3. **Query Expansion**: Automatically expand queries with related terms
4. **Result Ranking**: Improve relevance scoring with user feedback

### Advanced Features

```typescript
// Future: Hybrid search implementation
export async function hybridSearch(query: string) {
  // Combine vector similarity with keyword matching
  const vectorResults = await vectorSearch(query);
  const keywordResults = await keywordSearch(query);
  
  // Merge and rank results
  return mergeResults(vectorResults, keywordResults);
}
```

## Troubleshooting

### Common Issues

1. **Empty Namespaces**: Run data loading scripts
2. **Poor Results**: Check embedding quality and query formulation
3. **Slow Queries**: Optimize query parameters and add caching
4. **Connection Errors**: Verify credentials and network access

### Debug Tools

```typescript
// Debug vector search
export async function debugVectorSearch(query: string) {
  const embedding = await generateEmbedding(query);
  console.log('Query embedding dimensions:', embedding.length);
  
  const results = await index.query({
    data: embedding,
    topK: 10,
    includeMetadata: true,
  });
  
  console.log('Search results:', results.length);
  results.forEach((result, i) => {
    console.log(`${i + 1}. Score: ${result.score}, Source: ${result.metadata.source}`);
  });
}
```
