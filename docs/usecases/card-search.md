# Card Search

The MTGRulingsBot can search for cards matching specific criteria using Scryfall's powerful query syntax. This is useful for finding cards by attributes like color, type, power/toughness, rarity, and more.

## How to Use

To search for cards, ask the bot to find cards matching certain conditions. The bot will use the `searchScryfall` tool to query the Scryfall database.

**Example 1: Search by color and power**

> show me all red creatures with power greater than 5

The bot will search using query: `c:red t:creature pow>5`

**Example 2: Search for commanders**

> find all commanders with blue in their color identity

The bot will search using query: `is:commander id:u`

**Example 3: Search by keywords and rarity**

> what are some rare cards with flying and trample

The bot will search using query: `r:rare o:flying o:trample`

## Search Syntax

The tool supports [Scryfall's query syntax](https://scryfall.com/docs/syntax), including:

- **Color**: `c:red`, `c:wu` (white or blue)
- **Type**: `t:creature`, `t:instant`
- **Power/Toughness**: `pow>5`, `tou<=3`
- **Mana Value**: `mv=3`, `mv>=4`
- **Keywords**: `o:flying` (oracle text contains "flying")
- **Rarity**: `r:rare`, `r:mythic`
- **Set**: `s:mkm` (set code)
- **Format legality**: `f:commander`, `f:standard`
- **Special filters**: `is:commander`, `is:permanent`

The bot will display the total count of matching cards and show a sample of the results, not the complete list (limited to 1000 cards maximum).
