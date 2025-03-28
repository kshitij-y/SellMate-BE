import { Context } from "hono";
import { db } from "../db/index.js";
import { products } from "../db/schema.js";
import { sendResponse } from "../utils/response.js";
import { ilike, like, or, and, sql } from "drizzle-orm";


export const allProducts = async (c: Context) => {
  try {
    const { page = 1, limit = 10 } = c.req.query();

    const pageNumber = parseInt(page as string) || 1;
    const pageSize = parseInt(limit as string) || 10;
    const offset = (pageNumber - 1) * pageSize;

    // Fetch paginated products
    const result = await db
      .select()
      .from(products)
      .limit(pageSize)
      .offset(offset);

    // Fetch the total count using raw SQL
    const total = await db.execute(
      sql<number>`SELECT COUNT(*) AS total FROM "products"`
    );
    const totalCount = Number(total[0]?.total) || 0;
    const totalPages = Math.ceil(Number(totalCount) / pageSize);

    return sendResponse(c, 200, true, "Products fetched successfully", {
      data: result,
      currentPage: pageNumber,
      totalPages,
      totalCount,
    });
  } catch (error: unknown) {
    console.error("Error fetching products:", error);
    return sendResponse(c, 500, false, "Failed to fetch products");
  }
};

export const keySearch = async (c: Context) => {
  try {
    const query = c.req.query();
    const keyword = query.keyword || "";
    const pageNumber = parseInt(query.page) || 1;
    const pageSize = parseInt(query.limit) || 10;

    const offset = (pageNumber - 1) * pageSize;

    const result = await db.execute(
      sql`
        SELECT *
        FROM products
        WHERE 
          title ILIKE ${`%${keyword}%`} OR
          description ILIKE ${`%${keyword}%`} OR
          seller_name ILIKE ${`%${keyword}%`} OR
          status ILIKE ${`%${keyword}%`} OR
          EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(products.category::jsonb) AS cat
            WHERE cat ILIKE ${`%${keyword}%`}
          ) OR
          EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(products.images::jsonb) AS img
            WHERE img ILIKE ${`%${keyword}%`}
          )
        LIMIT ${pageSize}
        OFFSET ${offset}
      `
    );

    // ✅ Count query for pagination
    const total = await db.execute(
      sql`
        SELECT COUNT(*) AS count
        FROM products
        WHERE 
          title ILIKE ${`%${keyword}%`} OR
          description ILIKE ${`%${keyword}%`} OR
          seller_name ILIKE ${`%${keyword}%`} OR
          status ILIKE ${`%${keyword}%`} OR
          EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(products.category::jsonb) AS cat
            WHERE cat ILIKE ${`%${keyword}%`}
          ) OR
          EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(products.images::jsonb) AS img
            WHERE img ILIKE ${`%${keyword}%`}
          )
      `
    );

    const totalCount = total[0]?.count || 0;
    const totalPages = Math.ceil(Number(totalCount) / pageSize);

    return sendResponse(c, 200, true, "Search results fetched successfully", {
      data: result,
      currentPage: pageNumber,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error in key search:", error);
    return sendResponse(c, 500, false, "Failed to fetch search results");
  }
};