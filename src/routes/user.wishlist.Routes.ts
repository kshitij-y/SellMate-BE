import { Hono } from "hono";
import {
  getWishlist,
  addToWishlist,
  updateWishlist,
  removeFromWishlist,
} from "../controllers/user.wishlist.Controllers";

const wishlistRouter = new Hono();

wishlistRouter.post("/addwishlist", addToWishlist);
wishlistRouter.get("/getWishlist", getWishlist);
wishlistRouter.delete("/deleteList", removeFromWishlist);
// wishlistRouter.put("/updateWishlist", updateWishlist);

export default wishlistRouter;