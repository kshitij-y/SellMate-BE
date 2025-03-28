import { Hono } from "hono";
import { sendResponse } from "../utils/response";
const productRouter = new Hono();

console.log("request came: Product");

productRouter.get("/check", async (c) => {
  return sendResponse(c, 200, true, "working fine");
});


export default productRouter;