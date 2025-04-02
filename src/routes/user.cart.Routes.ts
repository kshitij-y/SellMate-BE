import { Hono } from "hono";
import { addToCart, getCart, removeFromCart, updateCartQuantity } from "../controllers/user.cart.Controllers";

const cartRouter = new Hono();

cartRouter.get("/getCart", getCart);
cartRouter.post("/addToCart", addToCart);
cartRouter.patch("/updateCartQuantity", updateCartQuantity);
cartRouter.delete("/removeFromCart", removeFromCart);

export default cartRouter;
