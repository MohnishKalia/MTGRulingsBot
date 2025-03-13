import json
import re
import uuid
import numpy as np
from upstash_vector import Index, Vector
import logging
import dotenv

"""
This script processes the Magic: The Gathering Comprehensive Rules document.
It extracts and organizes its Table of Contents (TOC), rules, and glossary sections. 
It then indexes these sections using the Upstash Vector service.


This script assumes: 
- no sections above 999.
- section numbers are consistent (for big_headers defs)
- no major layout shifts in the document (*_end_marker)
"""

dotenv.load_dotenv('.env.local')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Load the data
with open("./ref_files/MagicCompRules.txt", encoding="utf-8") as f:
    cr_content = f.read()

# Define markers for TOC, rules, and glossary sections
toc_end_marker = "\nGlossary\n\nCredits\n\n"
rules_end_marker = ".\n\nGlossary\n\n"
gloss_end_marker = ".\n\n\nCredits"

# Extract TOC entries
toc_pattern = re.compile(f"^(.*?){re.escape(toc_end_marker)}", re.DOTALL)
toc_match = toc_pattern.search(cr_content)
if not toc_match:
    raise AssertionError("Beginning of TOC document not found.")
toc_extracted_text = toc_match.group(1).strip()
if not toc_extracted_text:
    raise AssertionError("Beginning of TOC document content empty.")
logging.info("TOC entries:")
logging.info(toc_extracted_text)
with open("./ref_files/toc_entries.txt", "w") as f:
    f.write(toc_extracted_text)

# Extract rules entries
rules_pattern = re.compile(f"{re.escape(toc_end_marker)}(.*?){re.escape(rules_end_marker)}", re.DOTALL)
rules_match = rules_pattern.search(cr_content)
if not rules_match:
    raise AssertionError("Rules part of document not found.")
rules_extracted_text = rules_match.group(1).strip()
if not rules_extracted_text:
    raise AssertionError("Rules part of document content empty.")
individual_rules = [rule.strip() for rule in re.split("\n{2,}", rules_extracted_text)]
logging.info("Rules count: %d",len(individual_rules))
# print first 5 rules and last 3 rules
logging.info(json.dumps(individual_rules[:5], indent=4))
logging.info("...skipping...")
logging.info(json.dumps(individual_rules[-3:], indent=4))
# top 5 rules by length
logging.info("Top 5 rules by length:")
logging.info(json.dumps(sorted(individual_rules, key=len, reverse=True)[:5], indent=4))
rules_parsed = [
    {
        "rule": rule,
        "header": header,
        "header_length": len(header)
    }
    for rule, header in [
        (rule, re.search(r"^([\w\.]+) ", rule).group(1).strip())
        for rule in individual_rules
    ]
]

# go through rules_parsed and group them together if they are a,b,c, etc.
# if header length is less than 4, skip
# if header length is 4, start a new header group
# if header length is 6+ and ends with a period, add to current header group
# for all levels above, print current_group if not empty and start a new current_group
# if header length is 6+ and does not end with a period, add to current header group, or print out directly if in big_headers
# at very end, flush current_group
grouped_rules = []
current_group = []
current_header = None
big_headers = [
    "107.3", "123.6", "205.3", "206.3", "508.1", "509.1", "601.2", "607.2", 
    "608.2", "611.2", "702.16", "702.19", "702.26", "704.5", "707.9", "707.10", 
    "800.4", "807.4"
]
for rule_data in rules_parsed:
    if rule_data["header_length"] < 4:
        # current_superheader = rule_data["header"]
        # grouped_rules_grouped.append(rule)
        if current_group:
            grouped_rules.append(f"...under section {current_header}:\n\n" + "\n\n".join([rd["rule"] for rd in current_group]))
            current_group = []
        continue
    elif rule_data["header_length"] == 4:
        # print("4:",rule_data)
        if current_group:
            grouped_rules.append(f"...under section {current_header}:\n\n" + "\n\n".join([rd["rule"] for rd in current_group]))
            current_group = []
        current_header = rule_data["rule"]
    elif rule_data["header_length"] >= 6 and rule_data["header"].endswith("."):
        # print("6.:",rule_data)
        if current_group:
            grouped_rules.append(f"...under section {current_header}:\n\n" + "\n\n".join([rd["rule"] for rd in current_group]))
            current_group = []
        current_group.append(rule_data)
    else:
        # print("6a:",rule_data)
        current_group.append(rule_data)
        # override grouping logic for big subheaders
        if any([rule_data["header"].startswith(bh) for bh in big_headers]):
            grouped_rules.append(f"...under section {current_header}:\n\n" + "\n\n".join([rd["rule"] for rd in current_group]))
            current_group = []
