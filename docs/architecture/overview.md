# Architecture Overview

## System Architecture

MTGRulingsBot is built as a modern, full-stack web application with the following key components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │    │  PostgreSQL DB  │    │ Upstash Vector  │
│                 │    │                 │    │                 │
│ • Chat Interface│◄──►│ • User Data     │    │ • MTG Rules     │
│ • Artifacts     │    │ • Chat History  │    │ • Card Oracle   │
│ • Auth System   │    │ • Documents     │    │ • Glossary      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   AI Models     │
                    │                 │
                    │ • OpenAI GPT    │
                    │ • Embedding     │
                    │ • Streaming     │
                    └─────────────────┘
```

## Core Technologies

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Component library
- **AI SDK** - Streaming AI interactions

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **NextAuth.js** - Authentication system
- **Drizzle ORM** - Type-safe database queries
- **Flask** - Python API for specialized tasks

### Data Layer
- **PostgreSQL (Neon)** - Primary database
- **Upstash Vector** - Vector similarity search
- **Vercel Blob** - File storage (if needed)

### AI & ML
- **OpenAI GPT** - Language model
- **Text Embedding** - Semantic search
- **Streaming Responses** - Real-time chat

## Key Features

### 1. Intelligent Chat System
- AI-powered MTG rules assistance
- Context-aware responses
- Streaming for real-time interaction
- Message voting and feedback

### 2. Artifact System
- **Text Artifacts** - Document editing
- **Code Artifacts** - Python code execution
- **Image Artifacts** - Image manipulation
- **Sheet Artifacts** - Data tables

### 3. Comprehensive MTG Data
- **Comprehensive Rules** - Full MTG rulebook
- **Oracle Cards** - Official card database
- **Rulings** - Official card rulings
- **Glossary** - MTG terminology

### 4. Vector Search
- Semantic similarity search
- Multi-namespace organization:
  - `cr` - Comprehensive Rules
  - `gls` - Glossary terms
  - `mtr` - Magic Tournament Rules

## Data Flow

### Chat Interaction
1. User sends message
2. System extracts relevant context from vector store
3. AI model generates response with context
4. Response streams back to user
5. Interaction logged to database

### Document Management
1. User creates/edits artifact
2. Changes stream to document handler
3. Content saved to database
4. Real-time updates to UI

### Authentication Flow
1. User authenticates via Discord OAuth
2. Session created and stored
3. User-specific data accessible
4. Protected routes enforced

## Scalability Considerations

### Database
- Connection pooling via Drizzle
- Optimized queries with proper indexing
- Caching strategies for frequently accessed data

### Vector Search
- Namespace-based organization
- Efficient embedding strategies
- Rate limiting and request optimization

### AI Integration
- Streaming responses for better UX
- Model selection based on task complexity
- Cost optimization through model tiers

## Security

### Authentication
- OAuth 2.0 via Discord
- Secure session management
- CSRF protection

### Data Protection
- User data isolation
- Secure environment variable handling
- Rate limiting on API endpoints

### API Security
- Input validation and sanitization
- Proper error handling
- Request authentication
