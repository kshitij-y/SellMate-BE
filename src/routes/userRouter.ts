import { Hono } from "hono";
import { sendResponse } from "../utils/response";
import {
  addProduct,
  showMyProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/user.product.Controllers";
const userRouter = new Hono();

console.log("request came: add Product");

userRouter.get('/check', async (c) => {
    
  return sendResponse(c, 200, true, "working fine");
});

userRouter.post("/addProduct", addProduct);
userRouter.get("/showMyProducts", showMyProducts);
userRouter.delete("/deleteProduct", deleteProduct);
userRouter.patch("/updateProduct", updateProduct);

export default userRouter;