# Database Schema

## Overview

MTGRulingsBot uses PostgreSQL as its primary database, managed through Drizzle ORM. The schema is designed to support chat functionality, user management, document artifacts, and MTG-specific data.

## Core Tables

### Users (`users`)
Stores user account information for authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  email_verified TIMESTAMP,
  password VARCHAR(255), -- For email/password auth (optional)
  image TEXT             -- Profile image URL
);
```

**Key Points:**
- Uses UUID for primary keys
- Supports both OAuth and email/password authentication
- Email verification timestamp for account verification

### Chats (`chats`)
Stores chat conversations between users and the AI.

```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- Each chat belongs to a user
- Cascade delete when user is removed
- Automatic timestamps

### Messages (`messages`)
Individual messages within chats.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- Role-based message system
- Supports multi-turn conversations
- Flexible content storage

### Documents (`documents`)
Artifact documents created through the system.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  kind VARCHAR(50) NOT NULL, -- 'text', 'code', 'image', 'sheet'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- Supports multiple artifact types
- Version control through timestamps
- User-owned documents

### Votes (`votes`)
Message voting system for feedback.

```sql
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL, -- 'up', 'down'
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(message_id, user_id) -- One vote per user per message
);
```

**Key Points:**
- Unique constraint prevents duplicate votes
- Simple up/down voting system

## MTG-Specific Tables

### Oracle Cards (`oracle_card`)
Official MTG card data from Scryfall.

```sql
CREATE TABLE oracle_card (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  mana_cost VARCHAR(100),
  cmc INTEGER,
  type_line VARCHAR(255),
  oracle_text TEXT,
  power VARCHAR(20),
  toughness VARCHAR(20),
  colors TEXT[], -- Array of color identifiers
  color_identity TEXT[],
  keywords TEXT[],
  legalities JSONB,
  released_at DATE,
  set_code VARCHAR(10),
  set_name VARCHAR(255),
  rarity VARCHAR(20),
  artist VARCHAR(255),
  flavor_text TEXT,
  image_uris JSONB,
  prices JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- Comprehensive card data structure
- JSONB for complex nested data
- Array types for multi-value fields

### Rulings (`ruling`)
Official card rulings and clarifications.

```sql
CREATE TABLE ruling (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID, -- References oracle_card.id
  source VARCHAR(50) NOT NULL,
  published_at DATE NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_oracle_id (oracle_id),
  INDEX idx_published_at (published_at)
);
```

**Key Points:**
- Links to oracle cards
- Indexed for efficient queries
- Source tracking (Wizards, Gatherer, etc.)

## Indexes and Performance

### Primary Indexes
- All tables use UUID primary keys
- Foreign key relationships automatically indexed

### Secondary Indexes
```sql
-- Chat queries
CREATE INDEX idx_chats_user_id ON chats(user_id);
CREATE INDEX idx_chats_created_at ON chats(created_at);

-- Message queries
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Document queries
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_kind ON documents(kind);

-- Card searches
CREATE INDEX idx_oracle_card_name ON oracle_card(name);
CREATE INDEX idx_oracle_card_set_code ON oracle_card(set_code);
CREATE INDEX idx_oracle_card_released_at ON oracle_card(released_at);

-- Full-text search
CREATE INDEX idx_oracle_card_oracle_text ON oracle_card USING gin(to_tsvector('english', oracle_text));
```

## Migrations

Database migrations are handled through Drizzle Kit:

```bash
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate

# Push schema changes (development)
npm run db:push
```

## Backup and Maintenance

### Automated Backups
- Neon provides automatic backups
- Point-in-time recovery available
- Cross-region replication for production

### Data Retention
- Chat messages: Indefinite (user-controlled deletion)
- Documents: Indefinite (user-controlled deletion)
- Oracle cards: Updated monthly
- Rulings: Updated as needed

### Cleanup Jobs
```sql
-- Remove old unverified users (7 days)
DELETE FROM users 
WHERE email_verified IS NULL 
  AND created_at < NOW() - INTERVAL '7 days';

-- Archive old chats (optional, user preference)
-- This would be handled through application logic
```

## Environment Variables

```bash
# Database connection
POSTGRES_URL=postgresql://user:pass@host:port/db

# Migration settings
DATABASE_URL=postgresql://user:pass@host:port/db
```

## Common Queries

### User Activity
```sql
-- Get user's recent chats
SELECT c.*, COUNT(m.id) as message_count
FROM chats c
LEFT JOIN messages m ON c.id = m.chat_id
WHERE c.user_id = $1
GROUP BY c.id
ORDER BY c.updated_at DESC
LIMIT 20;
```

### Card Search
```sql
-- Search cards by name and text
SELECT *
FROM oracle_card
WHERE name ILIKE '%$1%'
   OR oracle_text ILIKE '%$1%'
ORDER BY name
LIMIT 50;
```

### Document Versions
```sql
-- Get document history
SELECT *
FROM documents
WHERE user_id = $1 AND title = $2
ORDER BY created_at DESC;
```
