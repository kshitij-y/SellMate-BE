import { Context } from "hono";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { sendResponse } from "../utils/response.js";
import { eq, and } from "drizzle-orm";

export const addProduct = async (c: Context) => {
  try {
    const body = await c.req.json();

    const user = c.get("user");

    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const seller_id = user.id;
    const seller_name = user.name;

    const {
      title,
      description,
      category,
      condition,
      images,
      price,
      negotiable,
      quantity,
      is_auction,
      starting_bid,
      bid_increment,
      auction_end_time,
      seller_contact,
      status,
    } = body;

    if (!title || !condition || !price) {
      return sendResponse(c, 400, false, "Missing required fields");
    }

    const productData = {
      title,
      description,
      category,
      condition,
      images,
      price,
      negotiable,
      quantity,
      is_auction,
      starting_bid: is_auction ? starting_bid : null,
      bid_increment: is_auction ? bid_increment : null,
      auction_end_time: is_auction ? auction_end_time : null,
      seller_id,
      seller_name,
      seller_contact,
      status: status || "available",
      created_at: new Date(),
      updated_at: new Date(),
    };

    console.log(productData);

    const result = await db.insert(products).values(productData).returning();

    return sendResponse(c, 201, true, "Product added successfully", result);
  } catch (error) {
    console.error("Error adding product:", error);
    return sendResponse(c, 500, false, "Failed to add product");
  }
};

export const showMyProducts = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      throw new Error("No user found");
    }
    const seller_id = user.id;
    const allProducts = await db
      .select()
      .from(products)
      .where(eq(products.seller_id, seller_id));

    if (allProducts.length === 0) {
      return sendResponse(c, 200, true, "No products found", []);
    }

    return sendResponse(
      c,
      200,
      true,
      "Products fetched successfully",
      allProducts
    );
  } catch (error: unknown) {
    console.error("Error fetching product: ", error);
    return sendResponse(c, 200, false, "Failed to fetch the product");
  }
};

export const deleteProduct = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }
    const body = await c.req.json();
    const product_id = body.id;
    if (!product_id) {
      return sendResponse(c, 400, false, "Product ID is required");
    }

    const seller_id = user.id;

    const result = await db
      .delete(products)
      .where(
        and(eq(products.seller_id, seller_id), eq(products.id, product_id))
      )
      .returning();

    if (result.length === 0) {
      return sendResponse(
        c,
        404,
        false,
        "Product not found or unauthorized to delete"
      );
    }

    return sendResponse(c, 200, true, "Product deleted successfully");
  } catch (error: unknown) {
    console.error("Error deleting the product:", error);
    return sendResponse(c, 500, false, "Failed to delete the product");
  }
};

export const updateProduct = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const seller_id = user.id;
    const body = await c.req.json();
    const product_id = body.id;

    if (!product_id) {
      return sendResponse(c, 400, false, "Product ID is required");
    }

    const { id, ...updateData } = body;

    if (Object.keys(updateData).length === 0) {
      return sendResponse(c, 400, false, "No fields to update");
    }

    const result = await db
      .update(products)
      .set(updateData)
      .where(
        and(eq(products.seller_id, seller_id), eq(products.id, product_id))
      )
      .returning();

    if (result.length === 0) {
      return sendResponse(
        c,
        404,
        false,
        "Product not found or unauthorized to update"
      );
    }

    return sendResponse(
      c,
      200,
      true,
      "Product updated successfully",
      result[0]
    );
  } catch (error: unknown) {
    console.error("Error updating the product:", error);
    return sendResponse(c, 500, false, "Failed to update the product");
  }
};
