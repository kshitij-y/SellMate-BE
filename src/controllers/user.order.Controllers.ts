import { Context } from "hono";
import { sendResponse } from "../utils/response";
import { db } from "../db";
import { orders, orderHistory, orderItems, products, payments } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";


export const getUserOrders = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.user_id, user.id));

    if (!userOrders.length) {
      return sendResponse(c, 404, false, "No orders found for this user");
    }

    return sendResponse(
      c,
      200,
      true,
      "Orders fetched successfully",
      userOrders
    );
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return sendResponse(c, 500, false, "Failed to fetch user orders");
  }
};

export const getOrderById = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const orderId = c.req.param("id");
    const order = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, orderId), eq(orders.user_id, user.id)))
      .limit(1);

    if (!order.length) {
      return sendResponse(c, 404, false, "Order not found");
    }

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.order_id, orderId));

    return sendResponse(c, 200, true, "Order fetched successfully", {
      ...order[0],
      items,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    return sendResponse(c, 500, false, "Failed to fetch order by ID");
  }
};

export const getOrderHistoryById = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const orderId = c.req.param("id");
    const history = await db
      .select()
      .from(orderHistory)
      .where(eq(orderHistory.order_id, orderId));

    if (!history.length) {
      return sendResponse(c, 404, false, "No history found for this order");
    }

    return sendResponse(
      c,
      200,
      true,
      "Order history fetched successfully",
      history
    );
  } catch (error) {
    console.error("Error fetching order history:", error);
    return sendResponse(c, 500, false, "Failed to fetch order history");
  }
};

export const placeOrder = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) {
      return sendResponse(c, 401, false, "Unauthorized: User not found");
    }

    const { cartItems, location } = await c.req.json();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return sendResponse(c, 400, false, "Cart is empty");
    }

    const orderId = uuidv4();
    let totalAmount = 0;

    for (const item of cartItems) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.product_id))
        .limit(1);

      if (!product) {
        return sendResponse(c, 404, false, `Product with ID ${item.product_id} not found`);
      }

      if (product.quantity < item.quantity) {
        return sendResponse(c, 400, false, `Insufficient stock for product ${item.product_id}`);
      }

      totalAmount += Number(product.price) * Number(item.quantity);
    }

    // Simulate Payment Success (98% Success Rate)
    const paymentSuccess = Math.random() < 0.98;
    const status = paymentSuccess ? "confirmed" : "failed";

    // Begin Transaction
    await db.transaction(async (trx) => {
      // Insert Order
      await trx.insert(orders).values({
        id: orderId,
        user_id: user.id,
        total_price: String(totalAmount),
        location,
        status,
      });

      if (!paymentSuccess) {
        await trx.insert(orderHistory).values({
          id: uuidv4(),
          order_id: orderId,
          status: "failed",
          changed_at: new Date(),
        });

        throw new Error("Payment failed, order not processed");
      }

      // Insert Order Items
      const orderItemsData = cartItems.map((item) => ({
        id: uuidv4(),
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: String(item.price),
        subtotal: String(item.price * item.quantity),
      }));

      await trx.insert(orderItems).values(orderItemsData);

      // Update Product Stock
      for (const item of cartItems) {
        await trx
          .update(products)
          .set({ quantity: Number(products.quantity) - item.quantity })
          .where(eq(products.id, item.product_id));
      }

      // Add Order History
      await trx.insert(orderHistory).values({
        id: uuidv4(),
        order_id: orderId,
        status: "confirmed",
        changed_at: new Date(),
      });
    });

    return sendResponse(c, 201, true, "Order placed successfully", { orderId });
  } catch (error: any) {
    console.error("Error placing order:", error);
    return sendResponse(c, 500, false, error.message || "Failed to place order");
  }

};
