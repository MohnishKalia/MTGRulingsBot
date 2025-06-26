# Vercel Deployment

## Overview

MTGRulingsBot is designed to be deployed on Vercel with minimal configuration. This guide covers the complete deployment process from setup to production.

## Prerequisites

- Vercel account
- GitHub repository
- Required external services:
  - PostgreSQL database (Neon recommended)
  - Upstash Vector database
  - Discord OAuth application
  - OpenAI API key

## Quick Deploy

### One-Click Deploy
Use the deploy button for fastest setup:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/MTGRulingsBot)

### Manual Deployment

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy from project directory
   vercel
   ```

2. **Configure Project**
   - Choose team/personal account
   - Confirm project settings
   - Set up environment variables

## Environment Variables

### Required Variables
Configure these in your Vercel dashboard under Settings → Environment Variables:

```bash
# Authentication
AUTH_SECRET=your-32-char-secret-key
DISCORD_CLIENT_ID=your-discord-client-id
DISCORD_CLIENT_SECRET=your-discord-client-secret

# Database
POSTGRES_URL=postgresql://user:pass@host:port/db

# Vector Database
UPSTASH_VECTOR_REST_URL=https://your-vector-db.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your-vector-token

# AI Provider
OPENAI_API_KEY=sk-your-openai-key

# Optional: Site Configuration
SITE_URL=https://your-domain.com
```

### Environment-Specific Variables
Set different values for different environments:

- **Development**: Use `.env.local` file
- **Preview**: Set in Vercel dashboard
- **Production**: Set in Vercel dashboard

## Database Setup

### 1. PostgreSQL (Neon)
```bash
# Create database on Neon
# Copy connection string to POSTGRES_URL

# Run migrations
npx drizzle-kit push:pg
```

### 2. Upstash Vector
```bash
# Create vector database on Upstash
# Create namespaces: cr, gls, mtr
# Copy URL and token to environment variables
```

## Build Configuration

### Next.js Configuration
The `next.config.ts` is already optimized for Vercel:

```typescript
const nextConfig: NextConfig = {
  experimental: {
    ppr: true, // Partial Pre-rendering
  },
  images: {
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
    ],
  },
};
```

### Build Settings in Vercel
- **Framework Preset**: Next.js
- **Node.js Version**: 18.x (or latest)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Domain Configuration

### 1. Custom Domain
1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `SITE_URL` environment variable

### 2. SSL Certificate
- Vercel automatically provides SSL certificates
- Certificates auto-renew
- Force HTTPS in production

## Performance Optimization

### 1. Caching Strategy
```typescript
// API route caching
export const revalidate = 86400; // 24 hours

// Database query optimization
export const dynamic = 'force-dynamic'; // For real-time features
```

### 2. Edge Functions
Consider moving suitable API routes to Edge Runtime:

```typescript
export const runtime = 'edge';
```

### 3. Image Optimization
```typescript
// next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cards.scryfall.io',
    },
  ],
},
```

## Monitoring and Analytics

### 1. Vercel Analytics
Enable in dashboard:
- Web Analytics
- Speed Insights
- Function Metrics

### 2. Error Monitoring
Consider integrating:
- Sentry for error tracking
- LogRocket for user sessions
- Custom logging for business metrics

## Scaling Considerations

### 1. Function Limits
- Serverless Function Timeout: 10s (Pro), 60s (Enterprise)
- Memory: Up to 1GB
- Payload: 5MB request/response

### 2. Database Connections
```typescript
// Use connection pooling
const client = postgres(process.env.POSTGRES_URL, {
  max: 10, // Limit concurrent connections
});
```

### 3. Rate Limiting
Implement rate limiting for API routes:

```typescript
// Example rate limiting middleware
import { ratelimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const { success } = await ratelimit.limit(request.ip);
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  // Continue with request
}
```

## CI/CD Pipeline

### Automatic Deployments
Vercel automatically deploys on:
- Push to main branch (production)
- Pull requests (preview deployments)
- Manual deploys from dashboard

### Preview Deployments
- Each PR gets a unique preview URL
- Environment variables copied from production
- Perfect for testing before merge

### Build Optimization
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "postbuild": "next-sitemap"
  }
}
```

## Security

### 1. Environment Variables
- Never commit secrets to git
- Use Vercel's encrypted environment variables
- Rotate secrets regularly

### 2. Headers
```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
      ],
    },
  ];
},
```

### 3. Content Security Policy
Implement CSP headers for additional security.

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Common issues:
   # - Missing environment variables
   # - TypeScript errors
   # - Package dependency issues
   ```

2. **Database Connection Issues**
   ```bash
   # Verify POSTGRES_URL format
   # Check database accessibility
   # Verify SSL requirements
   ```

3. **API Route Timeouts**
   ```bash
   # Optimize slow queries
   # Add request timeouts
   # Consider edge runtime for faster cold starts
   ```

4. **Environment Variable Issues**
   ```bash
   # Check variable names (case sensitive)
   # Verify values are set correctly
   # Ensure no trailing spaces
   ```

### Debug Mode
Enable verbose logging:

```bash
# Add to environment variables
DEBUG=1
NEXTAUTH_DEBUG=1
```

## Maintenance

### 1. Regular Updates
- Update dependencies monthly
- Monitor security advisories
- Test in preview before production

### 2. Database Maintenance
```bash
# Regular data updates
npm run update-mtg-data

# Monitor database performance
# Set up automated backups
```

### 3. Monitoring
- Set up alerts for:
  - Function errors
  - High response times
  - Database connection issues
  - API rate limits

## Support

### Vercel Resources
- [Documentation](https://vercel.com/docs)
- [Community Forum](https://github.com/vercel/vercel/discussions)
- [Status Page](https://vercel-status.com/)

### Project-Specific Help
- Check GitHub Issues
- Review deployment logs
- Contact team through established channels
