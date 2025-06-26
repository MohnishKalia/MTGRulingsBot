# API Reference

## Overview

MTGRulingsBot provides several API endpoints for chat functionality, document management, voting, and system statistics. All endpoints require authentication unless otherwise specified.

## Authentication

All API endpoints (except public ones) require authentication via NextAuth session:

```typescript
// Example authenticated request
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
  // Session cookie automatically included
});
```

## Chat API

### POST `/api/chat`
Create a new chat or continue an existing conversation.

**Request Body:**
```typescript
{
  id?: string;          // Optional: existing chat ID
  messages: Message[];  // Array of messages
  data?: {
    // Additional context data
  };
}
```

**Response:**
```typescript
// Streaming response with various data types
{
  type: 'text-delta' | 'tool-call' | 'tool-result' | 'finish';
  content: string;
  // Additional fields based on type
}
```

**Example:**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'What is the stack in Magic?' }
    ]
  })
});
```

## Document API

### GET `/api/document`
Retrieve document(s) by ID or user.

**Query Parameters:**
- `id`: Document ID (required)

**Response:**
```typescript
Document[] // Array of document versions
```

**Example:**
```typescript
const response = await fetch('/api/document?id=doc-123');
const documents = await response.json();
```

### POST `/api/document`
Create or update a document.

**Request Body:**
```typescript
{
  id?: string;          // Optional: existing document ID
  title: string;        // Document title
  content: string;      // Document content
  kind: 'text' | 'code' | 'image' | 'sheet'; // Document type
}
```

**Response:**
```typescript
{
  id: string;
  title: string;
  content: string;
  kind: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### DELETE `/api/document`
Delete a document.

**Query Parameters:**
- `id`: Document ID (required)

**Response:**
```typescript
{ success: true }
```

## Vote API

### GET `/api/vote`
Get votes for a chat.

**Query Parameters:**
- `chatId`: Chat ID (required)

**Response:**
```typescript
Vote[] // Array of votes
```

### PATCH `/api/vote`
Vote on a message.

**Request Body:**
```typescript
{
  chatId: string;       // Chat ID
  messageId: string;    // Message ID
  type: 'up' | 'down';  // Vote type
}
```

**Response:**
```typescript
{ message: 'Message voted' }
```

## Statistics API

### GET `/api/dbStats`
Get database and vector store statistics.

**Response:**
```typescript
{
  database: {
    oracleCardCount: number;
    rulingCount: number;
    recentOracleCardDate: string;
  };
  vectorStore: {
    cr: { count: number };    // Comprehensive Rules
    gls: { count: number };   // Glossary
    mtr: { count: number };   // Tournament Rules
  };
}
```

**Example:**
```typescript
const response = await fetch('/api/dbStats');
const stats = await response.json();
console.log(`Oracle cards: ${stats.database.oracleCardCount}`);
```

## Artifacts API

### POST `/api/artifacts/code`
Create or update a code artifact.

**Request Body:**
```typescript
{
  id?: string;
  title: string;
  description?: string;
}
```

### POST `/api/artifacts/text`
Create or update a text artifact.

### POST `/api/artifacts/image`
Create or update an image artifact.

### POST `/api/artifacts/sheet`
Create or update a sheet artifact.

## Error Handling

### Standard Error Responses

All API endpoints return consistent error formats:

```typescript
// 400 Bad Request
{
  error: 'Bad Request',
  message: 'Missing required parameter: chatId'
}

// 401 Unauthorized
{
  error: 'Unauthorized',
  message: 'Authentication required'
}

// 403 Forbidden
{
  error: 'Forbidden',
  message: 'Insufficient permissions'
}

// 404 Not Found
{
  error: 'Not Found',
  message: 'Resource not found'
}

// 500 Internal Server Error
{
  error: 'Internal Server Error',
  message: 'An unexpected error occurred'
}
```

### Client-Side Error Handling

```typescript
async function apiCall(endpoint: string, options: RequestInit) {
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

## Rate Limiting

### Current Limits
- **Chat API**: 10 requests per minute per user
- **Document API**: 30 requests per minute per user
- **Vote API**: 100 requests per minute per user
- **Stats API**: 60 requests per minute (global)

### Rate Limit Headers
```typescript
{
  'X-RateLimit-Limit': '10',
  'X-RateLimit-Remaining': '9',
  'X-RateLimit-Reset': '1640995200'
}
```

### Handling Rate Limits
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  // Wait and retry
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
}
```

## Webhooks

### Chat Events
Subscribe to chat events for real-time updates:

```typescript
// WebSocket connection for real-time chat updates
const ws = new WebSocket('/api/chat/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

## Development

### Testing API Endpoints

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ]
  }'

# Test stats endpoint
curl http://localhost:3000/api/dbStats
```

### Mock Responses
For testing, use mock responses:

```typescript
// Mock API responses in tests
const mockResponse = {
  database: {
    oracleCardCount: 25000,
    rulingCount: 15000,
    recentOracleCardDate: '2024-01-01'
  }
};
```

## Versioning

### API Version
Current API version: `v1`

Future versions will be backwards compatible or provide migration paths.

### Deprecation Policy
- 30 days notice for breaking changes
- Maintain previous version for 90 days
- Clear migration documentation

## Security

### Input Validation
All endpoints validate input data:

```typescript
// Example validation
const schema = z.object({
  chatId: z.string().uuid(),
  messageId: z.string().uuid(),
  type: z.enum(['up', 'down'])
});
```

### CORS Policy
```typescript
// CORS headers for browser requests
{
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}
```

### Authentication Middleware
```typescript
// Middleware applied to protected routes
export async function middleware(request: NextRequest) {
  const session = await auth();
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return NextResponse.next();
}
```
