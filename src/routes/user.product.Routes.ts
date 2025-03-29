import { Hono } from "hono";
import {
  addProduct,
  showMyProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/user.product.Controllers";

const productRouter = new Hono();

productRouter.post("/addProduct", addProduct);
productRouter.get("/showMyProducts", showMyProducts);
productRouter.delete("/deleteProduct", deleteProduct);
productRouter.patch("/updateProduct", updateProduct);

export default productRouter;
