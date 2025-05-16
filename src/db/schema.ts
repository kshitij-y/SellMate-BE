import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  boolean,
  integer,
  primaryKey,
  foreignKey,
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

export const category = pgTable(
  "category",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parent_cat_id: uuid("parent_cat_id"),
    cat_name: text("cat_name").notNull(),
  },
  (t) => [
    foreignKey({ columns: [t.parent_cat_id], foreignColumns: [t.id] }).onDelete(
      "set null"
    ),
  ]
);

export const variation = pgTable("variation", {
  id: uuid("id").defaultRandom().primaryKey(),
  category_id: uuid("category_id")
    .references(() => category.id)
    .notNull(),
  name: text("name").notNull(),
});

export const variation_option = pgTable("variation_option", {
  id: uuid("id").defaultRandom().primaryKey(),
  variation_id: uuid("variation_id")
    .references(() => variation.id)
    .notNull(),
  value: text("value").notNull(),
});

export const product = pgTable("product", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category_id: uuid("category_id").references(() => category.id),
});

export const product_item = pgTable("product_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_id: uuid("product_id")
    .references(() => product.id)
    .notNull(),
  sku: text("sku").notNull().unique(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const product_config = pgTable(
  "product_config",
  {
    product_item_id: uuid("product_item_id")
      .references(() => product_item.id)
      .notNull(),
    variation_option_id: uuid("variation_option_id")
      .references(() => variation_option.id)
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.product_item_id, t.variation_option_id] })]
);

export const product_image = pgTable("product_image", {
  id: uuid("id").defaultRandom().primaryKey(),
  product_item_id: uuid("product_item_id")
    .references(() => product_item.id)
    .notNull(),
  image_url: text("image_url").notNull(),
  position: integer("position").notNull(),
});

export const address = pgTable("address", {
  id: uuid("id").defaultRandom().primaryKey(),
  address_line1: text("address_line1").notNull(),
  address_line2: text("address_line2"),
  city: text("city").notNull(),
  pin_code: text("pin_code").notNull(),
  country: text("country").notNull(),
});

export const user_address = pgTable(
  "user_address",
  {
    user_id: text("user_id")
      .references(() => user.id)
      .notNull(),
    address_id: uuid("address_id")
      .references(() => address.id)
      .notNull(),
    default: boolean("default").notNull().default(false),
  },
  (t) => [primaryKey({ columns: [t.user_id, t.address_id] })]
);

export const wishlist = pgTable("wishlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id")
    .references(() => user.id)
    .notNull(),
});

export const wishlist_item = pgTable("wishlist_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  wishlist_id: uuid("wishlist_id")
    .references(() => wishlist.id)
    .notNull(),
  product_item_id: uuid("product_item_id")
    .references(() => product_item.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
});

export const cart = pgTable("cart", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id")
    .references(() => user.id)
    .notNull(),
});

export const cart_items = pgTable("cart_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  cart_id: uuid("cart_id")
    .references(() => cart.id)
    .notNull(),
  product_item_id: uuid("product_item_id")
    .references(() => product_item.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: text("user_id")
    .references(() => user.id)
    .notNull(),
  order_date: timestamp("order_date").defaultNow(),
  shipping_address_id: uuid("shipping_address_id")
    .references(() => address.id)
    .notNull(),
  total_amount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const order_items = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  product_item_id: uuid("product_item_id")
    .references(() => product_item.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    product_item_id: uuid("product_item_id")
      .notNull()
      .references(() => product_item.id, { onDelete: "cascade" }),

    user_id: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    rating: integer("rating").notNull(),
    comment: text(),

    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => [sql`CHECK (${table.rating} >= 1 AND ${table.rating} <= 5)`]
);

export const schema = {
  user,
  account,
  session,
  verification,
  jwks,
  product,
  product_item,
  product_config,
  product_image,
  category,
  variation,
  variation_option,
  orders,
  order_items,
  reviews,
  wishlist,
  wishlist_item,
  cart,
  cart_items,
  address,
  user_address,
};
