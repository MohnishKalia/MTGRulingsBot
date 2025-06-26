# Decklist Analysis

The MTGRulingsBot can analyze MTG decklists provided by the user. This feature allows users to paste a decklist into the chat and receive a detailed analysis of the deck.

## Supported Formats

The bot can understand decklists in a simple text format, where each line contains a card count followed by the card name. The set and collector number are ignored if present.

**Example 1:**

```
1 Goro-Goro and Satoru (MOC) 445 *F*
1 Abstergo Entertainment (ACR) 171
1 Alchemist's Gambit (VOW) 374
1 Arcane Signet (DSC) 92
```

**Example 2:**

```
1 Wash Away
1 Wayfarer's Bauble
1 Wrathful Red Dragon
1 Yuriko, the Tiger's Shadow
1 Goro-Goro and Satoru
```

## Analysis Details

When a decklist is provided, the bot will perform the following analysis:

1.  **Commander Identification**: The bot assumes the format is Commander/EDH and identifies the commander, which is typically the first or last card in the list.
2.  **Color Identity**: The bot determines the deck's color identity based on the commander.
3.  **Strategy**: The bot provides an overview of the deck's main strategy (e.g., aggro, control, combo, tribal).
4.  **Key Synergies**: The bot highlights key synergies and combos between the cards in the deck.
5.  **Win Condition**: The bot provides a brief summary of how the deck aims to win the game.

To perform the analysis, the bot uses the `fetchCardDetails` tool to retrieve information about each card in the decklist.
