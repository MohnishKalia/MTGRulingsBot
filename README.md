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
- (?)Rulings forums/databases for historical precedent

## Roadmap

- [ ] Implement vector db with search on the comprules
- [ ] Build text box input classifier to pick out card names from a sample user query
- [ ] Function to get oracle text of a card(s)
- [ ] Function to get rulings of a card(s)

## Quickstart

1. Clone the repository:
    ```sh
    git clone https://github.com/MohnishKalia/MTGRulingsBot.git
    ```
2. Navigate to the project directory:
    ```sh
    cd MTGRulingsBot
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Run the bot:
    ```sh
    npm start
    ```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.