# MTGRulingsBot Documentation

Welcome to the MTGRulingsBot documentation! This is a comprehensive AI-powered Magic: The Gathering rules assistant built with Next.js, AI SDK, and modern web technologies.

## 📚 Documentation Structure

### Getting Started
- [Quick Start Guide](./01-quick-start.md) - Get up and running quickly
- [Update Models](./02-update-models.md) - Configure AI models
- [Artifacts](./03-artifacts.md) - Working with the artifact system

### Architecture
- [System Overview](./architecture/overview.md) - High-level system architecture
- [Data Flow](./architecture/data-flow.md) - How data moves through the system
- [Component Structure](./architecture/components.md) - Component organization

### Database & Data
- [Database Schema](./db/schema.md) - PostgreSQL database structure
- [Vector Store](./db/vector-store.md) - Upstash Vector configuration
- [Data Updates](./db/updates.md) - Keeping MTG data current
- [Migrations](./db/migrations.md) - Database migration process

### Authentication
- [Auth Overview](./auth/overview.md) - Authentication system
- [Discord Integration](./auth/discord.md) - Discord OAuth setup
- [Session Management](./auth/sessions.md) - How sessions work

### API Reference
- [Chat API](./api/chat.md) - Chat-related endpoints
- [Document API](./api/documents.md) - Document management
- [Vote API](./api/votes.md) - Message voting system
- [Stats API](./api/stats.md) - Database statistics

### Deployment
- [Vercel Deployment](./deploy/vercel.md) - Deploy to Vercel
- [Environment Variables](./deploy/environment.md) - Required configuration
- [Production Setup](./deploy/production.md) - Production considerations

### Maintenance
- [Data Updates](./maintenance/data-updates.md) - Updating MTG data
- [Monitoring](./maintenance/monitoring.md) - System health monitoring
- [Troubleshooting](./maintenance/troubleshooting.md) - Common issues

### Development Notes
- [Known Oddities](./oddities/README.md) - Quirks and workarounds
- [Performance Notes](./oddities/performance.md) - Performance considerations
- [Edge Cases](./oddities/edge-cases.md) - Special handling required

## 🚀 Quick Links

- **New to the project?** Start with the [Quick Start Guide](./01-quick-start.md)
- **Need to deploy?** Check out [Vercel Deployment](./deploy/vercel.md)
- **Updating MTG data?** See [Data Updates](./maintenance/data-updates.md)
- **API issues?** Browse the [API Reference](./api/)
- **Something broken?** Try [Troubleshooting](./maintenance/troubleshooting.md)

## 🤝 Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

## 📖 External Resources

- [Magic: The Gathering Comprehensive Rules](https://magic.wizards.com/en/rules)
- [Scryfall API Documentation](https://scryfall.com/docs/api)
- [Next.js Documentation](https://nextjs.org/docs)
- [AI SDK Documentation](https://sdk.vercel.ai)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
