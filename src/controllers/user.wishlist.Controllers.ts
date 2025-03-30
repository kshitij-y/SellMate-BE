import { Context } from "hono";
import { sendResponse } from "../utils/response";
import { db } from "../db";
import { wishlist, products } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const addToWishlist = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const body = await c.req.json();
    const { product_id } = body;

    const existing = await db
      .select()
      .from(wishlist)
      .where(
        and(eq(wishlist.user_id, user_id), eq(wishlist.product_id, product_id))
      );

    if (existing.length > 0) {
      return sendResponse(c, 400, false, "Product already in wishlist");
    }

    const result = await db.insert(wishlist).values({
      user_id,
      product_id,
    });

    return sendResponse(c, 201, true, "Product added to wishlist", result);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    return sendResponse(c, 500, false, "Failed to add product to wishlist");
  }
};

export const getWishlist = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const result = await db
      .select({
        wishlist_id: wishlist.id,
        product_id: products.id,
        title: products.title,
        description: products.description,
        price: products.price,
        images: products.images,
        created_at: wishlist.created_at,
      })
      .from(wishlist)
      .innerJoin(products, eq(wishlist.product_id, products.id))
      .where(eq(wishlist.user_id, user_id));

    return sendResponse(c, 200, true, "Wishlist fetched successfully", result);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return sendResponse(c, 500, false, "Failed to fetch wishlist");
  }
};

export const updateWishlist = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const body = await c.req.json();
    const { wishlist_id, new_product_id } = body;

    const existingWishlist = await db
      .select()
      .from(wishlist)
      .where(and(eq(wishlist.id, wishlist_id), eq(wishlist.user_id, user_id)));

    if (existingWishlist.length === 0) {
      return sendResponse(c, 404, false, "Wishlist item not found");
    }

    const result = await db
      .update(wishlist)
      .set({
        product_id: new_product_id,
      })
      .where(and(eq(wishlist.id, wishlist_id), eq(wishlist.user_id, user_id)));

    return sendResponse(c, 200, true, "Wishlist updated successfully", result);
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return sendResponse(c, 500, false, "Failed to update wishlist");
  }
};

export const removeFromWishlist = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const body = await c.req.json();
    const { product_id } = body;

    const existing = await db
      .select()
      .from(wishlist)
      .where(
        and(eq(wishlist.user_id, user_id), eq(wishlist.product_id, product_id))
      );

    if (existing.length === 0) {
      return sendResponse(c, 404, false, "Product not found in wishlist");
    }

    const result = await db
      .delete(wishlist)
      .where(
        and(eq(wishlist.user_id, user_id), eq(wishlist.product_id, product_id))
      );

    return sendResponse(c, 200, true, "Product removed from wishlist", result);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return sendResponse(
      c,
      500,
      false,
      "Failed to remove product from wishlist"
    );
  }
};
