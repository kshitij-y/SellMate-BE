import { Hono } from "hono";
import productRouter from "./user.product.Routes";
import profileRouter from "./user.Profile.Routes";
import orderRouter from "./user.order.Routes";
// import reviewRouter from "./user.review.Routes";
// import wishlistRouter from "./user.wishlist.Routes";
// import cartRouter from "./user.cart.Routes";
// import chatRouter from "./user.chat.Routes";
// import auctionRouter from "./user.auction.Routes";

const userRouter = new Hono();

userRouter.route("/products", productRouter);
userRouter.route("/profile", profileRouter);
userRouter.route("/orders", orderRouter);

// // 📦 **Order Routes**

// // ⭐ **Review Routes**
// userRouter.route("/reviews", reviewRouter);

// // 💙 **Wishlist Routes**
// userRouter.route("/wishlist", wishlistRouter);

// // 🛍️ **Cart Routes**
// userRouter.route("/cart", cartRouter);

// // 💬 **Chat Routes**
// userRouter.route("/chat", chatRouter);

// // 🔥 **Auction Routes**
// userRouter.route("/auction", auctionRouter);

export default userRouter;
