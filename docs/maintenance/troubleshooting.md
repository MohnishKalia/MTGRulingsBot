# Troubleshooting Guide

## Common Issues and Solutions

This guide covers the most common issues you might encounter with MTGRulingsBot and their solutions.

## Authentication Issues

### "Configuration Error" on Login
**Symptoms**: Error page shows "Configuration" when trying to log in.

**Causes & Solutions**:
1. **Missing AUTH_SECRET**
   ```bash
   # Check if AUTH_SECRET is set
   echo $AUTH_SECRET
   
   # Generate new secret
   openssl rand -base64 32
   ```

2. **Incorrect NEXTAUTH_URL**
   ```bash
   # Should match your domain exactly
   # Development: http://localhost:3000
   # Production: https://your-domain.com
   ```

3. **Discord OAuth misconfiguration**
   - Verify redirect URI in Discord app matches your domain
   - Check client ID and secret are correct

### "Access Denied" from Discord
**Symptoms**: Discord returns error after user authorizes.

**Solutions**:
1. **Check redirect URI**
   - Must exactly match Discord app settings
   - Include `/api/auth/callback/discord` path
   
2. **Verify Discord app status**
   - Ensure app is not in development mode restrictions
   - Check if app has correct permissions

### Session Not Persisting
**Symptoms**: User gets logged out immediately or on page refresh.

**Solutions**:
1. **Check domain settings**
   ```bash
   # NEXTAUTH_URL must match browser URL
   # Check for HTTP vs HTTPS mismatches
   ```

2. **Cookie issues**
   - Clear browser cookies and try again
   - Check if running on different ports
   - Verify secure cookie settings in production

## Database Issues

### Connection Failures
**Symptoms**: API endpoints return 500 errors, database queries fail.

**Diagnostic Steps**:
```bash
# Test connection string format
echo $POSTGRES_URL

# Should be: postgresql://user:pass@host:port/db
# Or: postgresql://user:pass@host:port/db?sslmode=require
```

**Solutions**:
1. **Verify connection string**
   - Check username, password, host, port, database name
   - Ensure special characters are URL encoded
   
2. **Network access**
   - Check if database allows connections from your IP
   - Verify firewall settings
   - For Vercel: ensure database allows Vercel IPs

3. **SSL requirements**
   ```bash
   # Try adding SSL mode
   POSTGRES_URL="postgresql://user:pass@host:port/db?sslmode=require"
   ```

### Migration Issues
**Symptoms**: Database schema errors, missing tables.

**Solutions**:
```bash
# Check current schema
npm run db:studio

# Push latest schema
npm run db:push

# Generate and run migrations
npm run db:generate
npm run db:migrate
```

### Data Loading Issues
**Symptoms**: Empty results, missing MTG data.

**Solutions**:
```bash
# Check data status
curl http://localhost:3000/api/dbStats

# Update oracle cards
python ./scripts/mtg_oracle_cards.py

# Update comprehensive rules
python ./scripts/mtg_cr.py
```

## Vector Database Issues

### Empty Namespaces
**Symptoms**: `/api/dbStats` shows zero vectors in namespaces.

**Solutions**:
1. **Check namespace creation**
   - Log into Upstash dashboard
   - Verify `cr`, `gls`, `mtr` namespaces exist
   
2. **Re-run data loading**
   ```bash
   # Update comprehensive rules and glossary
   python ./scripts/mtg_cr.py
   
   # Manual MTR upload required
   # Upload PDF to mtr namespace via dashboard
   ```

### Connection Issues
**Symptoms**: Vector search fails, /api/dbStats returns errors.

**Solutions**:
1. **Verify credentials**
   ```bash
   echo $UPSTASH_VECTOR_REST_URL
   echo $UPSTASH_VECTOR_REST_TOKEN
   ```

2. **Check URL format**
   ```bash
   # Must include https://
   # Format: https://your-db-name.upstash.io
   ```

3. **Test connection**
   ```bash
   # Use Upstash console or API directly
   curl -X GET "$UPSTASH_VECTOR_REST_URL/info" \
     -H "Authorization: Bearer $UPSTASH_VECTOR_REST_TOKEN"
   ```

## AI Integration Issues

### OpenAI API Errors
**Symptoms**: Chat responses fail, streaming stops unexpectedly.

**Common Errors & Solutions**:

1. **Invalid API Key**
   ```bash
   # Check key format (should start with sk-)
   echo $OPENAI_API_KEY | cut -c1-3
   # Should output: sk-
   ```

2. **Rate Limiting**
   ```bash
   # Error: Rate limit exceeded
   # Solution: Implement exponential backoff
   # Check usage in OpenAI dashboard
   ```

3. **Billing Issues**
   ```bash
   # Error: Insufficient quota
   # Solution: Add payment method to OpenAI account
   # Check current usage and limits
   ```

4. **Model Availability**
   ```bash
   # Error: Model not found
   # Check if model name is correct in models.ts
   # Verify model access in OpenAI dashboard
   ```

### Streaming Issues
**Symptoms**: Responses appear slowly or get cut off.

