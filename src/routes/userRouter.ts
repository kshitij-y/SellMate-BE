import { Hono } from "hono";
import { sendResponse } from "../utils/response";
import { addProduct } from "../controllers/userControllers";
const userRouter = new Hono();

console.log("request came: add Product");

userRouter.get('/check', async (c) => {
    
  return sendResponse(c, 200, true, "working fine");
});

userRouter.post("/addProduct", addProduct);

export default userRouter;