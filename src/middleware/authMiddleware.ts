import { Context, Next } from "hono";
import { auth } from "../utils/auth";
import { sendResponse } from "../utils/response";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return next();
    }

    console.log("Session found:", session);
    c.set("user", session.user);
    c.set("session", session.session);

    return next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return sendResponse(c, 401, false, "Authentication failed", null);
  }
};
