import type { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  bigint,
  date,
  doublePrecision,
  integer,
} from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  emailVerified: timestamp('emailVerified'),
  password: varchar('password', { length: 255 }),
  image: text('image'),
});

export type User = InferSelectModel<typeof user>;

export const verificationToken = pgTable(
  'verification_token',
  {
    identifier: text('identifier').notNull(),
    expires: timestamp('expires').notNull(),
    token: text('token').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.identifier, table.token] }),
  }),
);

export type VerificationToken = InferSelectModel<typeof verificationToken>;

export const account = pgTable('accounts', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId')
            .notNull()
            .references(() => user.id),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: bigint('expires_at', { mode: 'bigint' }),
  id_token: text('id_token'),
  scope: text('scope'),
  session_state: text('session_state'),
  token_type: text('token_type'),
});

export type Account = InferSelectModel<typeof account>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId')
      .notNull()
      .references(() => chat.id),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.chatId, table.messageId] }),
    };
  },
);

export type Vote = InferSelectModel<typeof vote>;

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    createdAt: timestamp('createdAt').notNull(),
    title: text('title').notNull(),
    content: text('content'),
    kind: varchar('text', { enum: ['text', 'code', 'image', 'sheet'] })
      .notNull()
      .default('text'),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.id, table.createdAt] }),
    };
  },
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').notNull().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.id] }),
    documentRef: foreignKey({
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  }),
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const oracleCard = pgTable('oracle_card', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  oracleId: uuid('oracle_id').unique().notNull(),
  name: text('name').notNull(),
  releasedAt: date('released_at').notNull(),
  scryfallUri: text('scryfall_uri').notNull(),
  layout: text('layout').notNull(),
  imageUris: json('image_uris'), // JSONB column
  manaCost: text('mana_cost'),
  cmc: doublePrecision('cmc'),
  typeLine: text('type_line'),
  cardFaces: json('card_faces'),
  oracleText: text('oracle_text'),
  power: text('power'),
  toughness: text('toughness'),
  colors: text('colors').array(),
  keywords: text('keywords').array(),
  games: text('games').array(),
  edhrecRank: integer('edhrec_rank'),
});

export type OracleCard = InferSelectModel<typeof oracleCard>;

export const ruling = pgTable('ruling', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  oracleId: uuid('oracle_id')
    .references(() => oracleCard.oracleId),
  source: text('source').notNull(),
  publishedAt: date('published_at').notNull(),
  comment: text('comment').notNull(),
});

export type Ruling = InferSelectModel<typeof ruling>;
