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

dotenv.load_dotenv('.env.local')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class OracleCard(BaseModel):
    object: Literal["card"]
    oracle_id: uuid.UUID
    name: str
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
PG_USER = os.getenv("SB_POOL_PGUSER")
PG_PASSWORD = os.getenv("SB_POOL_PGPASSWORD")
PG_HOST = os.getenv("SB_POOL_PGHOST")
PG_PORT = os.getenv("SB_POOL_PGPORT")
PG_DBNAME = os.getenv("SB_POOL_PGDATABASE")

oracle_card_table_def= """
CREATE TABLE IF NOT EXISTS oracle_card (
    id SERIAL PRIMARY KEY,
    oracle_id UUID UNIQUE NOT NULL,
    name TEXT NOT NULL,
    scryfall_uri TEXT NOT NULL,
    layout TEXT NOT NULL,
    image_uris JSONB,
    mana_cost TEXT,
    cmc FLOAT,
    type_line TEXT,
    card_faces JSONB,
    oracle_text TEXT,
    power TEXT,
    toughness TEXT,
    colors TEXT[],
    keywords TEXT[],
    games TEXT[]
);"""

ruling_table_def = """
CREATE TABLE IF NOT EXISTS ruling (
    id SERIAL PRIMARY KEY,
    oracle_id UUID references oracle_card(oracle_id),
    source TEXT NOT NULL,
    published_at DATE NOT NULL,
    comment TEXT NOT NULL
);"""

# Connect to the database
with psycopg2.connect(
    user=PG_USER,
    password=PG_PASSWORD,
    host=PG_HOST,
    port=PG_PORT,
    dbname=PG_DBNAME
) as conn, conn.cursor() as cur:
    # Check connection
    logging.info("Connection successful!")
    cur.execute("SELECT NOW();")
    result = cur.fetchone()
    logging.info("Current Time:")
    logging.info(result)

    # Create tables
    cur.execute(oracle_card_table_def)
    cur.execute(ruling_table_def)
    logging.info("Tables created.")

    # insert oracle cards
    execute_batch(cur, 
                """INSERT INTO oracle_card (oracle_id, name, scryfall_uri, layout, image_uris, mana_cost, cmc, type_line, card_faces, oracle_text, power, toughness, colors, keywords, games) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""", 
                [(c.oracle_id.hex, c.name, c.scryfall_uri, c.layout, json.dumps(c.image_uris) if c.image_uris else None, c.mana_cost, c.cmc, c.type_line, json.dumps(c.card_faces) if c.card_faces else None, c.oracle_text, c.power, c.toughness, c.colors, c.keywords, c.games) for c in cards])
    logging.info("Oracle cards inserted.")

    # insert rulings
    execute_batch(cur, 
                """INSERT INTO ruling (oracle_id, source, published_at, comment) 
                VALUES (%s, %s, %s, %s)""", 
                [(r.oracle_id.hex, r.source, r.published_at, r.comment) for r in rulings])
    logging.info("Rulings inserted.")
# Close the cursor and connection
logging.info("Connection closed.")
