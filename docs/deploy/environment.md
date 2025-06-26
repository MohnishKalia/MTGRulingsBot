# Environment Variables

## Overview

MTGRulingsBot requires several environment variables for proper operation. This guide covers all required and optional variables, their purposes, and setup instructions.

## Required Variables

### Authentication
```bash
# NextAuth.js secret key for JWT signing and encryption
# Generate with: openssl rand -base64 32
AUTH_SECRET=your-32-character-secret-key-here

# Discord OAuth Application Credentials
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Production URL (adjust for your domain)
NEXTAUTH_URL=https://your-domain.com
```

### Database
```bash
# PostgreSQL connection string
# Format: postgresql://user:password@host:port/database
POSTGRES_URL=postgresql://user:pass@host.neon.tech:5432/database

# Alternative format with SSL (some providers)
# POSTGRES_URL=postgresql://user:pass@host:port/db?sslmode=require
```

### Vector Database
```bash
# Upstash Vector Database credentials
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-upstash-vector-token
```

### AI Provider
```bash
# OpenAI API key for language model access
OPENAI_API_KEY=sk-your-openai-api-key-here
```

## Optional Variables

### Site Configuration
```bash
# Site URL for SEO and social sharing
SITE_URL=https://your-domain.com

# Custom branding
SITE_NAME="MTG Rulings Bot"
SITE_DESCRIPTION="AI-powered Magic: The Gathering rules assistant"
```

### Development
```bash
# Enable debug logging
DEBUG=1
NEXTAUTH_DEBUG=1

# Development database (separate from production)
POSTGRES_URL_DEV=postgresql://user:pass@localhost:5432/mtg_dev
```

### Performance
```bash
# Database connection pool settings
POSTGRES_MAX_CONNECTIONS=10
POSTGRES_IDLE_TIMEOUT=30000

# AI model configuration
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.7
```

## Environment Setup by Platform

### Local Development (.env.local)
```bash
# Copy from .env.example and fill in values
cp .env.example .env.local

# Edit with your values
AUTH_SECRET=generate-with-openssl-rand-base64-32
DISCORD_CLIENT_ID=your-discord-app-client-id
DISCORD_CLIENT_SECRET=your-discord-app-client-secret
POSTGRES_URL=postgresql://user:pass@localhost:5432/mtgbot
UPSTASH_VECTOR_REST_URL=https://your-vector.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-token-here
OPENAI_API_KEY=sk-your-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Vercel Production
Set in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Production values
AUTH_SECRET=your-production-secret
DISCORD_CLIENT_ID=same-as-dev
DISCORD_CLIENT_SECRET=same-as-dev
POSTGRES_URL=your-production-database-url
UPSTASH_VECTOR_REST_URL=your-production-vector-url
UPSTASH_VECTOR_REST_TOKEN=your-production-vector-token
OPENAI_API_KEY=your-openai-key
NEXTAUTH_URL=https://your-domain.com
SITE_URL=https://your-domain.com
```

### Vercel Preview
Same as production but with preview URLs:

```bash
NEXTAUTH_URL=https://your-git-branch-username.vercel.app
SITE_URL=https://your-git-branch-username.vercel.app
```

## Service-Specific Setup

### Discord OAuth
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application or select existing
3. Go to OAuth2 → General
4. Copy Client ID and Client Secret
5. Add redirect URIs:
   - Dev: `http://localhost:3000/api/auth/callback/discord`
   - Prod: `https://your-domain.com/api/auth/callback/discord`

### PostgreSQL (Neon)
1. Create account at [Neon](https://neon.tech)
2. Create new project
3. Copy connection string from dashboard
4. Format: `postgresql://user:pass@host.neon.tech:5432/db`

### Upstash Vector
1. Create account at [Upstash](https://upstash.com)  
2. Create new Vector database
3. Copy REST URL and token from dashboard
4. Create namespaces: `cr`, `gls`, `mtr`

### OpenAI
1. Create account at [OpenAI](https://platform.openai.com)
2. Generate API key in dashboard
3. Add billing information for usage
4. Copy key (starts with `sk-`)

## Validation

### Environment Validation Script
```bash
# Check all required variables are set
node -e "
const required = [
  'AUTH_SECRET',
  'DISCORD_CLIENT_ID', 
  'DISCORD_CLIENT_SECRET',
  'POSTGRES_URL',
  'UPSTASH_VECTOR_REST_URL',
  'UPSTASH_VECTOR_REST_TOKEN',
  'OPENAI_API_KEY'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing variables:', missing);
  process.exit(1);
} else {
  console.log('All required variables set!');
}
"
```

### Connection Testing
```bash
# Test database connection
npm run db:studio

# Test vector database (check /api/dbStats endpoint)
curl http://localhost:3000/api/dbStats

# Test authentication
# Try logging in through the UI
```

## Security Best Practices

### Secret Generation
```bash
# Generate strong secrets
openssl rand -base64 32  # For AUTH_SECRET
openssl rand -hex 32     # Alternative format

# Use different secrets for different environments
```

### Secret Management
- Never commit secrets to version control
- Use different secrets for dev/staging/production
- Rotate secrets regularly (especially AUTH_SECRET)
- Use environment-specific service accounts

### Access Control
```bash
# Limit database access to specific IPs
# Use read-only replicas where possible
# Implement API key rotation for OpenAI
```

## Troubleshooting

### Common Issues

1. **"Configuration Error" on login**
   ```bash
   # Check AUTH_SECRET is set and NEXTAUTH_URL matches your domain
   echo $AUTH_SECRET
   echo $NEXTAUTH_URL
   ```

2. **Database connection failures**
   ```bash
   # Verify POSTGRES_URL format
   # Check network access (Vercel IP allowlist)
   # Test connection with psql
   ```

3. **Vector database errors**
   ```bash
   # Verify URL format (must include https://)
   # Check token permissions
   # Ensure namespaces exist
   ```

4. **OpenAI API errors**
   ```bash
   # Check API key format (starts with sk-)
   # Verify billing setup
   # Check usage limits
   ```

### Debug Environment
```bash
# Enable verbose logging
DEBUG=1
NEXTAUTH_DEBUG=1

# Test in development mode
npm run dev
```

### Variable Precedence
1. Vercel environment variables (production)
2. `.env.local` (local development)
3. `.env` (defaults, usually not used)
4. System environment variables

## Migration Guide

### From Development to Production
1. Copy all required variables
2. Update URLs to production domains
3. Use production database credentials
4. Generate new AUTH_SECRET for production
5. Test all functionality in preview deployment first

### Adding New Variables
1. Update this documentation
2. Add to environment validation
3. Update `.env.example`
4. Add to Vercel dashboard
5. Update deployment scripts if needed

## Monitoring

### Variable Health Checks
- Monitor for missing variables at startup
- Check database connectivity
- Validate external service access
- Alert on authentication failures

### Rotation Schedule
- AUTH_SECRET: Every 6 months
- Database passwords: Every 3 months  
- API keys: Every 6 months or as needed
- OAuth secrets: When rotating Discord app
