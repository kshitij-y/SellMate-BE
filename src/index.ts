import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from "hono/cors";
import { auth } from './utils/auth.js';
import { authMiddleware } from "./middleware/authMiddleware";

//routers
import userRouter from './routes/userRouter.js';
import adminRouter from './routes/adminRoutes.js';
import productRouter from './routes/productRoutes.js';
import { sendResponse } from './utils/response.js';


const app = new Hono();
app.use("*", async (c, next) => {
  const method = c.req.method; 
  const url = c.req.url;
  console.log(`[${new Date().toISOString()}] ${method} request to ${url}`);
  await next();
});

app.use(
  cors({
    origin: "http://localhost:3001",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  console.log("req came");
  return auth.handler(c.req.raw);
});

app.use("/api/user/*", authMiddleware);
app.use("/api/admin/*", authMiddleware);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})


app.route("/api/user", userRouter);
app.route("/api/admin", adminRouter);
app.route("/api/product", productRouter);

app.notFound((c) => {
  return sendResponse(c, 404, false, "Route not found",);
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