if current_group:
    grouped_rules.append(f"...under section {current_header}:\n\n" + "\n\n".join([rd["rule"] for rd in current_group]))
    current_group = []

# concat records with header length greater than 4 until you reach another record with header length 4, then start again
# for rule_data in rules_parsed:
#     if rule_data["header_length"] < 4:
#         continue
#         # grouped_rules.append(rule)
#     elif rule_data["header_length"] == 4:
#         # reset current_group
#         if current_group:
#             # print(current_group)
#             grouped_rules.append("\n\n".join([rd["rule"] for rd in current_group]))
#             current_group = []
#         # start new current_group
#         current_group.append(rule_data)
#     else:
#         if current_group:
#             current_group.append(rule_data)

# print first 5 grouped rules and last 3 grouped rules based on header length
sorted_grouped_rules = sorted([(r[:100], len(r)) for r in grouped_rules], key=lambda x: x[1])
logging.info("Grouped rules based on header length:")
logging.info(json.dumps(sorted_grouped_rules[:5], indent=4))
logging.info("...skipping...")
logging.info(json.dumps(sorted_grouped_rules[-3:], indent=4))
# print all sorted rules with length over RULES_MAX_LENGTH
RULES_MAX_LENGTH = 4000
logging.info(f"Grouped rules with length over {RULES_MAX_LENGTH}:")
logging.info(json.dumps([re.search(r"\n\n([\w\.]+) ", r[0]).group(1).strip() for r in sorted_grouped_rules if r[1] > RULES_MAX_LENGTH], indent=4))
json.dump(grouped_rules, open("./ref_files/grouped_rules.json", "w"), indent=4)

# Extract glossary entries
gloss_pattern = re.compile(f"{re.escape(rules_end_marker)}(.*?){re.escape(gloss_end_marker)}", re.DOTALL)
gloss_match = gloss_pattern.search(cr_content)
if not gloss_match:
    raise AssertionError("Glossary part of document not found.")
gloss_extracted_text = gloss_match.group(1).strip()
if not gloss_extracted_text:
    raise AssertionError("Glossary part of document content empty.")
glossary_entries = [entry.strip() for entry in re.split("\n{2,}", gloss_extracted_text)]
logging.info("Glossary entries count: %d",len(glossary_entries))
# print first 5 glossary entries and last 3 glossary entries
sorted_glossary_entries = sorted([(r[:100], len(r)) for r in glossary_entries], key=lambda x: x[1])
logging.info(json.dumps(sorted_glossary_entries[:5], indent=4))
logging.info("...skipping...")
logging.info(json.dumps(sorted_glossary_entries[-3:], indent=4))

index = Index.from_env()
logging.info("Index info:")
logging.info(index.info())

# index.create(namespace="cr")
logging.info("Indexing rules...")
rules_batches = np.array_split(grouped_rules, 50)
for i, batch in enumerate(rules_batches, start=1):
    index.upsert(
        vectors=[
            Vector(
                id=str(uuid.uuid4()),
                data=rule_data,
            )
            for rule_data in batch
        ],
        namespace="cr",
    )
    logging.info(f"Indexed rules batch {i}/{len(rules_batches)}")

# index.create(namespace="gls")
logging.info("Indexing glossary...")
glossary_batches = np.array_split(glossary_entries, 10)
for i, batch in enumerate(glossary_batches, start=1):
    index.upsert(
        vectors=[
            Vector(
                id=str(uuid.uuid4()),
                data=entry,
            )
            for entry in batch
        ],
        namespace="gls",
    )
    logging.info(f"Indexed glossary batch {i}/{len(glossary_batches)}")

logging.info("Indexing complete.")