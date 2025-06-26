import datetime
import uuid
import json
from pydantic import BaseModel
from typing import Any, Literal, Optional
import psycopg2
from psycopg2.extras import execute_batch
import dotenv
import logging
import os
import requests

dotenv.load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env.local'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class OracleCard(BaseModel):
    object: Literal["card"]
    oracle_id: uuid.UUID
    name: str
    released_at: datetime.date
    scryfall_uri: str
    layout: str
    image_uris: Optional[dict[str, str]] = None
    mana_cost: Optional[str] = None
    cmc: Optional[float] = None
    type_line: Optional[str] = None
    card_faces: Optional[list[dict[str, Any]]] = None
    oracle_text: Optional[str] = None
    power: Optional[str] = None
    toughness: Optional[str] = None
    colors: Optional[list[str]] = None
    keywords: Optional[list[str]] = None
    games: Optional[list[str]] = None
    edhrec_rank: Optional[int] = None
    
class Ruling(BaseModel):
    object: Literal["ruling"]
    oracle_id: uuid.UUID
    source: str
    published_at: datetime.date
    comment: str

# load scryfall data
bulk_data_endpoint = "https://api.scryfall.com/bulk-data"
bulk_data = requests.get(bulk_data_endpoint).json()

# Extract download URIs for oracle_cards and rulings
oracle_cards_uri = None
rulings_uri = None

for data in bulk_data['data']:
    if data['type'] == 'oracle_cards':
        oracle_cards_uri = data['download_uri']
    elif data['type'] == 'rulings':
        rulings_uri = data['download_uri']

if not oracle_cards_uri:
    raise ValueError("Could not find download URIs for oracle_cards")
if not rulings_uri:
    raise ValueError("Could not find download URIs for rulings")

# Fetch latest oracle_cards and rulings
oracle_cards_response = requests.get(oracle_cards_uri)
rulings_response = requests.get(rulings_uri)

card_dicts: list[dict] = oracle_cards_response.json()
ruling_dicts: list[dict] = rulings_response.json()

# with open("./ref_files/oracle-cards.json", "r") as f:
#     card_dicts = json.load(f)
# with open("./ref_files/rulings.json", "r") as f:
#     ruling_dicts = json.load(f)

# import the jsonl file
cards = [OracleCard.model_validate(card_dict) for card_dict in card_dicts]
rulings = [Ruling.model_validate(ruling_dict) for ruling_dict in ruling_dicts]

# print the first 3 cards
logging.info([c.model_dump_json(indent=4) for c in cards[:3]])
# print the last 3 cards
logging.info([c.model_dump_json(indent=4) for c in cards[-3:]])
# print the count of cards
logging.info(f"Cards count: {len(cards)}")

# print the first 3 rulings
logging.info([c.model_dump_json(indent=4) for c in rulings[:3]])
# print the last 3 rulings
logging.info([c.model_dump_json(indent=4) for c in rulings[-3:]])
# print the count of rulings
logging.info(f"Rulings count: {len(rulings)}")

# upload to postgres

# Fetch variables
DB_URL = os.getenv("DATABASE_URL")

# Connect to the database
with psycopg2.connect(DB_URL) as conn, conn.cursor() as cur:
    # Check connection
    cur.execute("SELECT version();")
    logging.info(f"Connected to: {cur.fetchone()}")

    # Create temporary tables
    cur.execute("""
        CREATE TABLE oracle_card_new (
            id UUID PRIMARY KEY,
            oracle_id UUID UNIQUE NOT NULL,
            name TEXT NOT NULL,
            released_at DATE NOT NULL,
            scryfall_uri TEXT NOT NULL,
            layout TEXT NOT NULL,
            image_uris JSON,
            mana_cost TEXT,
            cmc DOUBLE PRECISION,
            type_line TEXT,
            card_faces JSON,
            oracle_text TEXT,
            power TEXT,
            toughness TEXT,
            colors TEXT[],
            keywords TEXT[],
            games TEXT[],
            edhrec_rank INTEGER
        );
    """)
    logging.info("Created oracle_card_new table")

    cur.execute("""
        CREATE TABLE ruling_new (
            id UUID PRIMARY KEY,
            oracle_id UUID,
            source TEXT NOT NULL,
            published_at DATE NOT NULL,
            comment TEXT NOT NULL
        );
    """)
    logging.info("Created ruling_new table")

    def card_to_db_dict(card):
        d = card.model_dump(mode='json')
        d['id'] = str(uuid.uuid4())
        # Convert dict fields to JSON strings for JSONB columns
        if d.get('image_uris') is not None:
            d['image_uris'] = json.dumps(d['image_uris'])
        if d.get('card_faces') is not None:
            d['card_faces'] = json.dumps(d['card_faces'])
        return d

    def ruling_to_db_dict(ruling):
        d = ruling.model_dump(mode='json')
        d['id'] = str(uuid.uuid4())
        return d

    # Insert data into temporary tables
    execute_batch(cur, """
        INSERT INTO oracle_card_new (
            id, oracle_id, name, released_at, scryfall_uri, layout, image_uris,
            mana_cost, cmc, type_line, card_faces, oracle_text, power, toughness,
            colors, keywords, games, edhrec_rank
        ) VALUES (
            %(id)s, %(oracle_id)s, %(name)s, %(released_at)s, %(scryfall_uri)s,
            %(layout)s, %(image_uris)s, %(mana_cost)s, %(cmc)s, %(type_line)s,
            %(card_faces)s, %(oracle_text)s, %(power)s, %(toughness)s, %(colors)s,
            %(keywords)s, %(games)s, %(edhrec_rank)s
        );
    """, [card_to_db_dict(c) for c in cards])
    logging.info("Inserted data into oracle_card_new")

    execute_batch(cur, """
        INSERT INTO ruling_new (
            id, oracle_id, source, published_at, comment
        ) VALUES (
            %(id)s, %(oracle_id)s, %(source)s, %(published_at)s, %(comment)s
        );
    """, [ruling_to_db_dict(r) for r in rulings])
    logging.info("Inserted data into ruling_new")

    # Swap tables
    cur.execute("DROP TABLE IF EXISTS ruling, oracle_card CASCADE;")
    logging.info("Dropped old tables")

    cur.execute("ALTER TABLE oracle_card_new RENAME TO oracle_card;")
    logging.info("Renamed oracle_card_new to oracle_card")

    cur.execute("ALTER TABLE ruling_new RENAME TO ruling;")
    logging.info("Renamed ruling_new to ruling")

    cur.execute("""
        ALTER TABLE ruling
        ADD CONSTRAINT ruling_oracle_id_oracle_card_oracle_id_fk
        FOREIGN KEY (oracle_id) REFERENCES oracle_card(oracle_id);
    """)
    logging.info("Recreated foreign key constraint")

    conn.commit()

logging.info("Database update complete.")
