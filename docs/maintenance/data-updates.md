# Data Updates

## Overview

MTGRulingsBot requires regular updates to maintain current Magic: The Gathering data. This includes comprehensive rules, oracle cards, rulings, and tournament rules. This guide covers the complete update process.

## Data Sources

### 1. Magic: The Gathering Comprehensive Rules
- **Source**: [Wizards of the Coast Rules Page](https://magic.wizards.com/en/rules)
- **Format**: Plain text file
- **Update Frequency**: As needed (major releases, rules changes)
- **Storage**: Upstash Vector (`cr` and `gls` namespaces)

### 2. Oracle Cards
- **Source**: [Scryfall Bulk Data API](https://scryfall.com/docs/api/bulk-data)
- **Format**: JSON
- **Update Frequency**: Daily (Scryfall updates)
- **Storage**: PostgreSQL `oracle_card` table

### 3. Card Rulings
- **Source**: [Scryfall Bulk Data API](https://scryfall.com/docs/api/bulk-data)
- **Format**: JSON
- **Update Frequency**: As needed (new rulings)
- **Storage**: PostgreSQL `ruling` table

### 4. Magic Tournament Rules
- **Source**: Manual upload (PDF from Wizards)
- **Format**: PDF
- **Update Frequency**: Quarterly or as needed
- **Storage**: Upstash Vector (`mtr` namespace)

## Update Procedures

### 1. Comprehensive Rules Update

The comprehensive rules include both the rules text and glossary definitions.

```bash
# Run the CR update script
python ./scripts/mtg_cr.py
```

**What this script does:**
1. Fetches the latest CR text file from Wizards
2. Parses the document into sections:
   - Table of Contents
   - Individual rules (100.1, 100.2, etc.)
   - Glossary terms
3. Creates embeddings for each section
4. Updates the `cr` and `gls` namespaces in Upstash Vector

**Manual steps:**
1. Verify the script completed successfully
2. Check the logs for any parsing errors
3. Test a few queries to ensure data is accessible

### 2. Oracle Cards and Rulings Update

Updates the PostgreSQL database with the latest card data and rulings.

```bash
# Run the oracle cards update script
python ./scripts/mtg_oracle_cards.py
```

**What this script does:**
1. Downloads latest bulk data from Scryfall API
2. Parses Oracle Cards and Rulings JSON
3. Truncates existing data (careful!)
4. Inserts new data into PostgreSQL tables
5. Updates statistics and metadata

**Database impact:**
```sql
-- This happens automatically in the script
TRUNCATE TABLE "public"."oracle_card" CASCADE;
TRUNCATE TABLE "public"."ruling" CASCADE;
```

### 3. Magic Tournament Rules Update

This requires manual intervention as the MTR is typically a PDF.

**Manual process:**
1. Download the latest MTR PDF from [Wizards Judge Resources](https://wpn.wizards.com/en/document/magic-tournament-rules)
2. Upload to Upstash Vector dashboard:
   - Go to your Upstash Vector database
   - Select the `mtr` namespace
   - Upload the PDF file
   - The system will automatically chunk and embed the content

**Alternative automated approach:**
```python
# If you have a PDF processing pipeline
from upstash_vector import Index

index = Index(url=UPSTASH_URL, token=UPSTASH_TOKEN)

# Process PDF and create vectors
# This would require additional PDF parsing logic
```

## Update Schedule

### Recommended Frequency

1. **Comprehensive Rules**: 
   - Check monthly
   - Update immediately after major set releases
   - Update when rules changes are announced

2. **Oracle Cards**:
   - Update weekly (new cards, errata)
   - Update immediately after spoiler season
   - Monitor Scryfall's bulk data timestamps

3. **Rulings**:
   - Update with Oracle Cards (they're fetched together)
   - Check after major tournaments or rules clarifications

4. **Tournament Rules**:
   - Check quarterly
   - Update immediately when new MTR is released
   - Monitor judge community announcements

### Automated Scheduling

Consider setting up automated updates using GitHub Actions or Vercel Cron:

```yaml
# .github/workflows/update-data.yml
name: Update MTG Data
on:
  schedule:
    - cron: '0 6 * * 1' # Weekly on Monday at 6 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  update-oracle-cards:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Update Oracle Cards
        run: python ./scripts/mtg_oracle_cards.py
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
```

## Data Validation

### Post-Update Checks

After each update, verify data integrity:

```bash
# Check database statistics
curl https://your-domain.com/api/dbStats

# Expected response includes:
# - oracleCardCount: ~25,000+ cards
# - rulingCount: ~15,000+ rulings
# - recentOracleCardDate: Recent date
# - vectorStats: Namespace counts
```

### Manual Verification

1. **Test search functionality**:
   - Search for recently released cards
   - Test rules queries
   - Verify glossary definitions

2. **Check data completeness**:
   - Compare counts with previous updates
   - Spot-check specific cards or rules
   - Verify new set data is present

3. **Performance testing**:
   - Monitor response times
   - Check vector similarity scores
   - Validate embedding quality

## Troubleshooting

### Common Issues

1. **Script Failures**
   ```bash
   # Check logs for specific errors
   python ./scripts/mtg_cr.py 2>&1 | tee update.log
   
   # Common issues:
   # - Network timeouts
   # - Parsing errors (format changes)
   # - Database connection issues
   # - Vector database limits
   ```

2. **Incomplete Data**
   ```bash
   # Verify all namespaces have data
   # Check database record counts
   # Compare with previous successful runs
   ```

3. **Performance Degradation**
   ```bash
   # Monitor query response times
   # Check database query plans
   # Verify vector similarity thresholds
   ```

### Recovery Procedures

1. **Rollback Database Changes**
   ```sql
   -- If you have backups, restore from backup
   -- Neon provides point-in-time recovery
   ```

2. **Partial Updates**
   ```bash
   # Update only specific data if needed
   # CR without glossary, or vice versa
   # Individual card sets
   ```

3. **Emergency Fixes**
   ```bash
   # Hotfix critical data issues
   # Manual database updates for urgent fixes
   # Temporary workarounds while fixing scripts
   ```

## Monitoring and Alerts

### Set Up Monitoring

1. **Database Monitoring**
   - Row counts in key tables
   - Query performance metrics
   - Connection pool usage

2. **Vector Database Monitoring**
   - Namespace record counts
   - Query performance
   - Embedding quality metrics

3. **Application Monitoring**
   - Search success rates
   - User query patterns
   - Error rates after updates

### Alert Configuration

```bash
# Example monitoring checks
# - Oracle card count drops below threshold
# - Vector namespaces become empty
# - Update scripts fail
# - Query response times increase significantly
```

## Best Practices

### Before Updates
1. **Backup current data** (automatic with managed services)
2. **Test update scripts** in development environment
3. **Check for breaking changes** in data sources
4. **Schedule during low-usage periods**

### During Updates
1. **Monitor progress** through logs
2. **Be prepared to rollback** if issues arise
3. **Communicate status** to users if necessary
4. **Validate incrementally** rather than all at once

### After Updates
1. **Verify data integrity** with automated checks
2. **Test key functionality** manually
3. **Monitor user feedback** for data issues
4. **Document any issues** and resolutions
5. **Update this documentation** if procedures change

## Performance Considerations

### Large Data Updates
- Oracle cards: ~25,000+ records
- Rulings: ~15,000+ records  
- CR sections: ~1,000+ entries
- Consider batch processing for large updates

### Resource Usage
- Monitor memory usage during processing
- Use connection pooling for database operations
- Implement rate limiting for API calls

### User Impact
- Updates may cause temporary slowdowns
- Consider maintenance windows for major updates
- Implement graceful degradation during updates
