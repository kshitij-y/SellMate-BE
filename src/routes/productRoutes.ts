import { Hono } from "hono";
import { sendResponse } from "../utils/response";
import { allProducts, keySearch } from "../controllers/productController";
const productRouter = new Hono();

console.log("request came: Product");

productRouter.get("/check", async (c) => {
  return sendResponse(c, 200, true, "working fine");
});

productRouter.get("/allProducts", allProducts);
productRouter.get("/keySearch", keySearch);


export default productRouter;