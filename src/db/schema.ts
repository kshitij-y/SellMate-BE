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
    jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const products = pgTable("products", {
    id: uuid().primaryKey().defaultRandom(),

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
        .references(() => user.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),

    seller_name: varchar("seller_name", { length: 100 }).notNull(),
    seller_contact: varchar("seller_contact", { length: 100 }),

    status: varchar("status", { length: 20 }).notNull().default("available"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").notNull(),
    total_price: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("pending"),
    location: json("location").notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),

    order_id: uuid("order_id")
        .notNull()
        .references(() => orders.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),

    product_id: uuid("product_id")
        .notNull()
        .references(() => products.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        }),

    quantity: integer("quantity").notNull().default(1),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

export const orderHistory = pgTable("order_history", {
  id: uuid("id").primaryKey().defaultRandom(),

  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),

  status: varchar("status", { length: 20 }).notNull(),
  changed_at: timestamp("changed_at").defaultNow(),

  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable(
    "reviews",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        product_id: uuid("product_id")
            .notNull()
            .references(() => products.id, { onDelete: "cascade" }),

        user_id: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),

        rating: integer("rating").notNull(),
        comment: text(),

        created_at: timestamp("created_at").defaultNow(),
        updated_at: timestamp("updated_at").defaultNow(),
    },
    (table) => [
        sql`CHECK (${table.rating} >= 1 AND ${table.rating} <= 5)`, // Updated to new syntax
    ]
);



export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    order_id: uuid("order_id").notNull(),
    user_id: uuid("user_id").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("pending"), // "success", "failed", "pending"
    method: varchar("method", { length: 50 }).notNull(), // "COD", "pseudo", "gateway"
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
export const wishlist = pgTable("wishlist", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    product_id: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    image: varchar("image", { length: 255 }).notNull(),
});

export const cart = pgTable("cart", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    product_id: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull().default(1),
    image: varchar("image", { length: 255 }).notNull(),
});

export const addresses = pgTable("addresses", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    country: varchar("country", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }),
    city: varchar("city", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    postal_code: varchar("postal_code", { length: 20 }),
    address: varchar("address", { length: 255 }).notNull(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});
export const schema = {
    user,
    account,
    session,
    verification,
    jwks,
    products,
    orders,
    orderItems,
    reviews,
    orderHistory,
    payments,
    wishlist,
    cart,
    addresses,
};
