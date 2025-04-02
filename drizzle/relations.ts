import { relations } from "drizzle-orm/relations";
import { orders, orderHistory, orderItems, products, reviews, user, wishlist, account, session, addresses } from "./schema";

export const orderHistoryRelations = relations(orderHistory, ({one}) => ({
	order: one(orders, {
		fields: [orderHistory.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	orderHistories: many(orderHistory),
	orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	orderItems: many(orderItems),
	reviews: many(reviews),
	user: one(user, {
		fields: [products.sellerId],
		references: [user.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id]
	}),
	user: one(user, {
		fields: [reviews.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	reviews: many(reviews),
	wishlists: many(wishlist),
	accounts: many(account),
	sessions: many(session),
	addresses: many(addresses),
	products: many(products),
}));

export const wishlistRelations = relations(wishlist, ({one}) => ({
	user: one(user, {
		fields: [wishlist.userId],
		references: [user.id]
	}),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	user: one(user, {
		fields: [addresses.userId],
		references: [user.id]
	}),
}));