**Solutions**:
1. **Check network connectivity**
2. **Verify streaming implementation**
3. **Test with different models**
4. **Check browser console for errors**

## Performance Issues

### Slow Response Times
**Symptoms**: Long delays before responses appear.

**Diagnostic Steps**:
1. **Check database performance**
   ```sql
   -- In database console
   SELECT * FROM pg_stat_activity;
   ```

2. **Monitor vector search times**
   - Check response times in browser dev tools
   - Compare with direct Upstash queries

3. **AI model performance**
   - Test with different models
   - Check OpenAI status page

**Solutions**:
1. **Database optimization**
   - Add indexes for frequently queried columns
   - Use connection pooling
   - Optimize query patterns

2. **Vector search optimization**
   - Reduce search result limits
   - Implement caching
   - Use more specific queries

3. **AI optimization**
   - Use faster models for simple queries
   - Implement request caching
   - Optimize prompt length

### High Memory Usage
**Symptoms**: Application crashes, out of memory errors.

**Solutions**:
1. **Optimize database queries**
   - Use pagination for large result sets
   - Implement proper connection pooling
   
2. **Vector processing**
   - Process embeddings in batches
   - Clear unused vectors from memory

3. **Streaming optimization**
   - Implement proper cleanup of streaming connections
   - Use memory-efficient data structures

## Development Issues

### Build Failures
**Symptoms**: `npm run build` fails with errors.

**Common Solutions**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Check for missing dependencies
npm audit
```

### Environment Variable Issues
**Symptoms**: Variables not loading, undefined values.

**Solutions**:
1. **Check file naming**
   ```bash
   # Should be .env.local for Next.js
   ls -la .env*
   ```

2. **Verify variable names**
   ```bash
   # Check exact spelling, case sensitivity
   grep -n "POSTGRES_URL" .env.local
   ```

3. **Restart development server**
   ```bash
   # Environment changes require restart
   npm run dev
   ```

### Python Script Issues
**Symptoms**: Data update scripts fail to run.

**Solutions**:
1. **Check Python environment**
   ```bash
   # Verify Python version
   python --version
   
   # Install requirements
   pip install -r requirements.txt
   ```

2. **Environment variables**
   ```bash
   # Python scripts need .env.local
   # Check dotenv loading in scripts
   ```

3. **Run from project root**
   ```bash
   # Scripts expect to be run from project root
   python ./scripts/mtg_cr.py
   ```

## Deployment Issues

### Vercel Deployment Failures
**Symptoms**: Build fails on Vercel, functions timeout.

**Solutions**:
1. **Check build logs**
   - Review detailed error messages in Vercel dashboard
   - Compare with local build success

2. **Environment variables**
   - Verify all required variables are set in Vercel
   - Check for typos in variable names

3. **Function timeouts**
   ```bash
   # Optimize slow API routes
   # Consider using Edge Runtime for faster cold starts
   export const runtime = 'edge';
   ```

4. **Memory limits**
   - Check function memory usage
   - Optimize large data processing
   - Use streaming for large responses

### Domain/SSL Issues
**Symptoms**: HTTPS errors, domain not resolving.

**Solutions**:
1. **DNS configuration**
   - Verify DNS records point to Vercel
   - Check propagation with dig or nslookup

2. **SSL certificate**
   - Vercel auto-generates SSL certificates
   - Check certificate status in dashboard
   - Verify domain ownership

## Testing Issues

### Playwright Test Failures
**Symptoms**: Tests fail locally or in CI.

**Solutions**:
```bash
# Install browser dependencies
npx playwright install

# Run tests with debug info
npx playwright test --debug

# Check test artifacts
npx playwright show-report
```

### Authentication in Tests
**Symptoms**: Tests can't authenticate users.

**Solutions**:
1. **Check auth setup**
   - Verify `auth.setup.ts` runs successfully
   - Check storage state files exist

2. **Environment variables**
   - Ensure test environment has required variables
   - Check AUTH_SECRET is consistent

## Getting Help

### Debug Information to Collect
When reporting issues, include:

1. **Environment details**
   ```bash
   # Node version
   node --version
   
   # Package versions
   npm list next react
   ```

2. **Error messages**
   - Full error stack traces
   - Browser console errors
   - Server logs

3. **Configuration**
   - Environment variable names (not values!)
   - Relevant configuration files
   - Steps to reproduce

### Resources
- **GitHub Issues**: Check existing issues and solutions
- **Documentation**: Review relevant docs sections
- **Community**: Stack Overflow, Discord servers
- **Status Pages**: Check service status for external dependencies

### Emergency Fixes
For critical production issues:

1. **Rollback deployment**
   ```bash
   # In Vercel dashboard
   # Go to Deployments → Previous deployment → Promote
   ```

2. **Hotfix environment variables**
   - Quick fixes via Vercel dashboard
   - Trigger redeployment after changes

3. **Database recovery**
   - Use point-in-time recovery if available
   - Check automated backups

Remember: When in doubt, check the logs first! Most issues have clear error messages that point to the solution.
