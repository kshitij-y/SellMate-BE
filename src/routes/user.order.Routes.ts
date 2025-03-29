import { Hono } from "hono";
import {
  getUserOrders,
  getOrderById,
  getOrderHistoryById,
  placeOrder,
} from "../controllers/user.order.Controllers";

const ordersRouter = new Hono();


ordersRouter.get("/", getUserOrders);
ordersRouter.get("/:id", getOrderById);
ordersRouter.get("/history/:id", getOrderHistoryById);
ordersRouter.post("/", placeOrder);

export default ordersRouter;
