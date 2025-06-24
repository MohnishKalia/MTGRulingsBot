CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" bigint,
	"id_token" text,
	"scope" text,
	"session_state" text,
	"token_type" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oracle_card" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oracle_id" uuid NOT NULL,
	"name" text NOT NULL,
	"released_at" date NOT NULL,
	"scryfall_uri" text NOT NULL,
	"layout" text NOT NULL,
	"image_uris" json,
	"mana_cost" text,
	"cmc" double precision,
	"type_line" text,
	"card_faces" json,
	"oracle_text" text,
	"power" text,
	"toughness" text,
	"colors" text[],
	"keywords" text[],
	"games" text[],
	"edhrec_rank" integer,
	CONSTRAINT "oracle_card_oracle_id_unique" UNIQUE("oracle_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ruling" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"oracle_id" uuid,
	"source" text NOT NULL,
	"published_at" date NOT NULL,
	"comment" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verification_token" (
	"identifier" text NOT NULL,
	"expires" timestamp NOT NULL,
	"token" text NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ruling" ADD CONSTRAINT "ruling_oracle_id_oracle_card_oracle_id_fk" FOREIGN KEY ("oracle_id") REFERENCES "public"."oracle_card"("oracle_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
