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

    const body = await c.req.json();
    const { products: cartProducts, location } = body;

    if (!cartProducts || cartProducts.length === 0) {
      return sendResponse(c, 400, false, "No products provided");
    }

    const orderId = uuidv4();
    const totalAmount = cartProducts.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    const paymentSuccess = Math.random() < 0.98;
    const status = paymentSuccess ? "confirmed" : "failed";

    await db.insert(orders).values({
      id: orderId,
      user_id: user.id,
      total_price: totalAmount,
      location: location,
      status: status,
    });

    if (!paymentSuccess) {
      await db.insert(orderHistory).values({
        id: uuidv4(),
        order_id: orderId,
        status: "failed",
        changed_at: new Date(),
      });

      return sendResponse(
        c,
        402,
        false,
        "Payment failed, order not processed",
        {
          orderId,
        }
      );
    }

    
    const orderItemData = cartProducts.map((item: any) => ({
      id: uuidv4(),
      order_id: orderId,
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.price * item.quantity,
    }));

    await db.insert(orderItems).values(orderItemData);

    
    for (const item of cartProducts) {
      const product = await db
        .select()
        .from(products)
        .where(eq(products.id, item.id))
        .limit(1);

      if (!product.length) {
        return sendResponse(
          c,
          404,
          false,
          `Product with ID ${item.id} not found`
        );
      }

      const newQuantity = product[0].quantity - item.quantity;

      if (newQuantity < 0) {
        return sendResponse(
          c,
          400,
          false,
          `Insufficient stock for product ${item.id}`
        );
      }

      await db
        .update(products)
        .set({ quantity: newQuantity })
        .where(eq(products.id, item.id));
    }

    
    await db.insert(orderHistory).values({
      id: uuidv4(),
      order_id: orderId,
      status: "confirmed",
      changed_at: new Date(),
    });

    return sendResponse(c, 201, true, "Order placed successfully", {
      orderId,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    return sendResponse(c, 500, false, "Failed to place order");
  }
};