import { Hono } from "hono";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/user.wishlist.Controllers";

const wishlistRouter = new Hono();

wishlistRouter.post("/addwishlist", addToWishlist);
wishlistRouter.get("/getWishlist", getWishlist);
wishlistRouter.delete("/deleteList", removeFromWishlist);

export default wishlistRouter;