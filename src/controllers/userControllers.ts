import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { sendResponse } from "../utils/response.js";

export const addProduct = async (c: any) => {
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
