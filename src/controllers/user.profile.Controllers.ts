import { Context } from "hono";
import { sendResponse } from "../utils/response";
import { db } from "../db";
import { user, addresses } from "../db/schema";
import { eq } from "drizzle-orm";

export const getUserProfile = async (c: Context) => {
  try {
    const userData = c.get("user");
    if (!userData) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const userProfile = await db
      .select()
      .from(user)
      .where(eq(user.id, userData.id))
      .limit(1);

    if (!userProfile.length) {
      return sendResponse(c, 404, false, "User profile not found");
    }

    return sendResponse(
      c,
      200,
      true,
      "User profile fetched successfully",
      userProfile[0]
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return sendResponse(c, 500, false, "Failed to fetch user profile");
  }
};

export const updateUserProfile = async (c: Context) => {
  try {
    const userData = c.get("user");
    if (!userData) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const body = await c.req.json();
    const { name, image } = body;

    if (!name && !image) {
      return sendResponse(c, 400, false, "No fields provided for update");
    }

    const updatedFields = {
      ...(name && { name }),
      ...(image && { image }),
      updatedAt: new Date(),
    };

    await db.update(user).set(updatedFields).where(eq(user.id, userData.id));

    return sendResponse(c, 200, true, "User profile updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error);
    return sendResponse(c, 500, false, "Failed to update user profile");
  }
};