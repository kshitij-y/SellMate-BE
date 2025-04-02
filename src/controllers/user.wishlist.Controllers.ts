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
    const { product_id, title, price, image } = await c.req.json();

    const existingItem = await db
      .select()
      .from(wishlist)
      .where(
        and(eq(wishlist.user_id, user_id), eq(wishlist.product_id, product_id))
      )
      .limit(1);

    if (existingItem.length > 0) {
      return sendResponse(c, 400, false, "Product already in wishlist");
    }

    const result = await db.insert(wishlist).values({
      user_id,
      product_id,
      title,
      price,
      image,
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
      .select()
      .from(wishlist)
      .where(eq(wishlist.user_id, user_id));

    if (result.length === 0) {
      return sendResponse(c, 200, true, "Cart not found");
    }
    return sendResponse(c, 200, true, "Wishlist fetched successfully", result);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return sendResponse(c, 500, false, "Failed to fetch wishlist");
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
    if (!product_id) {
      return sendResponse(c, 400, false, "Product ID is required");
    }

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
