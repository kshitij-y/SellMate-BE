import { Context } from "hono";
import { sendResponse } from "../utils/response";
import { db } from "../db";
import { reviews } from "../db/schema";
import { eq } from "drizzle-orm";

export const addReview = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const body = await c.req.json();
    const { product_id, rating, comment } = body;

    const result = await db.insert(reviews).values({
      product_id: product_id,
      user_id: user_id,
      rating,
      comment,
    });

    return sendResponse(c, 201, true, "review added successfully", result);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return sendResponse(c, 500, false, "Failed to add review");
  }
};

export const getReviewsByProduct = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { product_id } = body;

    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.product_id, product_id));

    return sendResponse(c, 201, true, "review added successfully", result);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return sendResponse(c, 500, false, "Failed to fetch reviews");
  }
};

export const updateReview = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const body = await c.req.json();
    const { review_id, rating, comment } = body;

    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, review_id));

    if (!existingReview.length || existingReview[0].user_id !== user_id) {
      return sendResponse(c, 403, false, "Unauthorized to update this review");
    }

    const result = await db
      .update(reviews)
      .set({
        rating,
        comment,
        updated_at: new Date(),
      })
      .where(eq(reviews.id, review_id));

    return sendResponse(c, 200, true, "Review updated successfully", result);
  } catch (error) {
    console.error("Error updating review:", error);
    return sendResponse(c, 500, false, "Failed to update review");
  }
};

export const deleteReview = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const user_id = user.id;

    const body = await c.req.json();
    const { review_id } = body;

    const existingReview = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, review_id));

    if (!existingReview.length || existingReview[0].user_id !== user_id) {
      return sendResponse(c, 403, false, "Unauthorized to delete this review");
    }

    const result = await db.delete(reviews).where(eq(reviews.id, review_id));

    return sendResponse(c, 200, true, "Review deleted successfully", result);
  } catch (error) {
    console.error("Error deleting review:", error);
    return sendResponse(c, 500, false, "Failed to delete review");
  }
};