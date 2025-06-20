# MTGRulingsBot

MTGRulingsBot is a project designed to provide rulings and information about Magic: The Gathering cards.

## Description

This bot fetches and displays rulings for Magic: The Gathering cards, helping players understand the rules and interactions of their cards.

## Data Sources

- Scryfall oracle cards
    - https://scryfall.com/docs/api/bulk-data
- Scryfall card rulings
    - https://scryfall.com/docs/api/bulk-data
- Magic comprehensive rules
    - https://magic.wizards.com/en/rules
- Magic tournament rules
    - https://wpn.wizards.com/en/rules-documents
- (?)Rulings forums/databases for historical precedent

## Roadmap

- [ ] Implement vector db with search on the comprules
- [ ] Build text box input classifier to pick out card names from a sample user query
- [ ] Function to get oracle text of a card(s)
- [ ] Function to get rulings of a card(s)

## Quickstart

### General setup

1. Clone the repository:
    ```sh
    git clone https://github.com/MohnishKalia/MTGRulingsBot.git
    ```
2. Navigate to the project directory:
    ```sh
    cd MTGRulingsBot
    ```

### Chatbot

1. Install dependencies:
    ```sh
    npm install
    ```
2. Run the bot:
    ```sh
    npm start
    ```

### Update Data

Split into vector db indexes and postgres db.

#### Update Indexes

To update indexes, follow these steps:

1. Remove all data in Upstash (through Vercel dashboard).
2. Download the latest Magic Tournament Rules and upload the PDF into the `mtr` namespace.
3. Run the following script to update the comprehensive rules `cr` and glossary `gls` namespaces:
    ```sh
    python ./scripts/mtg_cr.py
    ```

#### Update DB

To update the database, follow these steps:

1. Remove all data in Neon via Vercel (run the following SQL command):
    ```sql
    TRUNCATE TABLE "public"."oracle_card" CASCADE;
    ```
2. Run the following script to update the oracle cards `"public"."oracle_card"` and rulings `"public"."rulings"` tables:
    ```sh
    python ./scripts/mtg_oracle_cards.py
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.