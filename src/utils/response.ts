import { Context } from "hono";
import { StatusCode } from "hono/utils/http-status";

export const sendResponse = (
  c: Context,
  status: StatusCode,
  success: boolean,
  message: string,
  data: any = null,
  error: any = null
) => {
  c.status(status);
  return c.json({
    success,
    message,
    data,
    error,
  });
};
