import { Hono } from "hono";
import productRouter from "./user.product.Routes";
import profileRouter from "./user.Profile.Routes";
import orderRouter from "./user.order.Routes";
import reviewRouter from "./user.review.Routes";
import wishlistRouter from "./user.wishlist.Routes";
import cartRouter from "./user.cart.Routes";
import addressRoute from "./user.address.Routes";
// import chatRouter from "./user.chat.Routes";
// import auctionRouter from "./user.auction.Routes";

const userRouter = new Hono();

userRouter.route("/products", productRouter);
userRouter.route("/profile", profileRouter);
userRouter.route("/orders", orderRouter);
userRouter.route("/reviews", reviewRouter);
userRouter.route("/wishlist", wishlistRouter);
userRouter.route("/cart", cartRouter);
userRouter.route("/address", addressRoute);

// // 💬 **Chat Routes**
// userRouter.route("/chat", chatRouter);

// // 🔥 **Auction Routes**
// userRouter.route("/auction", auctionRouter);

export default userRouter;
