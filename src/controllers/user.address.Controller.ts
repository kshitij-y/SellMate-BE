import { Context } from "hono";
import { sendResponse } from "../utils/response";
import { db } from "../db";
import { addresses } from "../db/schema";
import { eq } from "drizzle-orm";

export const getAddress = async (c: Context) => {
  try {
    const user = c.get("user");

    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;

    const address = await db
      .select()
      .from(addresses)
      .where(eq(addresses.user_id, user_id))
      .limit(1);

    if (address.length === 0) {
      return sendResponse(c, 404, false, "No address found for this user");
    }

    return sendResponse(
      c,
      200,
      true,
      "Address retrieved successfully",
      address[0]
    );
  } catch (error) {
    console.error("Error retrieving address:", error);
    return sendResponse(c, 500, false, "Failed to retrieve address");
  }
};

export const addAddress = async (c: Context) => {
  try {
    const user = c.get("user");

    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;
    const body = await c.req.json();

    const { country, state, city, phone, postal_code, address } = body;

    if (!country || !city || !address) {
      return sendResponse(c, 400, false, "Missing required fields");
    }

    const existingAddress = await db
      .select()
      .from(addresses)
      .where(eq(addresses.user_id, user_id));

    if (existingAddress.length > 0) {
      return sendResponse(
        c,
        409,
        false,
        "Address already exists for this user"
      );
    }

    await db.insert(addresses).values({
      user_id,
      country,
      state,
      city,
      phone,
      postal_code,
      address,
    });

    return sendResponse(c, 201, true, "Address added successfully");
  } catch (error) {
    console.error("Error adding address:", error);
    return sendResponse(c, 500, false, "Failed to add address");
  }
};

export const updateAddress = async (c: Context) => {
  try {
    const user = c.get("user");

    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const user_id = user.id;
    const body = await c.req.json();

    if (!body || Object.keys(body).length === 0) {
      return sendResponse(c, 400, false, "No fields provided for update");
    }

    const updateFields: Record<string, any> = {};
    if (body.country) updateFields.country = body.country;
    if (body.state) updateFields.state = body.state;
    if (body.city) updateFields.city = body.city;
    if (body.phone) updateFields.phone = body.phone;
    if (body.postal_code) updateFields.postal_code = body.postal_code;
    if (body.address) updateFields.address = body.address;
    updateFields.updated_at = new Date(); 

    const existingAddress = await db
      .select()
      .from(addresses)
      .where(eq(addresses.user_id, user_id));

    if (existingAddress.length === 0) {
      return sendResponse(c, 404, false, "No address found to update");
    }

    if (Object.keys(updateFields).length > 0) {
      const result = await db
        .update(addresses)
        .set(updateFields)
        .where(eq(addresses.user_id, user_id));

      return sendResponse(c, 200, true, "Address updated successfully", result);
    }

    return sendResponse(c, 400, false, "No valid fields provided for update");
  } catch (error) {
    console.error("Error updating address:", error);
    return sendResponse(c, 500, false, "Failed to update address");
  }
};