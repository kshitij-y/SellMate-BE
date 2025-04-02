import { Context } from "hono";
import { sendResponse } from "../utils/response";
import { db } from "../db";
import { cart } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const addToCart = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;
    const { product_id, title, price, quantity, image } = await c.req.json();

    const existingItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.user_id, user_id), eq(cart.product_id, product_id)))
      .limit(1);

    if (existingItem.length > 0) {
      await db
        .update(cart)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cart.id, existingItem[0].id));

      return sendResponse(c, 200, true, "Cart quantity updated successfully");
    }

    const result = await db.insert(cart).values({
      user_id,
      product_id,
      title,
      price,
      quantity,
      image,
    });

    return sendResponse(c, 201, true, "Product added to cart successfully", result);
  } catch (error) {
    console.error("Error adding to cart:", error);
    return sendResponse(c, 500, false, "Failed to add product to cart");
  }
};

export const removeFromCart = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;
    const body = await c.req.json();
    const { product_id }: { product_id: string } = body;

    if (!product_id) {
      return sendResponse(c, 400, false, "Product ID is required");
    }

    const cartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.user_id, user_id), eq(cart.product_id, product_id)))
      .limit(1);

    if (cartItem.length === 0) {
      return sendResponse(c, 404, false, "Product not found in cart");
    }

    await db
      .delete(cart)
      .where(and(eq(cart.user_id, user_id), eq(cart.product_id, product_id)));

    return sendResponse(c, 200, true, "Product removed from cart successfully");
  } catch (error) {
    console.error("Error removing from cart:", error);
    return sendResponse(c, 500, false, "Failed to remove product from cart");
  }
};

export const getCart = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;

    const cartItem = await db
      .select()
      .from(cart)
      .where(eq(cart.user_id, user_id));
    if (cartItem.length === 0) {
      return sendResponse(c, 200, true, "Cart not found");
    }

    
    return sendResponse(c, 200, true, "Cart retrieved successfully", cartItem);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return sendResponse(c, 500, false, "Failed to fetch cart");
  }
};

export const updateCartQuantity = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;
    const { product_id, quantity } = await c.req.json();

    if (quantity < 1) {
      return sendResponse(c, 400, false, "Quantity must be at least 1");
    }

    const updatedItem = await db
      .update(cart)
      .set({ quantity })
      .where(and(eq(cart.user_id, user_id), eq(cart.product_id, product_id)))
      .returning();

    if (updatedItem.length === 0) {
      return sendResponse(c, 404, false, "Item not found in cart");
    }

    return sendResponse(c, 200, true, "Cart quantity updated", updatedItem);
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return sendResponse(c, 500, false, "Failed to update cart quantity");
  }
};
