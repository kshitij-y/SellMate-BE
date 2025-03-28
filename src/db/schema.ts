import {
  pgTable,
  uuid,
  varchar,
  text,
  json,
  numeric,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
export const jwks = pgTable("jwks", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: varchar("title", { length: 255 }).notNull(),
  description: text(),
  category: json("category").notNull().default([]),
  condition: varchar("condition", { length: 20 }).notNull(),
  images: json("images").notNull().default([]),

  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  negotiable: boolean("negotiable").default(false),
  quantity: integer("quantity").notNull().default(1),

  is_auction: boolean("is_auction").default(false),
  starting_bid: numeric("starting_bid", { precision: 10, scale: 2 }),
  bid_increment: numeric("bid_increment", { precision: 10, scale: 2 }),
  auction_end_time: timestamp("auction_end_time", { withTimezone: true }),

  seller_id: text("seller_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" }),

  seller_name: varchar("seller_name", { length: 100 }).notNull(),
  seller_contact: varchar("seller_contact", { length: 100 }),

  status: varchar("status", { length: 20 }).notNull().default("available"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const schema = { user, account, session, verification, jwks, products };
