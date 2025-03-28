import { Hono } from "hono";
import { sendResponse } from "../utils/response";
const adminRouter = new Hono();

console.log("request came: Admin");

adminRouter.get("/check", async (c) => {
  return sendResponse(c, 200, true, "working fine");
});


export default adminRouter;